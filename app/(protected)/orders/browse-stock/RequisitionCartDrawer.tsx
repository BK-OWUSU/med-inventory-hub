"use client";

import * as React from "react";
import { ShoppingCart, Trash2, Plus, Minus, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequisitionCartStore } from "@/store/requisition-cart.store";
import { toast } from "sonner";
import { createOrderAction } from "@/lib/actions/orders.actions";
import { OrderType } from "@/generated/prisma/browser";
import { CreateOrderInput } from "@/types/schemas/order.schema";

interface RequisitionCartContentProps {
  onClose?: () => void;
}

export function RequisitionCartContent({ onClose }: RequisitionCartContentProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems } = useRequisitionCartStore();
  const [isPending, startTransition] = React.useTransition();

  // Group items by facility automatically for multi-facility orders
  const groupedByFacility = React.useMemo(() => {
    const map: Record<string, typeof items> = {};
    items.forEach((item) => {
      if (!map[item.facilityName]) {
        map[item.facilityName] = [];
      }
      map[item.facilityName].push(item);
    });
    return map;
  }, [items]);

  const handleCheckout = () => {
    startTransition(() => {
      toast.promise(
        async () => {
          // Group items by supplier facility ID to create an order per facility
          const groupedMap = items.reduce<Record<string, Array<{ drugId: string; quantityRequested: number; unitPrice: number }>>>((acc, item) => {
            const supplierId = item.facilityId; 
            if (!acc[supplierId]) {
              acc[supplierId] = [];
            }
            acc[supplierId].push({
              drugId: item.drugId,
              quantityRequested: item.quantity,
              unitPrice: item.unitPriceNumber,
            });
            return acc;
          }, {});

          // Submit an individual order request for each supplier facility
          for (const [supplierId, orderItems] of Object.entries(groupedMap)) {
            const payload: CreateOrderInput = {
              supplierId,
              type: OrderType.REQUEST,
              items: orderItems,
            };

            const res = await createOrderAction(payload);
            if (!res.success) {
              throw new Error(res.error || "Failed to submit orders.");
            }
          }

          return { message: "Requisition orders submitted successfully across facilities!" };
        },
        {
          loading: "Submitting requisition orders...",
          success: (res) => {
            clearCart();
            onClose?.();
            return res.message;
          },
          error: (err: Error) => err.message || "Failed to submit orders. Please try again.",
        }
      );
    });
  };

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-140px)]">
      {/* Cart Items Body */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {items.length > 0 && (
          <div className="flex justify-end">
            <button 
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400 py-16">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">Browse available stock and add items to request.</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedByFacility).map(([facilityName, facilityItems]) => (
            <div key={facilityName} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/60 text-slate-800 text-xs font-bold">
                <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>Source Facility: {facilityName}</span>
              </div>

              <div className="space-y-3">
                {facilityItems.map((item) => (
                  <div key={item.inventoryId} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.drugName} ({item.strength})</div>
                        <div className="text-[10px] text-slate-400 font-mono">Batch: {item.batchNo}</div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.inventoryId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs font-semibold text-emerald-700">
                        {item.unitPriceDisplay} <span className="text-[10px] text-slate-400 font-normal">per {item.unit}</span>
                      </div>

                      <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button 
                          onClick={() => updateQuantity(item.inventoryId, item.quantity - 1)}
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-white text-slate-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-slate-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.inventoryId, item.quantity + 1)}
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-white text-slate-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Checkout Action */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3 mt-4">
          <div className="w-full flex items-center justify-between text-xs text-slate-600">
            <span>Total Unique Items: <strong className="text-slate-900">{items.length}</strong></span>
            <span>Total Units: <strong className="text-slate-900">{getTotalItems()}</strong></span>
          </div>

          <Button 
            onClick={handleCheckout} 
            disabled={isPending}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg h-10 text-xs font-bold shadow-sm"
          >
            {isPending ? "Submitting Orders..." : "Submit Requisition Orders"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
}