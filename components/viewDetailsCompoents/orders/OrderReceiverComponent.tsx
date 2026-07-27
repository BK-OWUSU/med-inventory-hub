"use client";
import { useEffect, useState, useTransition } from "react";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Package, 
  CheckCircle2, 
  Tag,
  Layers,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { receiveOrderAction } from "@/lib/actions/orders.actions";
// Import your receive order server action here:
// import { receiveOrderAction } from "@/lib/actions/orders.actions";

interface OrderReceiveProps {
  order: OrderWithRelations;
  onSuccess?: () => void;
}

const formatDateTime = (dateInput: Date | string | null) => {
  if (!dateInput) return { date: "—", time: "—" };
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return { date: "—", time: "—" };

  return {
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(dateObj),
    time: new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(dateObj),
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

export default function OrderReceive({ order, onSuccess }: OrderReceiveProps) {
  const [isPending, startTransition] = useTransition();
  
  // Track input state for each item (Quantity Supplied & Batch Number)
// ✅ Initialize state lazily using a function inside useState
  const [itemInputs, setItemInputs] = useState<Record<string, { quantitySupplied: number; batchNumber: string }>>(() => {
    const initialValues: Record<string, { quantitySupplied: number; batchNumber: string }> = {};
    order.items.forEach((item) => {
      initialValues[item.id] = {
        quantitySupplied: item.quantityRequested, // Default to full requested amount
        batchNumber: "", // User fills this in from physical delivery notes
      };
    });
    return initialValues;
  });

  const handleInputChange = (itemId: string, field: "quantitySupplied" | "batchNumber", value: string | number) => {
    setItemInputs((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const { date, time } = formatDateTime(order.createdAt);

  const handleReceiveOrder = () => {
    // Validate inputs before submitting
    for (const item of order.items) {
      const input = itemInputs[item.id];
      if (!input?.batchNumber.trim()) {
        toast.error(`Batch number is required for item: ${item.drug?.name || item.drugName}`);
        return;
      }
      if (input.quantitySupplied <= 0) {
        toast.error(`Supplied quantity must be greater than zero for ${item.drug?.name || item.drugName}`);
        return;
      }
    }

    const receivedItemsInput = order.items.map((item) => ({
      orderItemId: item.id,
      quantitySupplied: Number(itemInputs[item.id]?.quantitySupplied || 0),
      batchNumber: itemInputs[item.id]?.batchNumber.trim() || "",
    }));

    startTransition(async () => {
      // Call your action: 
      const res = await receiveOrderAction(order.id, receivedItemsInput);
      if (!res.success) {
        toast.error(res.error || "Failed to process order receipt.");
      } else {
        toast.success(res.message);
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
              <Badge variant="outline" className="font-bold text-[10px] px-2.5 py-1 rounded-md tracking-wide gap-1 flex items-center bg-emerald-50 text-emerald-700 border-emerald-200">
                <Tag className="h-3 w-3" />
                {order.type}
              </Badge>
              <Badge variant="outline" className="font-bold text-[10px] px-2.5 py-1 rounded-md tracking-wide gap-1 flex items-center bg-sky-50 text-sky-700 border-sky-200">
                <CheckCircle2 className="h-3 w-3" />
                {order.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          {/* Entities Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
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

      {/* Items Breakdown & Receiving Inputs Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Receive Order Items & Assign Batches</h3>
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
                  <TableHead className="py-3 px-4 h-auto text-center text-slate-500 font-semibold text-xs">Requested</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-center text-slate-500 font-semibold text-xs">Quantity Supplied</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-slate-500 font-semibold text-xs">Batch Number *</TableHead>
                  <TableHead className="py-3 px-4 h-auto text-right text-slate-500 font-semibold text-xs">Unit Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => {
                  const values = itemInputs[item.id] || { quantitySupplied: item.quantityRequested, batchNumber: "" };

                  return (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 text-xs">
                      <TableCell className="py-3 px-4 font-bold text-slate-900">
                        <div>{item.drug?.name || item.drugName || "—"}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {item.drug?.dosageForm} {item.drug?.strength}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-center font-semibold text-slate-800">
                        {item.quantityRequested} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                      </TableCell>

                      {/* Quantity Supplied Input */}
                      <TableCell className="py-3 px-4 text-center">
                        <Input 
                          type="number"
                          min="1"
                          max={item.quantityRequested}
                          value={values.quantitySupplied}
                          onChange={(e) => handleInputChange(item.id, "quantitySupplied", parseInt(e.target.value) || 0)}
                          className="h-8 w-20 mx-auto text-center text-xs"
                        />
                      </TableCell>

                      {/* Batch Number Input (Required for receiving) */}
                      <TableCell className="py-3 px-4">
                        <Input 
                          type="text"
                          placeholder="Enter batch code..."
                          value={values.batchNumber}
                          onChange={(e) => handleInputChange(item.id, "batchNumber", e.target.value)}
                          className="h-8 text-xs border-amber-300 focus-visible:ring-amber-500"
                        />
                      </TableCell>

                      <TableCell className="py-3 px-4 text-right text-slate-700 font-mono">
                        {formatCurrency(item.unitPrice ? Number(item.unitPrice) : 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

      {/* Action Footer Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-6 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Ensure batch numbers match the physical delivery packaging before confirming.
          </span>
          <Button 
            type="button"
            size="sm"
            onClick={handleReceiveOrder}
            disabled={isPending}
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
          >
            <Check className="h-4 w-4" />
            {isPending ? "Processing Receipt..." : "Complete & Receive Order"}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}