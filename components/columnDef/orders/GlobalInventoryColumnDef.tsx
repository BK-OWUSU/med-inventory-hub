"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { 
  MoreHorizontal,  
  Pill, 
  History,
  ShoppingCart 
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
import { useRequisitionCartStore } from "@/store/requisition-cart.store";

export interface InventoryTableMeta {
  onAddToCart?: (item: GlobalInventoryItem) => void;
  onViewDetails?: (item: GlobalInventoryItem) => void;
}

// Formatters
const formatCurrency = (amount: Prisma.Decimal | null | number) => {
  const value = typeof amount === 'object' && amount !== null ? Number(amount) : (amount || 0);
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(value);
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

interface AvailableQuantityCellProps<TData extends GlobalInventoryItem> {
  row: Row<TData>;
}

export function AvailableQuantityCell<TData extends GlobalInventoryItem>({ 
  row 
}: AvailableQuantityCellProps<TData>) {
  const item = row.original;
  
  // Zustand store hook is fully valid here because this is a proper React component
  const cartItems = useRequisitionCartStore((state) => state.items);
  const cartItem = cartItems.find((ci) => ci.inventoryId === item.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const effectiveQuantity = item.availableQuantity - quantityInCart;
  const batchCount = item.drug._count?.inventories ?? 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-900 text-xs">
          {effectiveQuantity}
        </span>
        {quantityInCart > 0 && (
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded font-medium">
            -{quantityInCart} in cart
          </span>
        )}
      </div>
      <span className="text-[10px] text-slate-400 font-medium">
        {batchCount} {batchCount === 1 ? 'batch' : 'batches'}
      </span>
    </div>
  );
}

export const globalInventoryColumns: ColumnDef<GlobalInventoryItem>[] = [
  {
    accessorKey: "drug.name",
    header: "Drug",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100/80 shrink-0">
          <Pill className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 text-xs tracking-tight">{row.original.drug.name}</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            {row.original.drug.dosageForm || "—"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "facility",
    header: "Facility",
    cell: ({ row }) => (
      <div className="flex flex-col py-0.5">
        <span className="font-semibold text-slate-900 text-xs">{row.original.facility.name}</span>
        <span className="text-[10px] text-slate-400 font-medium">
          {row.original.facility.location || "—"}
        </span>
      </div>
    ),
  }, 
  {
    accessorKey: "batchNumber",
    header: "Batch No.",
    cell: ({ row }) => (
      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
        {row.original.batchNumber || "—"}
      </span>
    ),
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.manufacturer || "—"}</span>,
  },
 {
    accessorKey: "availableQuantity",
    header: "Available Qty",
    cell: ({ row }) => <AvailableQuantityCell row={row} />,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <span className="text-xs text-slate-700 font-medium">{row.original.drug.unit}</span>,
  },
  {
    accessorKey: "minStockLevel",
    header: "Min. Level",
    cell: ({ row }) => <span className="text-xs text-slate-500 font-medium">{row.original.minStockLevel}</span>,
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ row }) => <span className="text-xs font-semibold text-slate-900">{formatCurrency(row.original.unitPrice)}</span>,
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const isExpired = row.original.expiryDate && new Date(row.original.expiryDate) < new Date();
      return (
        <span className={`text-xs font-medium ${isExpired ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
          {formatDate(row.original.expiryDate)}
        </span>
      );
    },
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

      let text = "In Stock";
      let classes = "bg-emerald-50 text-emerald-700 border-emerald-200/60";

      if (isExpired) {
        text = "Expired";
        classes = "bg-slate-100 text-slate-600 border-slate-200";
      } else if (isExpiringSoon) {
        text = "Expiring Soon";
        classes = "bg-rose-50 text-rose-700 border-rose-200/60";
      } else if (isLowStock) {
        text = "Low Stock";
        classes = "bg-amber-50 text-amber-700 border-amber-200/60";
      }

      return (
        <Badge variant="outline" className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${classes}`}>
          {text}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "lastUpdated",
  //   header: "Last Updated",
  //   cell: ({ row }) => <span className="text-xs text-slate-500">{formatDate(row.original.lastUpdated, true)}</span>,
  // },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as InventoryTableMeta | undefined;

      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button 
            onClick={() => meta?.onAddToCart?.(item)}
            size="sm"
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold h-8 px-3 rounded-lg text-xs shadow-xs transition-all gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Order</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuLabel className="text-xs text-slate-400 font-normal">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => meta?.onViewDetails?.(item)}
                className="text-xs font-medium cursor-pointer gap-2"
              >
                <History className="h-4 w-4 text-slate-500" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }
];