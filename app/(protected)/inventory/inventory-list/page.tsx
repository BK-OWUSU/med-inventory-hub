"use client"

import * as React from "react"
import { 
  Plus, 
  Download, 
  Boxes, 
  Layers, 
  AlertTriangle, 
  CalendarClock, 
  TrendingUp,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// Import your custom components and store
import { useInventoryStore } from "@/store/inventoryStore"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import TableMain from "@/components/custom/table/TableMain"
import { inventoryColumns, InventoryTableMeta } from "@/components/columnDef/inventory/GlobalInventoryColumnDef"
import { CreateInventoryForm } from "./CreateInventoryFormComponent"
import { UpdateInventoryForm } from "./UpdateInventoryFormComponent"
import { GlobalInventoryItem } from "@/types/types/inventory.type"


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
  const { fetchGlobalInventory, globalInventory = [], isLoading } = useInventoryStore();
  
  // UI State for Sheets
  const [isAddInventoryOpen, setIsAddInventoryOpen] = React.useState(false);
  const [isUpdateInventoryOpen, setIsUpdateInventoryOpen] = React.useState(false);
  const [selectedInventory, setSelectedInventory] = React.useState<GlobalInventoryItem | null>();

  React.useEffect(() => {
    fetchGlobalInventory();
  }, [fetchGlobalInventory]);

  // Derived Statistics
  const { totalItems, totalQuantity, lowStock, expiringSoon } = React.useMemo(() => {
    const items = globalInventory || [];
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    return {
      totalItems: items.length,
      totalQuantity: items.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0),
      lowStock: items.filter((i) => i.availableQuantity <= (i.minStockLevel || 0)).length,
      expiringSoon: items.filter((i) => i.expiryDate && new Date(i.expiryDate) <= sixtyDaysFromNow).length,
    };
  }, [globalInventory]);

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 font-normal">View and manage all medicines in stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 rounded-lg gap-1.5 bg-white">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button 
            size="sm" 
            onClick={() => setIsAddInventoryOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-700 text-white h-9 rounded-lg gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Inventory
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
          columns={inventoryColumns}
          data={globalInventory}
          loading={isLoading}
          searchKey="batchNumber" // Adjust based on your column schema
          meta={{
            onEdit: (inventory) => {
              setSelectedInventory(inventory);
              setIsUpdateInventoryOpen(true);
            }
          } as InventoryTableMeta}
        />
      </Card>

      {/* -- Sheets -- */}
      
      {/* Add Inventory Sheet */}
      <AppSheet
        isOpen={isAddInventoryOpen}
        onClose={() => setIsAddInventoryOpen(false)}
        title="Add New Inventory Batch"
        description="Add a new stock batch to the system."
      >
        <CreateInventoryForm onSuccess={() => {
            fetchGlobalInventory();
            setIsAddInventoryOpen(false);
        }} />
      </AppSheet>

      {/* Update Inventory Sheet */}
      <AppSheet
        isOpen={isUpdateInventoryOpen}
        onClose={() => setIsUpdateInventoryOpen(false)}
        title="Update Stock"
        description="Process stock movements for this batch."
      >
        {selectedInventory && (
            <UpdateInventoryForm 
                inventoryId={selectedInventory.id} 
                onSuccess={() => {
                    fetchGlobalInventory();
                    setIsUpdateInventoryOpen(false);
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