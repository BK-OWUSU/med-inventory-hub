"use client"

import * as React from "react"
import { 
  Plus, 
  Download, 
  Boxes, 
  Layers, 
  AlertTriangle, 
  CalendarClock, 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// Import your custom components and store
import { useInventoryStore } from "@/store/inventoryStore"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import TableMain from "@/components/custom/table/TableMain"
import { CreateDrugBatchForm } from "./CreateDrugBatchFormComponent"
import { LocalInventoryItem } from "@/types/types/inventory.type"
import { localInventoryColumns, LocalInventoryTableMeta } from "@/components/columnDef/inventory/LocalInventoryColumnDef"
import { useDrugStore } from "@/store/drugStore"
import { EditDrugBatchForm } from "./UpdateDrugInventoryBatchForm"
import { BatchDetailsView } from "@/components/viewDetailsCompoents/inventory/BatchDetailsViewer"


/// 1. Define the allowed colors as a type
type ColorTheme = "slate" | "emerald" | "amber" | "rose";

// 2. Define the Props interface explicitly
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: ColorTheme; // Enforce strict types here
  subtext: string;
}


export default function InventoryPage() {
  const { fetchLocalInventory, localInventory = [], isLoading } = useInventoryStore();
  const {fetchDrugs, drugs} = useDrugStore();
  
  // UI State for Sheets
  const [isAddInventoryOpen, setIsAddInventoryOpen] = React.useState(false);
  const [isUpdateInventoryBatchOpen, setIsUpdateInventoryBatchOpen] = React.useState(false);
  const [selectedInventoryBatch, setSelectedInventoryBatch] = React.useState<LocalInventoryItem | null>();
  const [isBatchViewerOpen, setIsBatchViewerOpen] = React.useState(false);

  React.useEffect(() => {
    fetchLocalInventory();
    fetchDrugs();
  }, [fetchLocalInventory, fetchDrugs]);

  // Derived Statistics
  const { totalItems, totalQuantity, lowStock, expiringSoon } = React.useMemo(() => {
    const items = localInventory || [];
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    return {
      totalItems: items.length,
      totalQuantity: items.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0),
      lowStock: items.filter((i) => i.availableQuantity <= (i.minStockLevel || 0)).length,
      expiringSoon: items.filter((i) => i.expiryDate && new Date(i.expiryDate) <= sixtyDaysFromNow).length,
    };
  }, [localInventory]);

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 font-normal">View and manage all medicines in stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            onClick={() => setIsAddInventoryOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-700 text-white h-9 rounded-lg gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Receive Stock
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <MetricCard title="Total Batches" value={totalItems} icon={Boxes} color="slate" subtext="Across all products" />
        <MetricCard title="Total Quantity" value={totalQuantity.toLocaleString()} icon={Layers} color="emerald" subtext="Units in stock" />
        <MetricCard title="Low Stock Items" value={lowStock} icon={AlertTriangle} color="amber" subtext="Below min. level" />
        <MetricCard title="Expiring Soon" value={expiringSoon} icon={CalendarClock} color="rose" subtext="Within 60 days" />
      </div>

      {/* Table Section */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
        <TableMain
          columns={localInventoryColumns}
          data={localInventory}
          loading={isLoading}
          tableFilterButtonVisible = {true}
          columnVisibilityFilter={true}
          searchKey="batchNumber" // Adjust based on your column schema
          placeholder="Search batch details ..."
          meta={{
            onEdit: (inventory) => {
              setSelectedInventoryBatch(inventory);
              setIsUpdateInventoryBatchOpen(true);
            },
            onViewMovements(item) {
               setSelectedInventoryBatch(item);
                setIsBatchViewerOpen(true)  
            },
          } as LocalInventoryTableMeta}
        />
      </Card>

      {/* -- Sheets -- */}

       <AppSheet
        isOpen={isBatchViewerOpen}
        onClose={() => setIsBatchViewerOpen(false)}
        title="Batch Details"
        description="View Details about Batch"
      >
       <BatchDetailsView
        inventoryId={selectedInventoryBatch ? selectedInventoryBatch.id : "" }
       />
      </AppSheet>
      
      {/* Add Inventory Sheet */}
      <AppSheet
        isOpen={isAddInventoryOpen}
        onClose={() => setIsAddInventoryOpen(false)}
        title="Add New Inventory Batch"
        description="Add a new stock batch to the system."
      >
        <CreateDrugBatchForm
          drugId={drugs[0]?.id}
          drugs={drugs}
          onSuccess={() => {
            fetchLocalInventory();
            setIsAddInventoryOpen(false);
        }} />
      </AppSheet>

      {/* Update Inventory Sheet */}
      <AppSheet
        isOpen={isUpdateInventoryBatchOpen}
        onClose={() => setIsUpdateInventoryBatchOpen(false)}
        title="Update Stock"
        description="Process stock movements for this batch."
      >
        {selectedInventoryBatch && (
            <EditDrugBatchForm 
                batchId={selectedInventoryBatch.id}
                batchNumber={selectedInventoryBatch.batchNumber || ""}
                initialData={
                  {
                    expiryDate:selectedInventoryBatch.expiryDate ? new Date(selectedInventoryBatch.expiryDate) : new Date(),
                    manufacturer: selectedInventoryBatch?.manufacturer ||"",
                    unitPrice: Number(selectedInventoryBatch.unitPrice),
                    minStockLevel: selectedInventoryBatch.minStockLevel,
                    isActive: selectedInventoryBatch.isActive
                  }  
                } 
                onSuccess={() => {
                    fetchLocalInventory();
                    setIsUpdateInventoryBatchOpen(false);
                }} 
            />
        )}
      </AppSheet>
    </div>
  )
}

// 3. Apply the interface to the component
function MetricCard({ title, value, icon: Icon, color, subtext }: MetricCardProps) {
  // TypeScript now knows color is one of the valid keys
  const colorClasses: Record<ColorTheme, string> = {
    slate: "bg-slate-50 text-slate-600",
    emerald: "bg-emerald-50/60 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  };

  return (
    <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          {/* Accessing the object using the typed 'color' prop */}
          <div className={`p-3 border border-slate-100 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="text-[11px] text-slate-400 font-normal">{subtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}