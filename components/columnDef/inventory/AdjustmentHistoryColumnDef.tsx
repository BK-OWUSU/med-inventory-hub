"use client";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Eye,
  History,
  Edit,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockAdjustmentRow } from "@/types/types/inventory.type";

// 1. Declare Table Meta interface for Stock Adjustment Actions
export interface StockAdjustmentTableMeta {
  onViewDetails?: (item: StockAdjustmentRow) => void;
  onEditAdjustment?: (item: StockAdjustmentRow) => void;
}

// Formatting helpers
const formatDateTime = (dateInput: Date | string | null) => {
  if (!dateInput) return { date: "—", time: "—" };
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return { date: "—", time: "—" };

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj),
  };
};

// Action Cell Component:
interface AdjustmentRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}

export function AdjustmentRowActions<TData extends StockAdjustmentRow>({ 
  row, 
  table 
}: AdjustmentRowActionsProps<TData>) {
  const item = row.original;
  const meta = table.options.meta as StockAdjustmentTableMeta | undefined;

  return (
    <div className="flex items-center justify-end gap-2 pr-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-lg"
        onClick={() => meta?.onViewDetails?.(item)}
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => meta?.onViewDetails?.(item)}>
            <History className="h-4 w-4 mr-2 text-slate-400" />
            View audit trail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => meta?.onEditAdjustment?.(item)}>
            <Edit className="h-4 w-4 mr-2 text-slate-400" />
             Edit Adjustment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Column Definitions
export const adjustmentHistoryColumns: ColumnDef<StockAdjustmentRow>[] = [
  {
    accessorKey: "customId",
    header: "Adjustment ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
        {row.original.customId}
      </Badge>
    ),
  },
  {
    accessorKey: "dateTime",
    header: "Date & Time",
    cell: ({ row }) => {
      const { date, time } = formatDateTime(row.original.dateTime);
      return (
        <div className="flex flex-col text-xs font-sans">
          <span className="font-semibold text-slate-900">{date}</span>
          <span className="text-slate-400 mt-0.5">{time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "drugName",
    header: "Drug & Batch",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-bold text-slate-900">{row.original.drugName}</span>
        <span className="text-slate-400 font-normal mt-0.5">Batch: {row.original.batchNumber}</span>
      </div>
    ),
  },
  {
    accessorKey: "inventoryName",
    header: "Inventory",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-medium text-slate-800">{row.original.inventoryName}</span>
        <span className="text-slate-400 font-normal mt-0.5">Batch: {row.original.inventoryBatch}</span>
      </div>
    ),
  },
  {
    accessorKey: "difference",
    header: "Type & Change",
    cell: ({ row }) => {
      const diff = row.original.difference;
      const isIncrease = diff > 0;
      
      return (
        <div className="flex flex-col gap-1">
          <Badge 
            variant="outline" 
            className={`font-bold text-[10px] px-2 py-0.5 rounded-md tracking-wide w-fit ${
              isIncrease 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isIncrease ? "↑ INCREASE" : "↓ DECREASE"}
          </Badge>
          <span className={`text-xs font-bold ${isIncrease ? "text-emerald-600" : "text-rose-600"}`}>
            {isIncrease ? `+${diff}` : diff}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-slate-600 font-medium text-xs">
        {row.original.reason || "—"}
      </span>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => <span className="text-slate-500 text-xs font-mono">{row.original.reference}</span>,
  },
  {
    accessorKey: "performedBy",
    header: "Performed By",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-semibold text-slate-800">{row.original.performedBy}</span>
        <span className="text-[10px] text-slate-400">{row.original.role || "Staff"}</span>
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => <AdjustmentRowActions row={row} table={table} />,
  },
];