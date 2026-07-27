"use client";

import { useState, useTransition } from "react";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Package, 
  CheckCircle2, 
  Tag,
  Layers,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { OrderWithRelations } from "@/types/types/orders.type";
import { approveOrderAction, rejectOrderAction } from "@/lib/actions/orders.actions";

interface OrderReviewProps {
  order: OrderWithRelations;
  onSuccess?: () => void;
}

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

export default function OrderReview({ order, onSuccess }: OrderReviewProps) {
  const [isPending, startTransition] = useTransition();
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");

  const { date, time } = formatDateTime(order.createdAt);

  let statusBadgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  if (order.status === "APPROVED") statusBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (order.status === "PARTIALLY_FULFILLED" || order.status === "SHIPPED") statusBadgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
  if (order.status === "COMPLETED") statusBadgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  if (order.status === "REJECTED" || order.status === "CANCELLED") statusBadgeStyle = "bg-rose-50 text-rose-700 border-rose-200";

  let typeBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (order.type === "SUPPLY") typeBadgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (order.type === "EMERGENCY") typeBadgeStyle = "bg-rose-50 text-rose-700 border-rose-200";

  const handleApprove = (): void => {
    startTransition(async () => {
      const res = await approveOrderAction(order.id);
      if (!res.success) {
        toast.error(res.error || "Failed to approve order");
      } else {
        toast.success(res.message || "Order approved successfully");
        onSuccess?.();
      }
    });
  };

  const handleReject = (): void => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    startTransition(async () => {
      const res = await rejectOrderAction(order.id, rejectReason);
      if (!res.success) {
        toast.error(res.error || "Failed to reject order");
      } else {
        toast.success(res.message || "Order rejected successfully");
        setIsRejecting(false);
        onSuccess?.();
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Summary Header Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Created on <span className="font-semibold text-slate-700">{date}</span> at <span className="text-slate-700">{time}</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`font-bold text-[10px] px-2.5 py-1 rounded-md tracking-wide gap-1 flex items-center ${typeBadgeStyle}`}>
                <Tag className="h-3 w-3" />
                {order.type}
              </Badge>
              <Badge variant="outline" className={`font-bold text-[10px] px-2.5 py-1 rounded-md tracking-wide gap-1 flex items-center ${statusBadgeStyle}`}>
                <CheckCircle2 className="h-3 w-3" />
                {order.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          {/* Entities Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            
            {/* Requester Info */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Requester Facility</span>
                <p className="font-bold text-slate-900 text-sm">{order.requester?.name || "Internal Facility"}</p>
                <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{order.requester?.location || "—"}</span>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Target Supplier</span>
                <p className="font-bold text-slate-900 text-sm">{order.supplier?.name || "External Supplier"}</p>
                <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{order.supplier?.location || "—"}</span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Items Breakdown Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ordered Items for Review</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" />
              {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-200/80 hover:bg-slate-50/80">
                  <TableHead className="py-3 px-4 h-auto text-slate-500 font-semibold text-xs">Item Details</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-slate-500 font-semibold text-xs">Dosage / Strength</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-center text-slate-500 font-semibold text-xs">Quantity Requested</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-right text-slate-500 font-semibold text-xs">Unit Price</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-right text-slate-500 font-semibold text-xs">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => {
                  const unitPriceNum = item.unitPrice ? Number(item.unitPrice) : 0;
                  const subtotal = unitPriceNum * item.quantityRequested;

                  return (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 text-xs">
                      <TableCell className="py-3 px-4 font-bold text-slate-900">
                        {item.drug?.name || item.drugName || "—"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {item.drug?.dosageForm && (
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {item.drug.dosageForm}
                            </span>
                          )}
                          <span className="text-slate-500">{item.drug?.strength || item.strength || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center font-semibold text-slate-800">
                        {item.quantityRequested} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right text-slate-700 font-mono">
                        {formatCurrency(item.unitPrice ? Number(item.unitPrice) : 0)}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {item.unitPrice ? formatCurrency(subtotal) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Financial Summary Box */}
          <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 mt-4">
            <span className="text-xs font-bold text-slate-700">Total Value</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {formatCurrency(order.totalValue ? Number(order.totalValue) : 0)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes / Remarks Card */}
      {order.notes && (
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notes & Remarks</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              {order.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Actions Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Review Decision</h3>
            <span className="text-xs text-slate-500">Take action on order {order.customId}</span>
          </div>

          {isRejecting ? (
            <div className="space-y-3 p-4 bg-rose-50/50 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Provide a reason for rejecting this order</span>
              </div>
              <Textarea 
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-white border-rose-200 focus-visible:ring-rose-500 text-xs"
                rows={3}
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsRejecting(false);
                    setRejectReason("");
                  }}
                  disabled={isPending}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={handleReject}
                  disabled={isPending}
                  className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isPending ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRejecting(true)}
                disabled={isPending}
                className="text-xs h-9 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 gap-1.5"
              >
                <X className="h-4 w-4" />
                Reject Order
              </Button>
              <Button 
                type="button"
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
                className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
              >
                <Check className="h-4 w-4" />
                {isPending ? "Approving..." : "Approve Order"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}