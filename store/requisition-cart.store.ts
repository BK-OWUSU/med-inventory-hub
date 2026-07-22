import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { CreateOrderInput, CreateOrderItemInput } from '@/types/schemas/order.schema';
import { OrderType } from '@/generated/prisma/browser';


export interface CartItem {
  inventoryId: string;
  drugName: string;
  drugId: string;
  strength: string;
  dosageForm: string;
  unit: string;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  batchNo: string;
  unitPriceNumber: number;
  unitPriceDisplay: string;
  quantity: number;
  availableQuantity: number; 
  minStockLevel: number;    
  expiryDate: string | Date | null;
}

interface RequisitionCartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (inventoryId: string) => void;
  updateQuantity: (inventoryId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  prepareOrderPayloads: () => CreateOrderInput[];
}

export const useRequisitionCartStore = create<RequisitionCartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        // 1. HARD BLOCK: Check if the drug batch is expired
        if (newItem.expiryDate && new Date(newItem.expiryDate) < new Date()) {
          toast.error(`Cannot add ${newItem.drugName} (Batch: ${newItem.batchNo}). This batch has expired.`);
          return;
        }
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.inventoryId === newItem.inventoryId
          );
          
          const currentQtyInCart = existingIndex > -1 ? state.items[existingIndex].quantity : 0;
          const proposedTotalQty = currentQtyInCart + newItem.quantity;

          // 1. HARD BLOCK: Cannot order more than physical available stock
          if (proposedTotalQty > newItem.availableQuantity) {
            toast.error(`Cannot add more. Only ${newItem.availableQuantity} units available in stock.`);
            return state; 
          }

          // 2. WARNING CHECK: Dips supplying facility at or below min stock level
          const remainingStock = newItem.availableQuantity - proposedTotalQty;
          if (remainingStock <= newItem.minStockLevel) {
            toast.warning(`Warning: Fulfilling this request will dip ${newItem.facilityName} below its minimum stock level (${newItem.minStockLevel}).`);
          }

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: proposedTotalQty,
            };
            return { items: updated };
          }
          
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (inventoryId) => {
        set((state) => ({
          items: state.items.filter((i) => i.inventoryId !== inventoryId),
        }));
      },

      updateQuantity: (inventoryId, quantity) => {
        const item = get().items.find((i) => i.inventoryId === inventoryId);
        if (!item) return;

        const targetQuantity = Math.max(1, quantity);

        // 1. HARD BLOCK: Cannot exceed available physical stock
        if (targetQuantity > item.availableQuantity) {
          toast.error(`Cannot exceed available physical stock of ${item.availableQuantity}.`);
          return;
        }

        // 2. WARNING CHECK: Dips below min stock level
        const remainingStock = item.availableQuantity - targetQuantity;
        if (remainingStock <= item.minStockLevel) {
          toast.warning(`Warning: New quantity dips stock below the minimum safety level of ${item.minStockLevel}.`);
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.inventoryId === inventoryId ? { ...i, quantity: targetQuantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      prepareOrderPayloads: () => {
        const stateItems = get().items;
        const groupedMap = stateItems.reduce<Record<string, CreateOrderItemInput[]>>((acc, item) => {
          const supplierId = item.facilityId;
          if (!acc[supplierId]) {
            acc[supplierId] = [];
          }
          acc[supplierId].push({
            drugId: item.drugId,
            quantityRequested: item.quantity,
            unitPrice: item.unitPriceNumber,
          });
          return acc;
        }, {});

        return Object.entries(groupedMap).map(([supplierId, items]) => ({
          supplierId,
          type: OrderType.REQUEST,
          items,
        }));
      },
    }),
    { name: 'requisition-cart-storage' }
  )
);