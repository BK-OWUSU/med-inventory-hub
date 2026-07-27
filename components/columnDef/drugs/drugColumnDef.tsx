"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DrugWithCategory } from "@/types/types/drugs.types";
import { MoreHorizontal, Eye, Edit2, Trash2, Pill } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/security/Can";
import { PERMISSIONS } from "@/lib/constants/permisions";

// Safe date formatter helper
const formatDate = (dateInput: Date | string) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export interface DrugTableMeta {
  currentFacilityId?: string;
  onViewDrug?: (drug: DrugWithCategory) => void;
  onEditDrug?: (drug: DrugWithCategory) => void;
  onDeleteDrug?: (drug: DrugWithCategory) => void;
  onRequestTransfer?: (drugId: string, sourceFacilityId: string, sourceFacilityName: string) => void;
}

export const drugsColumns: ColumnDef<DrugWithCategory>[] = [
  {
    accessorKey: "name",
    header: "Drug Name",
    meta: { filterVariant: "text" },
    cell: ({ row }) => {
      const drug = row.original;
      return (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 text-emerald-600">
            <Pill className="h-4 w-4" />
          </div>
          <span className="font-medium text-slate-900">{drug.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "genericName",
    header: "Generic Name",
    meta: { filterVariant: "text" },
    cell: ({ row }) => (
      <span className="text-slate-500">{row.original.genericName || "—"}</span>
    ),
  },
  {
    accessorKey: "strength",
    header: "Strength",
    meta: { filterVariant: "text" },
    cell: ({ row }) => (
      <span className="text-slate-600 font-medium">{row.original.strength || "—"}</span>
    ),
  },
  {
    accessorKey: "dosageForm",
    header: "Dosage Form",
    meta: { filterVariant: "text" },
    cell: ({ row }) => (
      <span className="text-slate-500">{row.original.dosageForm || "—"}</span>
    ),
  },
  {
    accessorKey: "category.name",
    header: "Category",
    meta: { filterVariant: "text" },
    cell: ({ row }) => {
      const categoryName = row.original.category?.name;
      return categoryName ? (
        <span className="text-emerald-700 font-medium hover:underline cursor-pointer">
          {categoryName}
        </span>
      ) : (
        <span className="text-slate-400">Uncategorized</span>
      );
    },
  },
  {
    accessorKey: "stockStatus",
    header: "Stock Status",
    meta: { 
      filterVariant: "selectArray",
      options: [
        { label: "In Stock", value: "in-stock" },
        { label: "Low Stock", value: "low-stock" },
        { label: "Out of Stock", value: "out-of-stock" }
      ]
    },
    cell: ({ row, table }) => {
      const drug = row.original;
      const meta = table.options.meta as DrugTableMeta | undefined;
      const localFacilityId = meta?.currentFacilityId;
      const inventories = drug.inventories || [];
      const localStock = inventories.find((inv) => inv.facilityId === localFacilityId);
      const localQty = localStock?.availableQuantity ?? 0;
      const localMin = localStock?.minStockLevel ?? 20;

      const peerStocks = inventories.filter(
        (inv) => inv.facilityId !== localFacilityId && inv.availableQuantity > 0
      );
      const totalPeerQty = peerStocks.reduce((acc, curr) => acc + curr.availableQuantity, 0);

      let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      let statusLabel = "In Stock";
      if (localQty === 0) { badgeStyle = "bg-rose-50 text-rose-700 border-rose-200"; statusLabel = "Out of Stock"; } 
      else if (localQty <= localMin) { badgeStyle = "bg-amber-50 text-amber-700 border-amber-200"; statusLabel = "Low Stock"; }

      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${badgeStyle} px-2 py-0.5 font-semibold`}>
            {statusLabel} ({localQty})
          </Badge>
          {totalPeerQty > 0 && (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center p-1 rounded-full hover:bg-slate-100 text-indigo-600 transition-colors">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] py-0.5 px-1.5 font-bold cursor-pointer">
                      Peer: {totalPeerQty}
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="p-3 w-64 border bg-white shadow-lg text-slate-800 rounded-md">
                   <p className="font-semibold text-xs border-b pb-1.5 text-slate-900 mb-1.5">Other Branches</p>
                   {peerStocks.map((p) => (
                     <div key={p.id} className="flex justify-between text-xs text-slate-700">
                       <span>{p.facility?.name}</span>
                       <span className="font-bold text-slate-900">{p.availableQuantity}</span>
                     </div>
                   ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isControlled",
    header: "Controlled",
    meta: { 
      filterVariant: "select",
      options: [
        { label: "Controlled", value: "true" },
        { label: "Regular", value: "false" }
      ]
    },
    cell: ({ row }) => {
      const isControlled = row.original.isControlled;
      return isControlled ? (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-medium px-2.5 py-0.5 rounded-md">Controlled</Badge>
      ) : (
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium px-2.5 py-0.5 rounded-md">Regular</Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { 
      filterVariant: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" }
      ]
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className={isActive ? "text-slate-900" : "text-slate-400"}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    meta: { filterVariant: "date" },
    cell: ({ row }) => (
      <span className="text-slate-400">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    enableColumnFilter: false,
    header: "Actions",
    cell: ({ row, table }) => {
      const drug = row.original;
      const meta = table.options.meta as DrugTableMeta | undefined;
      const localFacilityId = meta?.currentFacilityId;

      const peerStocks = (drug.inventories || []).filter(
        (inv) => inv.facilityId !== localFacilityId && inv.availableQuantity > 0
      );

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Can
              permission={PERMISSIONS.DRUG_VIEW}
              fallback={<Badge>Read Only</Badge>}>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-slate-700"
              onClick={() => meta?.onViewDrug?.(drug)}
              >
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            </Can>
            <Can
              permission={[PERMISSIONS.DRUG_UPDATE]}
              fallback={<Badge>Read Only</Badge>}>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-slate-700"
              onClick={() => meta?.onEditDrug?.(drug)}
              >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            </Can>

            {peerStocks.length > 0 && meta?.onRequestTransfer && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] font-bold text-indigo-600 px-2 py-1">
                  Request Med Transfer
                </DropdownMenuLabel>
                {peerStocks.map((stock) => (
                  <DropdownMenuItem
                    key={stock.id}
                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-indigo-700 focus:bg-indigo-50 focus:text-indigo-800"
                    onClick={() => meta.onRequestTransfer?.(drug.id, stock.facilityId, stock.facility?.name || "Other Clinic")}
                  >
                    From {stock.facility?.name || "Other Branch"} ({stock.availableQuantity} left)
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <Can
              permission={PERMISSIONS.DRUG_DELETE}
              fallback={<Badge>Read Only</Badge>}>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => meta?.onDeleteDrug?.(drug)}
              >
              <Trash2 className="h-4 w-4" />
                Delete
            </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];