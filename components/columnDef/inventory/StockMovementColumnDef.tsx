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

// Helper to determine styling based on movement type
const getMovementTypeStyles = (type: string) => {
  switch (type) {
    case "RESTOCK":
      return { label: "Restock", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: ArrowDownLeft };
    case "ISSUE":
      return { label: "Issue", color: "bg-orange-50 text-orange-700 border-orange-200", icon: ArrowUpRight };
    case "ADJUSTMENT":
      return { label: "Adjustment", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RotateCcw };
    default:
      return { label: type, color: "bg-slate-50 text-slate-600 border-slate-200", icon: Hash };
  }
};

const formatDate = (dateInput: Date | string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateInput));
};

export const stockMovementColumns: ColumnDef<StockMovementItem>[] = [
  {
    accessorKey: "performedAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
        {formatDate(row.original.performedAt)}
      </span>
    ),
  },
  {
    accessorKey: "referenceNo",
    header: "Reference",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
        <Hash className="h-3 w-3 text-slate-400" />
        {row.original.referenceNo || row.original.customId}
      </div>
    ),
  },
  {
    accessorKey: "inventory.drug.name",
    header: "Medicine",
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
      const { label, color, icon: Icon } = getMovementTypeStyles(row.original.type as string);
      return (
        <Badge variant="outline" className={`${color} rounded-md px-2 py-0.5 font-semibold flex w-fit items-center gap-1`}>
          <Icon className="h-3 w-3" />
          {label}
        </Badge>
      );
    },
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