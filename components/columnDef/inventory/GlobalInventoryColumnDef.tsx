"use client";

import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Pill, 
  History, 
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
import { GlobalInventoryItem } from "@/types/types/inventory.type";
import { Prisma } from "@/generated/prisma/client";

export interface InventoryTableMeta {
  onEdit?: (item: GlobalInventoryItem) => void;
  onDelete?: (item: GlobalInventoryItem) => void;
  onViewMovements?: (item: GlobalInventoryItem) => void;
}

// Formatters
const formatCurrency = (amount: Prisma.Decimal | null) => {
  const value = typeof amount === 'object' ? Number(amount) : amount;
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(value || 0);
};

const formatDate = (dateInput: Date | string | null, includeTime = false) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  }).format(date);
};

export const inventoryColumns: ColumnDef<GlobalInventoryItem>[] = [
  {
    accessorKey: "drug.name",
    header: "Drug / Strength / Form",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
          <Pill className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-sm">{row.original.drug.name}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
            {row.original.drug.dosageForm || "—"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "batchNumber",
    header: "Batch No.",
    cell: ({ row }) => <span className="text-xs font-mono text-slate-600">{row.original.batchNumber}</span>,
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.manufacturer || "—"}</span>,
  },
  {
    accessorKey: "availableQuantity",
    header: "Available Qty",
    cell: ({ row }) => <span className="font-semibold text-sm text-slate-900">{row.original.availableQuantity}</span>,
  },
  {
    accessorKey: "minStockLevel",
    header: "Min. Level",
    cell: ({ row }) => <span className="text-sm text-slate-500">{row.original.minStockLevel}</span>,
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCurrency(row.original.unitPrice)}</span>,
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => <span className="text-sm text-slate-600">{formatDate(row.original.expiryDate)}</span>,
  },
{
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const item = row.original;
      const today = new Date();
      const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
      const isExpiringSoon = expiry && expiry > today && expiry < new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
      const isExpired = expiry && expiry < today;
      const isLowStock = item.availableQuantity <= item.minStockLevel;

      // Removed 'variant' as it was unused and triggered the eslint error
      let text = "In Stock";
      let classes = "bg-emerald-50 text-emerald-700 border-emerald-200";

      if (isExpired) {
        text = "Expired";
        classes = "bg-slate-100 text-slate-600 border-slate-200";
      } else if (isExpiringSoon) {
        text = "Expiring Soon";
        classes = "bg-rose-50 text-rose-700 border-rose-200";
      } else if (isLowStock) {
        text = "Low Stock";
        classes = "bg-amber-50 text-amber-700 border-amber-200";
      }

      return (
        <Badge variant="outline" className={`px-2 py-0.5 rounded-full border ${classes}`}>
          {text}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => <span className="text-sm text-slate-500">{formatDate(row.original.lastUpdated, true)}</span>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as InventoryTableMeta | undefined;

      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => meta?.onEdit?.(item)}>
            <Edit2 className="h-4 w-4 text-slate-400" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => meta?.onViewMovements?.(item)}>
                <History className="h-4 w-4 mr-2" /> View Movements
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => meta?.onEdit?.(item)}>
                <Edit2 className="h-4 w-4 mr-2" /> Edit Record
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => meta?.onDelete?.(item)}>
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }
];