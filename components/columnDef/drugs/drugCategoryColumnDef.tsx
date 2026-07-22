"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DrugCategoryWithCount } from "@/types/types/drugs.types";
import { MoreHorizontal, Edit2, Trash2, FolderClosed, RefreshCcw } from "lucide-react";
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

// 1. Declare the Table Meta interface for Category Management actions
export interface DrugCategoryTableMeta {
  onEditCategory?: (category: DrugCategoryWithCount) => void;
  onDeleteCategory?: (category: DrugCategoryWithCount) => void; 
  onRestoreCategory?: (category: DrugCategoryWithCount) => void; 
}

// 2. Export the columns array with filter variants included
export const drugCategoryColumns: ColumnDef<DrugCategoryWithCount>[] = [
  {
    accessorKey: "name",
    header: "Category Name",
    meta: { filterVariant: "text" },
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/30">
            <FolderClosed className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer">
            {category.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    meta: { filterVariant: "text" },
    cell: ({ row }) => (
      <span className="text-slate-500 max-w-md block truncate">
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "drugsCount",
    header: "Drugs Count",
    meta: { filterVariant: "text" },
    cell: ({ row }) => {
      const count = row.original._count?.drugs ?? 0;
      return (
        <span className="text-slate-600 font-semibold pl-4">
          {count}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { 
      filterVariant: "select",
      trueLabel: "Active",
      falseLabel: "Inactive",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" }
      ]
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge 
          variant="outline" 
          className={`px-2.5 py-0.5 font-semibold rounded-full border ${
            isActive 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-red-50 text-slate-400 border-slate-200"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isActive ? "bg-emerald-500" : "bg-red-400"}`} />
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    meta: { filterVariant: "date" },
    cell: ({ row }) => (
      <span className="text-slate-400 font-medium">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    id: "actions",
    enableHiding: false, 
    enableSorting: false,
    enableResizing: false,
    enableColumnFilter: false,
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => {
      const category = row.original;
      const meta = table.options.meta as DrugCategoryTableMeta | undefined;

      return (
        <div className="flex items-center justify-end gap-2 pr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            onClick={() => meta?.onEditCategory?.(category)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-sans">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer text-slate-700"
                onClick={() => meta?.onEditCategory?.(category)}
              >
                <Edit2 className="h-4 w-4 text-slate-400" />
                Edit Properties
              </DropdownMenuItem>

              {category.isActive ? (
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => meta?.onDeleteCategory?.(category)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  Deactivate Category
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50"
                  onClick={() => meta?.onRestoreCategory?.(category)}
                >
                  <RefreshCcw className="h-4 w-4 text-emerald-600" />
                  Restore / Activate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }
];