"use client"

import * as React from "react"
import { 
  SlidersHorizontal, 
  TrendingDown, 
  TrendingUp, 
  Layers,
  Plus
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TableMain from "@/components/custom/table/TableMain"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import { StockAdjustmentRow } from "@/types/types/inventory.type"
import { adjustmentHistoryColumns, StockAdjustmentTableMeta } from "@/components/columnDef/inventory/AdjustmentHistoryColumnDef"
import { useInventoryStore } from "@/store/inventoryStore"
import { StockAdjustmentDetailsView } from "@/components/viewDetailsCompoents/inventory/StockAdjustmentDetailsViewer"
import { Input } from "@/components/ui/input"
import { StockAdjustmentUpdateForm } from "./StockAdjustmentUpdateForm"

export default function AdjustmentHistoryPage() {
  const { isLoading, fetchAdjustments, adjustments, adjustmentsMeta } = useInventoryStore()
  
  const [selectedAdjustmentHistory, setSelectedAdjustmentHistory] = React.useState<StockAdjustmentRow | null>(null)
  const [isViewAdjustmentDrawerOpen, setIsViewAdjustmentDrawerOpen] = React.useState(false)
  const [isEditAdjustmentDrawerOpen, setIsEditAdjustmentDrawerOpen] = React.useState(false)

  // Filter state for dynamic date inputs
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")

  // Fetch adjustments on mount or when filter inputs change
  React.useEffect(() => {
    fetchAdjustments({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }, [startDate, endDate, fetchAdjustments]);

  // Dynamically computed metrics based on the current adjustments data
  const totalAdjustmentsCount = adjustmentsMeta?.total ?? adjustments.length;
  
  const quantityAdded = adjustments.reduce((acc, curr) => {
    return curr.difference > 0 ? acc + curr.difference : acc;
  }, 0);

  const quantityAdjusted = adjustments.reduce((acc, curr) => {
    return curr.difference < 0 ? acc + Math.abs(curr.difference) : acc;
  }, 0);

  const averageAdjustmentVal = adjustments.length > 0 
    ? (adjustments.reduce((acc, curr) => acc + curr.difference, 0) / adjustments.length).toFixed(2) 
    : "0.00";

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* 1. Header Workspace Section with Interactive Date Inputs and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Adjustment History</h1>
          <p className="text-sm text-slate-500 font-normal">
            View all inventory adjustment records and see how stock levels were modified over time.
          </p>
        </div>

        {/* Filters and Action Button Section */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 h-9 text-xs text-slate-600 font-medium shadow-2xs">
            <span className="text-slate-400">From:</span>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer border-0 shadow-none h-auto p-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 h-9 text-xs text-slate-600 font-medium shadow-2xs">
            <span className="text-slate-400">To:</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer border-0 shadow-none h-auto p-0 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* 2. Top Analytics Grid Workspace (4 Columns - Dynamic Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Adjustments */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Total Adjustments</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{totalAdjustmentsCount}</p>
              <p className="text-[11px] text-slate-400 font-normal">Filtered records</p>
            </div>
          </CardContent>
        </Card>

        {/* Quantity Adjusted (Decreases) */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100/40 rounded-xl">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Quantity Adjusted</p>
              <p className="text-2xl font-bold tracking-tight text-rose-600">-{quantityAdjusted}</p>
              <p className="text-[11px] text-slate-400 font-normal">Total decreases</p>
            </div>
          </CardContent>
        </Card>

        {/* Quantity Added (Increases) */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Quantity Added</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600">+{quantityAdded}</p>
              <p className="text-[11px] text-slate-400 font-normal">Total increases</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Adjustment */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-700 border border-indigo-100/40 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Average Adjustment</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{averageAdjustmentVal}</p>
              <p className="text-[11px] text-slate-400 font-normal">Units per adjustment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Central History Data Log Table Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden p-4">
        <TableMain
          columns={adjustmentHistoryColumns}
          data={adjustments}
          loading={isLoading}
          searchKey="drugName"
          columnVisibilityFilter={true}
          placeholder="Filter adjustments log ledger records..."
          meta={{
            onViewDetails(item) {
              setSelectedAdjustmentHistory(item)
              setIsViewAdjustmentDrawerOpen(true)
            },
            onEditAdjustment(item) {
              setSelectedAdjustmentHistory(item)
              setIsEditAdjustmentDrawerOpen(true)
            },
          } as StockAdjustmentTableMeta}
        />
      </div>

      <AppSheet
        isOpen={isEditAdjustmentDrawerOpen}
        onClose={() => setIsEditAdjustmentDrawerOpen(false)}
        title="Update Adjustment"
        description="Update existing adjustment"
      >
        {selectedAdjustmentHistory && (
        <StockAdjustmentUpdateForm
          inventoryId={selectedAdjustmentHistory ? selectedAdjustmentHistory.id : ""}
          initialData={selectedAdjustmentHistory}
          onSuccess={() => {
            setIsEditAdjustmentDrawerOpen(false);
            setSelectedAdjustmentHistory(null)
            fetchAdjustments({
              startDate: startDate ? new Date(startDate) : undefined,
              endDate: endDate ? new Date(endDate) : undefined,
            });
          }}
        />)}
      </AppSheet>  

      <AppSheet
        isOpen={isViewAdjustmentDrawerOpen}
        onClose={() => setIsViewAdjustmentDrawerOpen(false)}
        title="View Adjustment"
        description="View Details about Adjustment"
      >
        {selectedAdjustmentHistory && (
          <StockAdjustmentDetailsView
            item={selectedAdjustmentHistory}
          />
        )}  
      </AppSheet>
    </div>
  )
}