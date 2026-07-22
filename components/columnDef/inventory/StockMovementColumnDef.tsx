"use client";

import { ColumnDef } from "@tanstack/react-table";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  User, 
  Hash,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockMovementItem } from "@/types/types/stock-movement-adjusment.type";


// 1. Declare Table Meta interface for Movement Actions
export interface StockMovementTableMeta {
  onViewDetails?: (item: StockMovementItem) => void;
}

const formatDate = (dateInput: Date | string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateInput));
};

export const stockMovementColumn: ColumnDef<StockMovementItem>[] = [
  {
      accessorKey: "customId",
      header: "Movement ID",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
          <Hash className="h-3 w-3 text-slate-400" />
          {row.original.customId}
        </Badge>
      )
  },
  {
    accessorKey: "performedAt",
    header: "Date & Time",
    cell: ({ row }) => (
       <div className="flex flex-col font-sans text-xs">
          <span className="font-semibold text-slate-900">{formatDate(row.original.performedAt)}</span>
      </div>
    ),
  },
   {
    accessorKey: "performedBy.fullName",
    header: "Performed By",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
          <User className="h-3 w-3 text-slate-500" />
        </div>
        {row.original.performedBy?.fullName || "System"}
      </div>
    ),
  },
  {
    accessorKey: "inventory.drug.name",
    header: "Drug",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900">{row.original.inventory.drug.name}</span>
        <span className="text-[10px] text-slate-500 font-medium">
          {row.original.inventory.drug.strength} {row.original.inventory.drug.unit}
        </span>
      </div>
    ),
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
      const qty = row.original.quantity;
      const isNegative = qty < 0;
      return (
        <span className={`font-mono font-bold ${isNegative ? "text-red-600" : "text-emerald-700"}`}>
          {isNegative ? "" : "+"}{qty}
        </span>
      );
    },
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => <span className="text-slate-500 text-xs font-mono">{row.original.referenceNo}</span>
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right pr-4">Details</div>,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as StockMovementTableMeta | undefined;

      return (
        <div className="flex justify-end pr-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg gap-1.5"
            onClick={() => meta?.onViewDetails?.(item)}
          >
            <Eye className="h-3.5 w-3.5" /> View
          </Button>
        </div>
      );
    },
  }
];