"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { stockAdjustmentSchema, StockAdjustmentInput } from "@/types/schemas/inventory.schema";
import { createInventoryAdjustment } from "@/lib/actions/inventory.action";
import { StockMovementType, MovementReason } from "@/generated/prisma/browser";
import { StockAdjustmentRow } from "@/types/types/inventory.type";

interface StockAdjustmentUpdateFormProps {
  initialData: StockAdjustmentRow;
  inventoryId?: string; // Fallback since StockAdjustmentRow excludes inventoryId
  onSuccess?: () => void;
}

const MOVEMENT_TYPES = [
  { label: "IN", value: StockMovementType.IN },
  { label: "OUT", value: StockMovementType.OUT },
  { label: "ADJUSTMENT", value: StockMovementType.ADJUSTMENT },
  { label: "EXPIRY", value: StockMovementType.EXPIRY },
  { label: "RETURN", value: StockMovementType.RETURN },
  { label: "TRANSFER", value: StockMovementType.TRANSFER },
];

const REASON_OPTIONS = [
  { label: "Damaged", value: MovementReason.DAMAGED },
  { label: "Expired", value: MovementReason.EXPIRED },
  { label: "Theft / Loss", value: MovementReason.THEFT },
  { label: "Audit Reconciliation", value: MovementReason.AUDIT_RECONCILIATION },
  { label: "Dispensed", value: MovementReason.DISPENSED },
];

export function StockAdjustmentUpdateForm({ initialData, inventoryId, onSuccess }: StockAdjustmentUpdateFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      inventoryId: inventoryId ?? "",
      type: StockMovementType.ADJUSTMENT,
      newQuantity: initialData.newQuantity ?? 0,
      quantityChange: undefined,
      reason: (initialData.reason as MovementReason) ?? undefined,
      referenceNo: initialData.reference ?? "",
      notes: "",
    },
  });

  async function onSubmit(data: StockAdjustmentInput) {
    startTransition(async () => {
      const res = await createInventoryAdjustment(data);
      if (!res.success) {
        toast.error(res.error || "Failed to update adjustment");
      } else {
        toast.success(res.message || "Adjustment updated successfully");
        onSuccess?.();
      }
    });
  }

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-12rem)] pr-1 space-y-4">
        <form id="update-adjustment-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            
            {/* Movement Type Selection */}
            <Controller name="type" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs font-bold text-slate-700">Movement Type *</FieldLabel>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {MOVEMENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => field.onChange(type.value)}
                      className={`px-2 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        field.value === type.value 
                          ? "bg-green-800 text-white border-green-700 shadow-sm" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-green-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {fieldState.error?.message && (
                  <FieldError errors={[{ message: fieldState.error.message }]} />
                )}
              </Field>
            )} />

            {/* New Quantity Input */}
            <Controller name="newQuantity" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs font-bold text-slate-700">New Physical Count *</FieldLabel>
                <Input type="number" {...field} placeholder="0" />
                {fieldState.error?.message && (
                  <FieldError errors={[{ message: fieldState.error.message }]} />
                )}
              </Field>
            )} />

            {/* Movement Reason Selection */}
            <Controller name="reason" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs font-bold text-slate-700">Reason Category</FieldLabel>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {REASON_OPTIONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => field.onChange(reason.value)}
                      className={`px-3 py-2 text-[11px] font-medium rounded-lg border text-left transition-all ${
                        field.value === reason.value 
                          ? "bg-green-800 text-white border-green-700 shadow-sm" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
                {fieldState.error?.message && (
                  <FieldError errors={[{ message: fieldState.error.message }]} />
                )}
              </Field>
            )} />

            {/* Reference Number */}
            <Controller name="referenceNo" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs font-bold text-slate-700">Reference No / Batch Info</FieldLabel>
                <Input {...field} placeholder="e.g. REF-2026-001 or Batch Number" />
                {fieldState.error?.message && (
                  <FieldError errors={[{ message: fieldState.error.message }]} />
                )}
              </Field>
            )} />

            {/* Notes / Comments */}
            <Controller name="notes" control={form.control} render={({ field }) => (
              <Field>
                <FieldLabel className="text-xs font-bold text-slate-700">Additional Notes</FieldLabel>
                <Textarea {...field} placeholder="Optional detailed comments..." />
              </Field>
            )} />
            
          </FieldGroup>
        </form>
      </div>

      {/* Footer Button Container */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <Button
          type="submit"
          form="update-adjustment-form"
          disabled={isPending}
          className="w-full bg-green-800 hover:bg-green-700 text-white rounded-lg h-10"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Update Adjustment
        </Button>
      </div>
    </div>
  );
}