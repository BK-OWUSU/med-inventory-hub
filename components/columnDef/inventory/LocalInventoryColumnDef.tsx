"use client";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Edit2, 
  Eye,
  Trash2, 
  Pill, 
  AlertTriangle, 
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
import { LocalInventoryItem } from "@/types/types/inventory.type";
import { toast } from "sonner";
import { useTransition } from "react";
import { deactivateInventory } from "@/lib/actions/inventory.action";
import { useInventoryStore } from "@/store/inventoryStore";


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

//Action Cell:
interface InventoryRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}
export function InventoryRowActions<TData extends LocalInventoryItem>({ 
  row, 
  table 
}: InventoryRowActionsProps<TData>) {
  const {fetchLocalInventory} = useInventoryStore()
  const [isPending, startTransition] = useTransition();
  const item = row.original;
  const meta = table.options.meta as LocalInventoryTableMeta | undefined;

  const handleDeactivate = () => {
    startTransition(() => {      
      toast.promise(
        async () => {
          const res = await deactivateInventory(item.id);
          if (!res.success) {
            throw new Error(res.error || "Failed to deactivate inventory batch");
          }
          return res;
        }, 
        {
          loading: "Deactivating inventory...", 
          success: (res) => {
            fetchLocalInventory();
            return res.message || "Inventory batch deactivated successfully"
          },
          error: (err) => err.message || "Failed to deactivate inventory batch"
        }
      );
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 pr-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-lg"
        disabled={isPending}
        onClick={() => meta?.onViewMovements?.(item)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
            disabled={isPending}
          >
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
            disabled={!item.isActive ||isPending}
            onClick={handleDeactivate}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deactivate Batch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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
    header: "Batch No.",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-mono text-xs font-semibold text-slate-700">{row.original.batchNumber || "—"}</span>
      </div>
    ),
  },
    {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-600">{row.original.manufacturer || "No Mfr"}</span>
      </div>
    ),
  },
  {
    accessorKey: "availableQuantity",
    header: "QTY",
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
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      
      if (!expiryDate) {
        return <span className="text-sm text-slate-400">N/A</span>;
      }
      // Compare the timestamp to check if it's in the past
      const isExpired = new Date(expiryDate).getTime() < new Date().getTime();
      return (
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isExpired ? "text-red-600 font-medium" : "text-slate-600"}`}>
            {formatDate(expiryDate)}
          </span>
          {isExpired && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-200 animate-pulse">
              Expired
            </span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "isActive",
    header: "Status",
    filterFn: "equals",
    meta: {
      filterVariant: "select",
      trueLabel: "Active",
      falseLabel: "Inactive"
    },
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
    cell: ({ row, table }) => <InventoryRowActions row={row} table={table} />,
  }
];

