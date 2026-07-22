"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Import your specific schema and types
import { updateDrugInventoryBatchSchema, UpdateDrugInventoryBatchInput } from "@/types/schemas/inventory.schema";
// Assuming you create this action
import { updateDrugInventoryBatchAction } from "@/lib/actions/inventory.action";

interface EditInventoryFormProps {
  batchId: string;
  batchNumber: string; // Passed in for display purposes only
  initialData: UpdateDrugInventoryBatchInput;
  onSuccess?: () => void;
}

export function EditDrugBatchForm({ batchId, batchNumber, initialData, onSuccess }: EditInventoryFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<UpdateDrugInventoryBatchInput>({
    resolver: zodResolver(updateDrugInventoryBatchSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: UpdateDrugInventoryBatchInput) {
    startTransition(() => {
      toast.promise(
        async () => {
          // Pass the batchId to the action
          const res = await updateDrugInventoryBatchAction(batchId, data);
          if (!res.success) {
            throw new Error(res.error || "Failed to update inventory");
          }
          return res;
        },
        {
          loading: "Updating batch details...",
          success: (res) => {
            onSuccess?.();
            return res.message || "Batch updated successfully";
          },
          error: (err) => err.message || "Error updating batch",
        }
      );
    });
  }

  const isExpired = new Date(initialData.expiryDate).getTime() < new Date().getTime();

  return (
    <div className="w-full max-w-xl bg-white border border-slate-200 shadow-xs rounded-xl overflow-x-auto font-sans">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-lg">
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Edit Batch</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Modify details for batch: <span className="font-mono font-semibold">{batchNumber}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form id="edit-inventory-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            
            {/* Non-editable identifier */}
            <Field>
              <FieldLabel className="text-xs font-bold text-slate-500">Batch Number (System Locked)</FieldLabel>
              <Input value={batchNumber} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
            </Field>

            {/* Manufacturer & Unit Price */}
            <div className="grid grid-cols-2 gap-4">
              <Controller name="manufacturer" control={form.control} render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs font-bold text-slate-700">Manufacturer</FieldLabel>
                  <Input {...field} placeholder="e.g., PharmaCorp" />
                </Field>
              )} />
              <Controller name="unitPrice" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">Unit Price</FieldLabel>
                  <Input type="number" step="0.01" {...field} />
                </Field>
              )} />
            </div>

            {/* Min Stock Level & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <Controller name="minStockLevel" control={form.control} render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs font-bold text-slate-700">Min Stock Level</FieldLabel>
                  <Input type="number" {...field} disabled = {isExpired} />
                </Field>
              )} />
              <Controller name="expiryDate" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">Expiry Date</FieldLabel>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} 
                  />
                  {fieldState.error?.message && <FieldError errors={[{ message: fieldState.error.message }]} />}
                </Field>
              )} />
            </div>
               {isExpired && (
                  <p className="text-xs text-amber-600 font-medium">
                    ⚠️ This batch is expired. Some fields are locked to prevent dispensing errors.
                  </p>
                )}

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Label className="text-sm font-medium text-slate-700">Mark Batch Active</Label>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600" 
                  />
                )}
              />
            </div>

          </FieldGroup>
        </form>
      </CardContent>

      <div className="p-6 pt-0 border-t border-slate-100/80 mt-2">
        <Button
          type="submit"
          form="edit-inventory-form"
          disabled={isPending}
          className="w-full bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg h-10"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Update Batch
        </Button>
      </div>
    </div>
  );
}