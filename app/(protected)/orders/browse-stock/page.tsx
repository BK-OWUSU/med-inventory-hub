"use client";

import * as React from "react";
import { 
  Building2, 
  Pill, 
  Package, 
  ClipboardList, 
  ShoppingBasket
} from "lucide-react";

import { Card } from "@/components/ui/card";
import TableMain from "@/components/custom/table/TableMain";
import { globalInventoryColumns, InventoryTableMeta } from "@/components/columnDef/orders/GlobalInventoryColumnDef";
import { useInventoryStore } from "@/store/inventoryStore";
import { useRequisitionCartStore } from "@/store/requisition-cart.store";
// import { RequisitionCartDrawer } from "@/components/inventory/requisition-cart-drawer"; // Adjust import path to your drawer file
import { toast } from "sonner";
import { Prisma } from "@/generated/prisma/client";
import { RequisitionCartContent } from "./RequisitionCartDrawer";
import { AppSheet } from "@/components/custom/drawers/AppSheet";
import { Button } from "@/components/ui/button";

// Currency formatter for cart item payload
const formatCurrency = (amount: Prisma.Decimal | null | number) => {
  const value = typeof amount === 'object' && amount !== null ? Number(amount) : (amount || 0);
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(value);
};

export default function BrowseAvailableStockComponent() {
  const { isLoading, fetchGlobalInventory, globalInventory } = useInventoryStore();
  const addItem = useRequisitionCartStore((state) => state.addItem);
  const [isCartBasketViewerOpen,setIsCartBasketViewerOpen] = React.useState(false)

  React.useEffect(() => {
    fetchGlobalInventory();
  }, [fetchGlobalInventory]);

  // Dynamic Metrics Calculations from DB Data
  const metrics = React.useMemo(() => {
    const facilitiesSet = new Set(globalInventory.map((item) => item.facility.id));
    const drugsSet = new Set(globalInventory.map((item) => item.drug.id));
    const totalBatches = globalInventory.length;
    const totalQuantity = globalInventory.reduce((acc, item) => acc + (item.availableQuantity || 0), 0);

    return {
      facilitiesCount: facilitiesSet.size,
      drugsCount: drugsSet.size,
      totalBatches,
      totalQuantity,
    };
  }, [globalInventory]);

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      
      {/* Top Header & Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Browse Available Stock</h1>
          <p className="text-sm text-slate-500 mt-0.5">View available stock from other facilities and place orders.</p>
        </div>
        <div className="flex items-center gap-3">
        <Button
            size="sm"
            onClick={()=> setIsCartBasketViewerOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-700 text-white h-9 rounded-lg gap-1.5 shadow-xs">
                Order
                <ShoppingBasket className="h-4 w-4 text-white" />
        </Button>     
        </div>
      </div>

      {/* Metrics Grid (Dynamic from DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Facilities with Stock */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Facilities with Stock</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.facilitiesCount}</h3>
            <p className="text-[11px] text-slate-400">Across all facilities</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Drugs Available */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Total Drugs Available</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.drugsCount.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400">Unique drug items</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Pill className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Total Batches */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Total Batches</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalBatches.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400">Across all facilities</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Total Quantity Available */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Total Quantity Available</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalQuantity.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400">Units in stock</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Inventory Table */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
        <TableMain
          columns={globalInventoryColumns}
          data={globalInventory}
          loading={isLoading}
          tableFilterButtonVisible={true}
          columnVisibilityFilter={true}
          searchKey="drug" 
          placeholder="Search drug..."
          meta={{
            onAddToCart(item) {
                const cartItems = useRequisitionCartStore.getState().items;
                const existingCartItem = cartItems.find((ci) => ci.inventoryId === item.id);
                const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;
                 if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
                    toast.error(`Cannot add ${item.drug.name} (Batch: ${item.batchNumber}). This batch has expired.`);
                    return;
                  }
                
                if (currentCartQty + 1 > item.availableQuantity) {
                    toast.error(`Cannot add more. Only ${item.availableQuantity} available in stock.`);
                    return;
             }  
              addItem({
                inventoryId: item.id,
                drugName: item.drug.name,
                drugId: item.drug.id, 
                strength: item.drug.strength || "",
                dosageForm: item.drug.dosageForm || "",
                unit: item.drug.unit,
                facilityId: item.facility.id,
                facilityName: item.facility.name,
                facilityLocation: item.facility.location,
                batchNo: item.batchNumber || "N/A",
                unitPriceNumber: Number(item.unitPrice || 0),
                unitPriceDisplay: formatCurrency(item.unitPrice),
                quantity: 1, // Initial add count
                availableQuantity: item.availableQuantity,
                minStockLevel: item.minStockLevel,       
                expiryDate: item.expiryDate,
              });
              toast.success(`Added ${item.drug.name} to requisition cart`);
            },
            onViewDetails(item) {
              // Handle opening details modal/sheet if needed
              console.log("View details for:", item.id);
            },
          } as InventoryTableMeta}
        />
      </Card>

       <AppSheet
           isOpen={isCartBasketViewerOpen}
           maxWidth="xl"
           onClose={() => setIsCartBasketViewerOpen(false)}
           title="View Your Cart"
           description="Below are orders you have added to you cart"
         >
         <RequisitionCartContent />
        </AppSheet>
    </div>
  );
}