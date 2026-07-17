"use client";

import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Edit2, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FacilityListResponse } from "@/types/types/facility.type";
import React from "react";
import { toast } from "sonner";
import { verifyFacility } from "@/lib/actions/facilities.action";
import { useFacilityStore } from "@/store/facilityStore";

type Facility = FacilityListResponse['facilities'][number];

export interface FacilityTableMeta {
  onEdit?: (facility: Facility) => void;
  onDelete?: (facility: Facility) => void;
  onVerify?: (facility: Facility) => void; // New action added
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

// 1. Extract the Action Component
const FacilityActions = ({ facility, meta }: { facility: Facility, meta?: FacilityTableMeta }) => {
  const isSystemGlobal = facility.type === "SYSTEM_GLOBAL";
  const [isPending, startTransition] = React.useTransition()
  const {fetchFacilities} = useFacilityStore();

  // You can define specific handlers here if needed, 
  // or simply keep using the meta functions provided
  const handleApprove = () => {
     startTransition(() => {
      toast.promise(
        async () => {
          const res = await verifyFacility(facility.id);
          if (!res.success) throw new Error(res.error || `Failed approve approve ${facility.name} facility`);
          return res;
        },
        {
          loading: `Approving ${facility.name}...`,
          success: () => {
            fetchFacilities();
            return `Approved ${facility.name} facility successfully`;
          },
          error: (err) => err.message
        }
      )
    })
  };
  const handleEdit = () => meta?.onEdit?.(facility);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        disabled={isSystemGlobal} 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={handleEdit}
      >
        <Edit2 className="h-4 w-4 text-slate-400" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isSystemGlobal} variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {/* Verify Action */}
          {!facility.isVerified && (
            <DropdownMenuItem disabled={isSystemGlobal || isPending} onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
              Approve
            </DropdownMenuItem>
          )}

          <DropdownMenuItem disabled={isSystemGlobal} onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit Facility
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const facilityColumns: ColumnDef<Facility>[] = [
  {
    accessorKey: "name",
    header: "Facility",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-sm">{row.original.name}</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
            {row.original.customId}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    meta: {
        filterVariant: "select",
        options: [
            { label: "Hospital", value: "HOSPITAL" },
            { label: "Pharmacy", value: "PHARMACY" },
            { label: "Clinic", value: "CLINIC" },
            { label: "System Global", value: "SYSTEM_GLOBAL" },
        ]
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <MapPin className="h-3 w-3 text-slate-400" />
        {row.original.location}
      </div>
    ),
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <Phone className="h-3 w-3 text-slate-400" />
          {row.original.phone || "—"}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Mail className="h-3 w-3 text-slate-400" />
          {row.original.email || "—"}
        </div>
      </div>
    ),
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
        <Badge variant="outline" className={`px-2 py-0.5 rounded-full border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
           {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: "Verification",
    meta: {
        filterVariant: "select",
        trueLabel: "Verified",
        falseLabel: "Pending",
        options: [
            { label: "Verified", value: "true" },
            { label: "Pending", value: "false" }
        ]
    },
    cell: ({ row }) => {
      const isVerified = row.original.isVerified;
      return (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isVerified ? "text-emerald-700" : "text-amber-700"}`}>
           {isVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
           {isVerified ? "Verified" : "Pending"}
        </div>
      );
    },
  },
  {
    accessorKey: "_count.users",
    header: "Users",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Users className="h-3.5 w-3.5 text-slate-400" />
        {row.original._count.users}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Added On",
    meta: { filterVariant: "date" },
    cell: ({ row }) => <span className="text-sm text-slate-500">{formatDate(row.original.createdAt)}</span>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as FacilityTableMeta | undefined;
      return <FacilityActions facility={row.original} meta={meta} />;
    },
  }
];