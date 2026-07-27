import { 
  GlobalInventoryFilters, 
  GlobalInventoryItem, 
  LocalInventoryFilters, 
  LocalInventoryItem,
  PaginationMeta,
  InventorySummary,
  StockAdjustmentRow,
  AdjustmentFilters
} from "@/types/types/inventory.type";
import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { StockMovementItem, MovementFilters, StockMovementsSummary } from "@/types/types/stock-movement-adjusment.type";

interface InventoryStore {
  // Inventory Lists
  localInventory: LocalInventoryItem[];
  globalInventory: GlobalInventoryItem[];
  
  // Dashboard Summary
  inventorySummary: InventorySummary | null;
  
  // Stock Movements
  movements: StockMovementItem[];
  movementsSummary: StockMovementsSummary | null;
  movementsMeta: PaginationMeta | null;

  // Stock Adjustments History
  adjustments: StockAdjustmentRow[];
  adjustmentsMeta: PaginationMeta | null;
  
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLocalInventory: (filters?: LocalInventoryFilters) => Promise<void>;
  fetchGlobalInventory: (filters?: GlobalInventoryFilters) => Promise<void>;
  fetchInventorySummary: () => Promise<void>;
  fetchStockMovements: (filters?: MovementFilters) => Promise<void>;
  fetchAdjustments: (filters?: AdjustmentFilters) => Promise<void>;
}

/**
 * Helper to build query strings safely.
 */
const toQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  // Cast to Record<string, unknown> internally. 
  // This is safe because we handle the values as 'unknown' and convert to string.
  const entries = Object.entries(params as Record<string, unknown>);

  entries.forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  localInventory: [],
  globalInventory: [],
  inventorySummary: null,
  movements: [],
  movementsSummary: null,
  movementsMeta: null,
  adjustments: [],
  adjustmentsMeta: null,
  isLoading: false,
  error: null,

  fetchLocalInventory: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/inventory/local${queryString}`);
      const localData = response.data.data?.inventories as LocalInventoryItem[] || [];
      set({ 
        localInventory: localData, 
        isLoading: false 
      });
    } catch (err) {
      console.log("LOCAL_INVENTORY_FETCH_ERROR: ",err)
      set({ localInventory: [], error: "Failed to load local inventory.", isLoading: false });
    }
  },

  fetchGlobalInventory: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/inventory/global${queryString}`);
      const globalData = response.data.data?.inventories as GlobalInventoryItem[] || [];
      console.log(globalData)
      set({ 
        globalInventory: globalData, 
        isLoading: false 
      });
    } catch (err) {
       console.log("GLOBAL_INVENTORY_FETCH_ERROR: ",err)
      set({ globalInventory: [], error: "Failed to load global inventory.", isLoading: false });
    }
  },

  fetchInventorySummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/pharmsync/inventory/summary`);
      set({ 
        inventorySummary: response.data.data as InventorySummary, 
        isLoading: false 
      });
    } catch (err) {
      console.log("INVENTORY_SUMMARY_FETCH_ERROR: ",err)  
      set({ inventorySummary: null, error: "Failed to load summary stats.", isLoading: false });
    }
  },

  fetchStockMovements: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/inventory/movements${queryString}`);
      
      set({
        movements: response.data.data.movements as StockMovementItem[],
        movementsSummary: response.data.summary as StockMovementsSummary,
        movementsMeta: response.data.meta as PaginationMeta,
        isLoading: false,
      });
    } catch (err) {
        console.log("STOCK_MOVEMENTS_FETCH_ERROR: ",err)  
      set({ 
        movements: [], 
        movementsSummary: null, 
        movementsMeta: null, 
        error: "Failed to load stock movements.", 
        isLoading: false 
      });
    }
  },

  fetchAdjustments: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/inventory/adjustments${queryString}`);
      console.log(response.data.data)

      set({
        adjustments: response.data.data as StockAdjustmentRow[] || [],
        adjustmentsMeta: response.data.meta as PaginationMeta || null,
        isLoading: false,
      });
    } catch (err) {
      console.log("STOCK_ADJUSTMENTS_FETCH_ERROR: ", err);
      set({ 
        adjustments: [], 
        adjustmentsMeta: null, 
        error: "Failed to load stock adjustment history.", 
        isLoading: false 
      });
    }
  },
}));