"use client"

import * as React from "react"
import { 
  SlidersHorizontal, 
  TrendingDown, 
  TrendingUp, 
  Layers,
  Calendar
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import TableMain from "@/components/custom/table/TableMain"
import { Badge } from "@/components/ui/badge"

// Interface structure matching your Prisma adjustment tracking model
interface StockAdjustmentRow {
  id: string
  customId: string
  dateTime: Date | string
  drugName: string
  batchNumber: string
  inventoryName: string
  inventoryBatch: string
  type: "DECREASE" | "INCREASE"
  quantity: number
  unit: string
  reason: string
  reference: string
  performedBy: string
  role: string
}

export default function AdjustmentHistoryPage() {
  const [loading, setLoading] = React.useState(false)
  const [adjustments, setAdjustments] = React.useState<StockAdjustmentRow[]>([])

  // Derived or aggregated statistics matching the layout requirements
  const stats = {
    totalAdjustments: "245",
    quantityAdjusted: "-1,250",
    quantityAdded: "+980",
    averageAdjustment: "-11.02",
  }

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* 1. Header Workspace Section with Repositioned Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Adjustment History</h1>
          <p className="text-sm text-slate-500 font-normal">
            View all inventory adjustment records and see how stock levels were modified over time.
          </p>
        </div>

        {/* Date Range Placement - Securely situated at the top right before statistics layout */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 h-9 text-xs text-slate-600 font-medium shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors self-start sm:self-auto w-full sm:w-auto justify-center sm:justify-start">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>May 1, 2025 - May 31, 2025</span>
        </div>
      </div>

      {/* 2. Top Analytics Grid Workspace (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Adjustments */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Total Adjustments</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{stats.totalAdjustments}</p>
              <p className="text-[11px] text-slate-400 font-normal">All time</p>
            </div>
          </CardContent>
        </Card>

        {/* Quantity Adjusted */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100/40 rounded-xl">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Quantity Adjusted</p>
              <p className="text-2xl font-bold tracking-tight text-rose-600">{stats.quantityAdjusted}</p>
              <p className="text-[11px] text-slate-400 font-normal">All time</p>
            </div>
          </CardContent>
        </Card>

        {/* Quantity Added */}
        <Card className="bg-white border-slate-200 shadow-3xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Quantity Added</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600">{stats.quantityAdded}</p>
              <p className="text-[11px] text-slate-400 font-normal">All time</p>
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
              <p className="text-2xl font-bold tracking-tight text-slate-900">{stats.averageAdjustment}</p>
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
          loading={loading}
          searchKey="drugName"
          columnVisibilityFilter={true}
          placeholder="Filter adjustments log ledger records..."
        />
      </div>
    </div>
  )
}

// =========================================================
// COLUMN DEFINITIONS RESOURCE FILE MAPPING
// =========================================================
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const adjustmentHistoryColumns: ColumnDef<StockAdjustmentRow>[] = [
  {
    accessorKey: "customId",
    header: "Adjustment ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
        {row.original.customId}
      </Badge>
    )
  },
  {
    accessorKey: "dateTime",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs font-sans">
        <span className="font-semibold text-slate-900">May 31, 2025</span>
        <span className="text-slate-400 mt-0.5">10:24 AM</span>
      </div>
    )
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
    accessorKey: "inventoryName",
    header: "Inventory",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-medium text-slate-800">{row.original.inventoryName}</span>
        <span className="text-slate-400 font-normal mt-0.5">Batch: {row.original.inventoryBatch}</span>
      </div>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type
      const isIncrease = type === "INCREASE"
      
      return (
        <Badge 
          variant="outline" 
          className={`font-bold text-[10px] px-2 py-0.5 rounded-md tracking-wide ${
            isIncrease 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {isIncrease ? "↑ INCREASE" : "↓ DECREASE"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const amt = row.original.quantity
      const isPositive = amt > 0
      return (
        <div className="flex flex-col text-xs">
          <span className={`font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? `+${amt}` : amt}
          </span>
          <span className="text-[10px] text-slate-400 font-normal uppercase mt-0.5">{row.original.unit}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-slate-600 font-medium text-xs">
        {row.original.reason || "—"}
      </span>
    )
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
        <span className="text-[10px] text-slate-400">{row.original.role || "Pharmacist"}</span>
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
          <DropdownMenuItem className="text-xs cursor-pointer">View full audit trail</DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">Download discrepancy receipt</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]