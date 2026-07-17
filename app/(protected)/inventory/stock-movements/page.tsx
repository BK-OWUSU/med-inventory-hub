"use client"

import * as React from "react"
import { 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  CalendarClock, 
  Package,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TableMain from "@/components/custom/table/TableMain"
import { Badge } from "@/components/ui/badge"

// Mock state tracking or type representations for demonstration
interface StockMovementRow {
  id: string
  customId: string
  dateTime: Date | string
  drugName: string
  batchNumber: string
  facilityName: string
  subLocation: string
  type: "IN" | "OUT" | "ADJUSTMENT" | "EXPIRY" | "TRANSFER"
  quantity: number
  unit: string
  reference: string
  performedBy: string
}

export default function StockMovementsPage() {
  const [loading, setLoading] = React.useState(false)
  const [movements, setMovements] = React.useState<StockMovementRow[]>([])

  // Example metric summaries (replace with real data metrics computation block)
  const stats = {
    totalIn: "1,250",
    totalOut: "980",
    adjustments: "45",
    expiry: "28",
    netMovement: "+270",
  }

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
          {/* Date Range Selector replacement for Export CTA */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 h-9 text-xs text-slate-600 font-medium shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors w-full sm:w-auto justify-center sm:justify-start">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>May 1, 2025 - May 31, 2025</span>
          </div>

          <Button
            onClick={() => console.log("Open execution wizard")} 
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg gap-1.5 px-4 shadow-xs w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" /> New Stock Movement
          </Button>
        </div>
      </div>

      {/* 2. Metrics Analytics Row Grid (5 Columns Layout matching mockups) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        {/* Total IN */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-xl">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Total IN</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">{stats.totalIn} <span className="text-[10px] text-slate-400 font-normal">Units</span></p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">↑ 18.4% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
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
              <p className="text-xl font-bold tracking-tight text-slate-900">{stats.totalOut} <span className="text-[10px] text-slate-400 font-normal">Units</span></p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">↑ 12.7% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
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
              <p className="text-xl font-bold tracking-tight text-slate-900">{stats.adjustments} <span className="text-[10px] text-slate-400 font-normal">Units</span></p>
              <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">↓ 8.2% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
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
              <p className="text-xl font-bold tracking-tight text-slate-900">{stats.expiry} <span className="text-[10px] text-slate-400 font-normal">Units</span></p>
              <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">↓ 3.1% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
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
              <p className="text-xl font-bold tracking-tight text-emerald-700">{stats.netMovement} <span className="text-[10px] text-slate-400 font-normal">Units</span></p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">↑ 15.6% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Central Operational Table Grid Section */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden p-4">
        {/* TableMain wrapper passes the columns data defined below directly */}
        <TableMain
          columns={stockMovementColumns}
          data={movements}
          loading={loading}
          searchKey="drugName"
          columnVisibilityFilter={true}
          placeholder="Filter ledger data tracking records..."
        />
      </div>
    </div>
  )
}

// =========================================================
// COLUMN DEFINITIONS RESOURCE FILE MAPPING FOR DATA REGISTRY
// =========================================================
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const stockMovementColumns: ColumnDef<StockMovementRow>[] = [
  {
    accessorKey: "customId",
    header: "Movement ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
        {row.original.customId}
      </Badge>
    )
  },
  {
    accessorKey: "dateTime",
    header: "Date & Time",
    cell: ({ row }) => {
      const value = row.original.dateTime
      // Mock render text block formatting strategy matching screenshot values
      return (
        <div className="flex flex-col font-sans text-xs">
          <span className="font-semibold text-slate-900">May 31, 2025</span>
          <span className="text-slate-400 mt-0.5">10:24 AM</span>
        </div>
      )
    }
  },
  {
    accessorKey: "drugName",
    header: "Drug & Batch",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-bold text-slate-900">{row.original.drugName}</span>
        <span className="text-slate-400 font-normal mt-0.5">Batch: {row.original.batchNumber}</span>
      </div>
    )
  },
  {
    accessorKey: "facilityName",
    header: "Facility / Inventory",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-medium text-slate-800">{row.original.facilityName}</span>
        <span className="text-slate-400 font-normal mt-0.5">{row.original.subLocation}</span>
      </div>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type
      
      const configurations: Record<string, { label: string; style: string }> = {
        IN: { label: "↓ IN", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        OUT: { label: "↑ OUT", style: "bg-rose-50 text-rose-700 border-rose-200" },
        ADJUSTMENT: { label: "⇄ ADJUSTMENT", style: "bg-blue-50 text-blue-700 border-blue-200" },
        EXPIRY: { label: "🗙 EXPIRY", style: "bg-amber-50 text-amber-700 border-amber-200" },
        TRANSFER: { label: "⇆ TRANSFER", style: "bg-purple-50 text-purple-700 border-purple-200" },
      }

      const current = configurations[type] || { label: type, style: "bg-slate-50 text-slate-600" }

      return (
        <Badge variant="outline" className={`${current.style} font-bold text-[10px] px-2 py-0.5 uppercase tracking-wide rounded-md`}>
          {current.label}
        </Badge>
      )
    }
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const amt = row.original.quantity
      const unit = row.original.unit
      const isPositive = amt > 0
      return (
        <div className="flex flex-col text-xs">
          <span className={`font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? `+${amt}` : amt}
          </span>
          <span className="text-[10px] text-slate-400 font-normal uppercase mt-0.5">{unit}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => <span className="text-slate-500 text-xs font-mono">{row.original.reference}</span>
  },
  {
    accessorKey: "performedBy",
    header: "Performed By",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-semibold text-slate-800">{row.original.performedBy}</span>
        <span className="text-[10px] text-slate-400">Pharmacist</span>
      </div>
    )
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-slate-500">Options</DropdownMenuLabel>
          <DropdownMenuItem className="text-xs cursor-pointer">View verification source</DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">Print audit voucher</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]