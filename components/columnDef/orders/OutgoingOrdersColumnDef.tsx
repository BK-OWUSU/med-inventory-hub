"use client";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Eye,
  Ban,
  CheckCircle2,
  Building2,
  Edit2
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
import { OrderWithRelations } from "@/types/types/orders.type";
import { cancelOrderAction } from "@/lib/actions/orders.actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { useOrderStore } from "@/store/order.store";
import AlertWithDialogue from "@/components/custom/alerts/AlertWithDialogue";
import { Can } from "@/components/security/Can";
import { PERMISSIONS } from "@/lib/constants/permisions";

// 1. Declare Table Meta interface for Outgoing Order Actions
export interface OutgoingOrderTableMeta {
  onUpdateOrder?: (order: OrderWithRelations) => void;
  onViewDetails?: (order: OrderWithRelations) => void;
  onCancelOrder?: (order: OrderWithRelations) => void;
  onReceiveOrder?: (order: OrderWithRelations) => void;
}

// Formatting helpers
const formatDateTime = (dateInput: Date | string | null) => {
  if (!dateInput) return { date: "—", time: "—" };
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return { date: "—", time: "—" };

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj),
  };
};

const formatCurrency = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined) return "—";
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(numericAmount)) return "—";

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    currencyDisplay: "code"
  }).format(numericAmount).replace("GHS", "GHC");
};

// Action Cell Component for Outgoing Orders:
interface OutgoingOrderRowActionsProps {
  row: Row<OrderWithRelations>;
  table: Table<OrderWithRelations>;
}

export function OutgoingOrderRowActions({ 
  row, 
  table 
}: OutgoingOrderRowActionsProps) {
  const { fetchOutgoingOrders } = useOrderStore();
  const order = row.original;
  const meta = table.options.meta as OutgoingOrderTableMeta | undefined;
  const [isPending, startTransition] = useTransition();

  const handleCancelOrder = (reason: string): void => {
    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    startTransition(async () => {
      const res = await cancelOrderAction(order.id, reason);
      if (!res.success) {
        toast.error(res.error || "Failed to cancel order");
      } else {
        toast.success(res.message || "Order cancelled successfully");
        fetchOutgoingOrders();
      }
    });
  };

  // Determine primary action button based on order status for outgoing requests
  const renderPrimaryAction = () => {
    switch (order.status) {
      case "PENDING":
        return (
           <Can
            permission={PERMISSIONS.ORDER_CANCEL}
            fallback={<Badge>Read Only</Badge>}>      
          <AlertWithDialogue
            buttonText="Cancel Order"
            buttonVariant="destructive"
            title="Cancel Order Request"
            message="Are you sure you want to cancel this order? This action will restore inventory if the items were already shipped."
            confirmText="Confirm Cancellation"
            cancelText="Go Back"
            showInput={true}
            button={
              <Button 
                variant="destructive"
                size="sm"
                className="h-8 text-xs font-semibold rounded-lg px-3 shadow-xs"
              >
                Cancel
              </Button>
            }
            inputPlaceholder="Provide the reason for cancelling this order..."
            confirmFunction={(reason) => {
              if (reason) {
                handleCancelOrder(reason);
              }
            }}
            />
          </Can>
        );
      case "SHIPPED":
      case "APPROVED":
        return (
           <Can
            permission={PERMISSIONS.ORDER_RECEIVE}
            fallback={<Badge>Read Only</Badge>}>      
          <Button
            disabled={isPending}
            size="sm"
            className="h-8 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg px-3 shadow-xs"
            onClick={() => meta?.onReceiveOrder?.(order)}
          >
            Receive
          </Button>
          </Can>
        );
      default:
        return (
           <Can
            permission={PERMISSIONS.ORDER_VIEW}
            fallback={<Badge>Read Only</Badge>}>      
          <Button 
            variant="outline"
            size="sm"
            className="h-8 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg px-3"
            onClick={() => meta?.onViewDetails?.(order)}
          >
            View
          </Button>
          </Can>
        );
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 pr-2">
      {renderPrimaryAction()}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <Can
            permission={PERMISSIONS.ORDER_CREATE}
            fallback={<Badge>Read Only</Badge>}>      
          <DropdownMenuItem onClick={() => meta?.onUpdateOrder?.(order)}>
            <Edit2 className="h-4 w-4 mr-2 text-slate-400" />
            Update Order
          </DropdownMenuItem>
          </Can>
           <Can
            permission={PERMISSIONS.ORDER_VIEW}
            fallback={<Badge>Read Only</Badge>}>
          <DropdownMenuItem onClick={() => meta?.onViewDetails?.(order)}>
            <Eye className="h-4 w-4 mr-2 text-slate-400" />
            View details
          </DropdownMenuItem>
          </Can>
          {order.status === "PENDING" && (
           <Can
            permission={PERMISSIONS.ORDER_CANCEL}
            fallback={<Badge>Read Only</Badge>}>
            <AlertWithDialogue
              buttonText="Cancel Order"
              buttonVariant="destructive"
              title="Cancel Order Request"
              message="Are you sure you want to cancel this order? This action will restore inventory if the items were already shipped."
              confirmText="Confirm Cancellation"
              cancelText="Go Back"
              showInput={true}
              button={
                <DropdownMenuItem 
                  disabled={isPending}
                  onSelect={(e) => e.preventDefault()}
                  className="text-rose-600 focus:text-rose-600"
                >
                  <Ban className="h-4 w-4 mr-2 text-rose-400" />
                  Cancel Order
                </DropdownMenuItem>
              }
              inputPlaceholder="Provide the reason for cancelling this order..."
              confirmFunction={(reason) => {
                if (reason) {
                  handleCancelOrder(reason);
                }
              }}
            />
            </Can>
          )}

          {(order.status === "SHIPPED" || order.status === "APPROVED") && (
             <Can
                permission={PERMISSIONS.ORDER_RECEIVE}
                fallback={<Badge>Read Only</Badge>}>      
             <DropdownMenuItem onClick={() => meta?.onReceiveOrder?.(order)}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
              Receive Order
            </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Column Definitions for Outgoing Orders
export const outgoingOrdersColumns: ColumnDef<OrderWithRelations>[] = [
  {
    accessorKey: "customId",
    header: "Order Info",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-bold text-slate-900">{row.original.customId}</span>
        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{row.original.orderNumber}</span>
      </div>
    ),
  },
  {
    accessorKey: "supplier",
    header: "Target Supplier",
    cell: ({ row }) => {
      const supplier = row.original.supplier;
      return (
        <div className="flex items-start gap-2">
          <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
            <Building2 className="h-3.5 w-3.5 text-indigo-700" />
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-bold text-slate-900">{supplier?.name || "External Supplier"}</span>
            <span className="text-[10px] text-slate-400 font-normal">{supplier?.location || "—"}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Order Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const isRequest = type === "REQUEST";
      return (
        <Badge 
          variant="outline" 
          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-md tracking-wide w-fit ${
            isRequest 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Placed",
    cell: ({ row }) => {
      const { date, time } = formatDateTime(row.original.createdAt);
      return (
        <div className="flex flex-col text-xs font-sans">
          <span className="font-semibold text-slate-900">{date}</span>
          <span className="text-slate-400 text-[10px] mt-0.5">{time}</span>
        </div>
      );
    },
  },
  {
    id: "requestedBy",
    accessorKey: "requester",
    header: "Placed By",
    cell: ({ row }) => {
      const requestedBy = row.original.requester;
      return (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-800">{requestedBy?.name || "System User"}</span>
          <span className="text-[10px] text-slate-400">Procurement Staff</span>
        </div>
      );
    },
  },
  {
    id: "itemsSummary",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const totalUnits = items.reduce((sum, item) => sum + item.quantityRequested, 0);
      return (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-900">{items.length} {items.length === 1 ? "item" : "items"}</span>
          <span className="text-[10px] text-slate-400 font-normal mt-0.5">{totalUnits} units</span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      return (
        <span className="text-xs font-bold text-slate-900 font-sans">
         {formatCurrency(Number(row.original.totalValue || 0))}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      
      let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200"; // PENDING
      if (status === "APPROVED") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      if (status === "PARTIALLY_FULFILLED" || status === "SHIPPED") badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
      if (status === "COMPLETED") badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
      if (status === "REJECTED" || status === "CANCELLED") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
      const formattedStatus = status.replace(/_/g, " ");
      return (
        <Badge 
          variant="outline" 
          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-md tracking-wide w-fit ${badgeStyle}`}
        >
          {formattedStatus}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right pr-4">Action</div>,
    cell: ({ row, table }) => <OutgoingOrderRowActions row={row} table={table} />,
  },
];