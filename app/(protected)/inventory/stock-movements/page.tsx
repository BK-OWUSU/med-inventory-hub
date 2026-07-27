"use client"

import * as React from "react"
import {  
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  CalendarClock, 
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TableMain from "@/components/custom/table/TableMain"
import { useInventoryStore } from "@/store/inventoryStore"
import { stockMovementColumn, StockMovementTableMeta } from "@/components/columnDef/inventory/StockMovementColumnDef"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import { StockMovementDetailsView } from "@/components/viewDetailsCompoents/inventory/StockMovementDetailsViewer"
import { Input } from "@/components/ui/input"
import { StockMovementItem } from "@/types/types/stock-movement-adjusment.type"

export default function StockMovementsPage() {
  const { fetchStockMovements, movements, isLoading } = useInventoryStore();

  const [isMovementViewerOpen, setIsMovementViewerOpen] = React.useState(false);
  const [movementId, setMovementId] = React.useState<string>("");

  // 2. Local State Management for Filters
  const [startDateStr, setStartDateStr] = React.useState<string>("");
  const [endDateStr, setEndDateStr] = React.useState<string>("");

  React.useEffect(() => {
    const filters = {
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
      page: 1, // Reset page context during dynamic filtering
    };
    fetchStockMovements(filters);
  }, [endDateStr, fetchStockMovements, startDateStr]);

  // Compute actual summary metrics dynamically from the movements array
  const movementsSummary = React.useMemo(() => {
    if (!movements || movements.length === 0) {
      return { totalIn: 0, totalOut: 0, adjustmentsCount: 0, expiryLossCount: 0, netMovement: 0 };
    }

    let totalIn = 0;
    let totalOut = 0;
    let adjustmentsCount = 0;
    let expiryLossCount = 0;

    movements.forEach((m: StockMovementItem) => {
      const qty = Number(m.quantity || 0);
      const type = (m.type || "").toUpperCase();

      if (type === "IN" || type === "PURCHASE" || type === "RECEIVE") {
        totalIn += qty;
      } else if (type === "OUT" || type === "SALE" || type === "DISPENSE") {
        totalOut += qty;
      } else if (type === "ADJUSTMENT") {
        adjustmentsCount += qty;
      } else if (type === "EXPIRY" || type === "EXPIRED") {
        expiryLossCount += qty;
      }
    });

    const netMovement = totalIn - totalOut;

    return { totalIn, totalOut, adjustmentsCount, expiryLossCount, netMovement };
  }, [movements]);

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* 1. Top Header Row Layout (With Integrated Date Range Component) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Movements</h1>
          <p className="text-sm text-slate-500 font-normal">
            Track all stock movements across your inventory
          </p>
        </div>
        
        {/* Actions Cluster Group */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto w-full md:w-auto">
          
          {/* Date Range Selector Integration */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 h-9 text-xs text-slate-600 font-medium shadow-xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all w-full sm:w-auto">
            <Input 
              type="date" 
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="bg-transparent border-0 p-0 text-slate-700 focus:ring-0 text-xs cursor-pointer w-full sm:w-auto min-w-27.5"
            />
            <span className="text-slate-400 font-normal px-0.5">to</span>
            <Input 
              type="date" 
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="bg-transparent border-0 p-0 text-slate-700 focus:ring-0 text-xs cursor-pointer w-full sm:w-auto min-w-27.5"
            />
          </div>

          {/* Clear Filters Action Button */}
          {(startDateStr || endDateStr) && (
            <Button
              variant="ghost"
              onClick={() => {
                setStartDateStr("");
                setEndDateStr("");
              }}
              className="text-xs h-9 px-3 bg-green-700 text-white hover:text-green-800 hover:bg-transparent hover:border-green-800"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* 2. Metrics Analytics Row Grid (5 Columns Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        {/* Total IN */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-xl">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Total IN</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {movementsSummary.totalIn.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Units</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">↑ Live data</p>
            </div>
          </CardContent>
        </Card>

        {/* Total OUT */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-100/50 rounded-xl">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Total OUT</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {movementsSummary.totalOut.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Units</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">↑ Live data</p>
            </div>
          </CardContent>
        </Card>

        {/* Adjustments */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-50 text-blue-700 border border-blue-100/50 rounded-xl">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Adjustments</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {movementsSummary.adjustmentsCount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Units</span>
              </p>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">Live data</p>
            </div>
          </CardContent>
        </Card>

        {/* Expiry */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-100/50 rounded-xl">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Expiry</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {movementsSummary.expiryLossCount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Units</span>
              </p>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">Live data</p>
            </div>
          </CardContent>
        </Card>

        {/* Net Movement */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-xl">
              <Package className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Net Movement</p>
              <p className={`text-xl font-bold tracking-tight ${movementsSummary.netMovement >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {movementsSummary.netMovement.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Units</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">Live balance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Central Operational Table Grid Section */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden p-4">
        <TableMain
          columns={stockMovementColumn}
          data={movements}
          loading={isLoading}
          searchKey="drugName"
          columnVisibilityFilter={true}
          tableFilterButtonVisible={true}
          tableExportButtonVisible={true}
          checkBoxVisibility={true}
          placeholder="Filter ledger data tracking records..."
          meta={{
            onViewDetails(item) {
               setIsMovementViewerOpen(true);
               setMovementId(item.id);
            },
          } as StockMovementTableMeta}
        />
      </div>

      <AppSheet
        isOpen={isMovementViewerOpen}
        maxWidth="xl"
        onClose={() => setIsMovementViewerOpen(false)}
        title="View Stock Movement Details"
        description="Show the movement details drugs"
      >
        <StockMovementDetailsView stockMovementId={movementId}/>
      </AppSheet>
    </div>
  );
}