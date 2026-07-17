"use client";

import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  User2, 
  Mail, 
  Phone, 
  Shield,
  ShieldCheck,
  Clock,
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
import { UserListResponse } from "@/types/types/user.types";
import { UserRole } from "@/generated/prisma/browser";

type User = UserListResponse['users'][number];

export interface UserTableMeta {
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

const formatDate = (dateInput: Date | string | null) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const roleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ADMIN":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PHARMACIST":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "STAFF":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "VIEWER":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
          <User2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-sm">{row.original.fullName}</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
            {row.original.customId}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Mail className="h-3 w-3 text-slate-400" />
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      if (role === "SUPER_ADMIN") {
        return <span className="text-xs text-slate-400 font-medium">Restricted</span>;
      }
      return (
        <Badge variant="outline" className={`${roleBadgeVariant(role)}`}>
          {role.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "facility",
    header: "Facility",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs text-slate-900 font-medium">
          {row.original.facility?.name || "—"}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {row.original.facility?.customId || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Phone className="h-3 w-3 text-slate-400" />
        {row.original.phone || "—"}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant="outline" className={`px-2 py-0.5 rounded-full border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "needsPasswordChange",
    header: "Password",
    cell: ({ row }) => {
      const needsChange = row.original.needsPasswordChange;
      return (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${needsChange ? "text-amber-700" : "text-emerald-700"}`}>
          {needsChange ? <Clock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {needsChange ? "Change Required" : "Secure"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarClock className="h-3 w-3 text-slate-400" />
        {formatDate(row.original.lastLoginAt)}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => <span className="text-sm text-slate-500">{formatDate(row.original.createdAt)}</span>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as UserTableMeta | undefined;

      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => meta?.onEdit?.(user)}>
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
              <DropdownMenuItem onClick={() => meta?.onToggleStatus?.(user)}>
                <Shield className="h-4 w-4 mr-2" /> Toggle Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => meta?.onEdit?.(user)}>
                <Edit2 className="h-4 w-4 mr-2" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => meta?.onDelete?.(user)}>
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }
];
