"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrderWithRelations } from "@/types/types/orders.type";
import { UpdateOrderInput, updateOrderSchema } from "@/types/schemas/order.schema";
import { toast } from "sonner";
import { updateOrderAction } from "@/lib/actions/orders.actions";

interface UpdateOrderFormProps {
  order: OrderWithRelations;
  onSuccess?: () => void;
}

export default function UpdateOrderForm({ 
  order, 
  onSuccess, 
}: UpdateOrderFormProps) {
   const [isPending, startTransition] = React.useTransition();

  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<UpdateOrderInput>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      notes: order.notes ?? "",
      items: order.items.map((item) => ({
        drugId: item.drugId,
        drugName: item.drugName,
        quantityRequested: item.quantityRequested,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: UpdateOrderInput): Promise<void> => {

     startTransition(async () => {
          const res = await updateOrderAction(order.id, data);
          if (!res.success) {
            toast.error(res.error || "Failed to update Order");
          } else {
            toast.success(res.message || "Order updated successfully");
            onSuccess?.();
          }
        });
  };

  return (
    <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Header Info */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Update Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify items and notes for order <span className="font-semibold text-slate-700">{order.customId || order.id}</span>
            </p>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Order Items
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ drugId: "", quantityRequested: 1, unitPrice: undefined })}
                className="h-8 text-xs gap-1 border-slate-200 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-[10px] text-rose-500">{errors.items.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 relative group"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    {/* Drug Name */}
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-[10px] font-medium text-slate-600">Drug Name</Label>
                      <Input
                        readOnly
                        disabled
                        placeholder="Enter drug ID..."
                        className="text-xs bg-white"
                        {...register(`items.${index}.drugName` as const, { required: true })}
                      />
                      {errors.items?.[index]?.drugId && (
                        <p className="text-[10px] text-rose-500">{errors.items[index]?.drugName?.message}</p>
                      )}
                    </div>

                    {/* Quantity Requested */}
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[10px] font-medium text-slate-600">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        className="text-xs bg-white"
                        {...register(`items.${index}.quantityRequested` as const, { valueAsNumber: true })}
                      />
                      {errors.items?.[index]?.quantityRequested && (
                        <p className="text-[10px] text-rose-500">{errors.items[index]?.quantityRequested?.message}</p>
                      )}
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[10px] font-medium text-slate-600">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        readOnly
                        disabled
                        placeholder="0.00"
                        className="text-xs bg-white"
                        {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                      />
                      {errors.items?.[index]?.unitPrice && (
                        <p className="text-[10px] text-rose-500">{errors.items[index]?.unitPrice?.message}</p>
                      )}
                    </div>

                    {/* Delete Item Button */}
                    <div className="sm:col-span-1 flex justify-end sm:justify-center pb-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-slate-700">
              Notes / Remarks
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add any additional remarks about this order update..."
              className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-xs shadow-xs transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-[10px] text-rose-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="text-xs bg-green-800 hover:bg-green-700 text-white gap-1.5"
            >
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}