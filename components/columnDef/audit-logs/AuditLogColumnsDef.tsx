"use client";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { FormattedAuditLogItem } from "@/types/types/audit.type";

// 1. Declare Table Meta interface for Audit Log Actions
export interface AuditLogTableMeta {
  onViewDetails?: (item: FormattedAuditLogItem) => void;
}

// Formatting helpers
const formatDateTime = (dateInput: Date | string | null) => {
  if (!dateInput) return { date: "—", time: "—" };
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return { date: "—", time: "—" };

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj),
  };
};

// Action Cell Component:
interface AuditLogRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}

export function AuditLogRowActions<TData extends FormattedAuditLogItem>({ 
  row, 
  table 
}: AuditLogRowActionsProps<TData>) {
  const item = row.original;
  const meta = table.options.meta as AuditLogTableMeta | undefined;

  return (
    <div className="flex items-center justify-end pr-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        onClick={() => meta?.onViewDetails?.(item)}
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Column Definitions Array
export const auditLogColumns: ColumnDef<FormattedAuditLogItem>[] = [
  {
    accessorKey: "action",
    header: "Activity",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      
      const getActionBadgeStyle = (act: string) => {
        switch (act) {
          case "LOGIN":
            return "bg-blue-50 text-blue-700 border-blue-200";
          case "INVENTORY_UPDATED":
          case "INVENTORY_ADJUSTED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
          case "ORDER_APPROVED":
          case "ORDER_DELIVERED":
            return "bg-amber-50 text-amber-700 border-amber-200";
          case "USER_CREATED":
          case "FACILITY_VERIFIED":
            return "bg-purple-50 text-purple-700 border-purple-200";
          case "ORDER_REJECTED":
            return "bg-rose-50 text-rose-700 border-rose-200";
          default:
            return "bg-slate-100 text-slate-700 border-slate-200";
        }
      };

      return (
        <Badge variant="outline" className={`font-bold text-[10px] px-2.5 py-1 rounded-md tracking-wide ${getActionBadgeStyle(action)}`}>
          {action}
        </Badge>
      );
    },
    meta: {
      filterVariant: "selectArray",
      options: [
        { value: "LOGIN", label: "LOGIN" },
        { value: "INVENTORY_UPDATED", label: "INVENTORY_UPDATED" },
        { value: "ORDER_APPROVED", label: "ORDER_APPROVED" },
        { value: "ORDER_REJECTED", label: "ORDER_REJECTED" },
        { value: "USER_CREATED", label: "USER_CREATED" },
        { value: "FACILITY_VERIFIED", label: "FACILITY_VERIFIED" },
      ],
      exportValue: (row) => row.action,
    },
  },
  {
    accessorKey: "entityType",
    header: "Entity",
    cell: ({ row }) => (
      <span className="font-medium text-slate-600">
        {row.getValue("entityType")}
      </span>
    ),
    meta: {
      filterVariant: "selectArray",
      options: [
        { value: "USER", label: "User" },
        { value: "FACILITY", label: "Facility" },
        { value: "DRUG", label: "Drug" },
        { value: "INVENTORY", label: "Inventory" },
        { value: "ORDER", label: "Order" },
        { value: "STOCK_MOVEMENT", label: "Stock Movement" },
      ],
      exportValue: (row) => row.entityType,
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <span className="text-slate-400 italic">System User</span>;
      }
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
            {user.avatarText}
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400">{user.email}</p>
          </div>
        </div>
      );
    },
    meta: {
      filterVariant: "text",
      exportValue: (row) => row.user ? `${row.user.name} (${row.user.email})` : "System User",
    },
  },
  {
    accessorKey: "facilityName",
    header: "Facility",
    cell: ({ row }) => (
      <span className="font-medium text-slate-600">
        {row.getValue("facilityName")}
      </span>
    ),
    meta: {
      filterVariant: "text",
      exportValue: (row) => row.facilityName,
    },
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => (
      <span className="font-mono text-slate-500 text-[11px]">
        {row.getValue("ipAddress") || "—"}
      </span>
    ),
    meta: {
      filterVariant: "text",
      exportValue: (row) => row.ipAddress || "",
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const { date, time } = formatDateTime(row.original.createdAt);
      return (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">{date}</p>
          <p className="text-[10px] text-slate-400 font-mono">{time}</p>
        </div>
      );
    },
    meta: {
      filterVariant: "date",
      exportValue: (row) => new Date(row.createdAt).toISOString(),
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "SUCCESS" | "WARNING" | "FAILED";

      const getStatusBadgeStyle = (st: "SUCCESS" | "WARNING" | "FAILED") => {
        switch (st) {
          case "SUCCESS":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
          case "WARNING":
            return "bg-amber-50 text-amber-700 border-amber-200";
          case "FAILED":
            return "bg-rose-50 text-rose-700 border-rose-200";
        }
      };

      const dotColor = status === 'SUCCESS' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500';

      return (
        <Badge variant="outline" className={`font-bold text-[10px] px-2 py-0.5 rounded-md gap-1 flex items-center w-fit ${getStatusBadgeStyle(status)}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {status.toLowerCase().replace(/^./, (str) => str.toUpperCase())}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
      options: [
        { value: "SUCCESS", label: "Success" },
        { value: "WARNING", label: "Warning" },
        { value: "FAILED", label: "Failed" },
      ],
      exportValue: (row) => row.status,
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => <AuditLogRowActions row={row} table={table} />,
    meta: {
      exportValue: () => "",
    },
  },
];