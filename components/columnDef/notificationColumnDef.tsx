"use client";

import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Bell, 
  CheckCircle2, 
  CircleOff,
  Building2,
  CalendarClock
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
import { NotificationListResponse } from "@/types/types/notification.types";

type Notification = NotificationListResponse['notifications'][number];

export interface NotificationTableMeta {
  onMarkAsRead?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
}

const formatDate = (dateInput: Date | string | null) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const notificationColumns: ColumnDef<Notification>[] = [
  {
    accessorKey: "title",
    header: "Notification",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className={`flex items-center justify-center h-8 w-8 rounded-lg border ${row.original.isRead ? "bg-slate-50 text-slate-400 border-slate-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className={`font-bold text-sm ${row.original.isRead ? "text-slate-500" : "text-slate-900"}`}>{row.original.title}</span>
          <span className="text-[10px] text-slate-500 line-clamp-1">{row.original.message}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "facility",
    header: "Facility",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Building2 className="h-3 w-3 text-slate-400" />
        {row.original.facility?.name || "—"}
      </div>
    ),
  },
  {
    accessorKey: "isRead",
    header: "Status",
    cell: ({ row }) => {
      const isRead = row.original.isRead;
      return (
        <Badge variant="outline" className={`px-2 py-0.5 rounded-full border ${isRead ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {isRead ? "Read" : "Unread"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Received",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarClock className="h-3 w-3 text-slate-400" />
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const notification = row.original;
      const meta = table.options.meta as NotificationTableMeta | undefined;

      return (
        <div className="flex items-center justify-end gap-2">
          {!notification.isRead && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => meta?.onMarkAsRead?.(notification)}>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {!notification.isRead && (
                <DropdownMenuItem onClick={() => meta?.onMarkAsRead?.(notification)}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" /> Mark as Read
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => meta?.onDelete?.(notification)}>
                <CircleOff className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }
];
