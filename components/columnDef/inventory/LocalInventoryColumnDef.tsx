"use client";

import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Pill, 
  AlertTriangle, 
  History,
  Tag
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
import { LocalInventoryItem } from "@/types/types/inventory.type";


// 1. Declare Table Meta interface for Local Inventory Actions
export interface LocalInventoryTableMeta {
  onEdit?: (item: LocalInventoryItem) => void;
  onDelete?: (item: LocalInventoryItem) => void;
  onViewMovements?: (item: LocalInventoryItem) => void;
}

// Formatting helpers
const formatDate = (dateInput: Date | string | null) => {
  if (!dateInput) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(dateInput));
};

export const localInventoryColumns: ColumnDef<LocalInventoryItem>[] = [
  {
    accessorKey: "drug.name",
    header: "Medicine",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Pill className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm">
              {item.drug.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {item.drug.strength} {item.drug.unit} • {item.drug.dosageForm}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "batchNumber",
    header: "Batch / Mfr",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-mono text-xs font-semibold text-slate-700">{row.original.batchNumber || "—"}</span>
        <span className="text-[10px] text-slate-400">{row.original.manufacturer || "No Mfr"}</span>
      </div>
    ),
  },
  {
    accessorKey: "availableQuantity",
    header: "Stock Level",
    cell: ({ row }) => {
      const item = row.original;
      const isLow = item.availableQuantity <= item.minStockLevel;
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${isLow ? "text-amber-600" : "text-slate-900"}`}>
              {item.availableQuantity}
            </span>
            <span className="text-[10px] text-slate-400">Min: {item.minStockLevel}</span>
          </div>
          {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
        </div>
      );
    },
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ row }) => (
      <span className="text-slate-600 font-medium">
        GH₵ {Number(row.original.unitPrice || 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => (
      <span className="text-sm text-slate-600">
        {formatDate(row.original.expiryDate)}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="rounded-full">
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as LocalInventoryTableMeta | undefined;

      return (
        <div className="flex items-center justify-end gap-2 pr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-lg"
            onClick={() => meta?.onEdit?.(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => meta?.onViewMovements?.(item)}>
                <History className="h-4 w-4 mr-2 text-slate-400" />
                View Movements
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => meta?.onEdit?.(item)}>
                <Edit2 className="h-4 w-4 mr-2 text-slate-400" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => meta?.onDelete?.(item)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }
];