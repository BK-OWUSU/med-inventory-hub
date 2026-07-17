"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

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

import { addInventorySchema, AddInventoryInput } from "@/types/schemas/inventory.schema";
import { createInventoryAction } from "@/lib/actions/inventory.action";

interface CreateInventoryFormProps {
  drugId?: string;
  onSuccess?: () => void;
}

export function CreateInventoryForm({ drugId, onSuccess }: CreateInventoryFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<AddInventoryInput>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      drugId: drugId || "",
      batchNumber: "",
      availableQuantity: 0,
      minStockLevel: 20,
      expiryDate: new Date(),
      receivedDate: new Date(),
      manufacturer: "",
      unitPrice: 0,
    },
  });

  async function onSubmit(data: AddInventoryInput) {
    console.log(data)
    startTransition(() => {      
        toast.promise(
          async () => {
            const res =  await createInventoryAction(data);
            if (!res.success) {
              throw new Error(res.error || "Failed to create inventory");
            }
            return res;
          }, 
          {
            loading: "Creating inventory...",
            success: (res) => {
              onSuccess?.();
              return res.message || "Inventory created successfully";
            },
            error: (err) => err.message || "Error to creating inventory"
          }
        );
    });
  }

  return (
    <Card className="w-full max-w-xl bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden font-sans">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-lg">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Add New Batch</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Register a new inventory batch for this drug.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form id="create-inventory-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            
            {/* Batch & Manufacturer */}
            <div className="grid grid-cols-2 gap-4">
              <Controller name="batchNumber" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">Batch Number *</FieldLabel>
                  <Input {...field} placeholder="e.g., BN-2026-001" />
                  {/* FIX: Mapped to { message: string } object */}
                  {fieldState.error?.message && (
                    <FieldError errors={[{ message: fieldState.error.message }]} />
                  )}
                </Field>
              )} />
              <Controller name="manufacturer" control={form.control} render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs font-bold text-slate-700">Manufacturer</FieldLabel>
                  <Input {...field} placeholder="e.g., PharmaCorp" />
                </Field>
              )} />
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-2 gap-4">
              <Controller name="availableQuantity" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">Initial Qty *</FieldLabel>
                  <Input type="number" {...field} />
                  {/* FIX: Mapped to { message: string } object */}
                  {fieldState.error?.message && (
                    <FieldError errors={[{ message: fieldState.error.message }]} />
                  )}
                </Field>
              )} />
              <Controller name="minStockLevel" control={form.control} render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs font-bold text-slate-700">Min Stock Level</FieldLabel>
                  <Input type="number" {...field} />
                </Field>
              )} />
            </div>

            {/* Dates & Price */}
            <div className="grid grid-cols-2 gap-4">
              <Controller name="expiryDate" control={form.control} render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs font-bold text-slate-700">Expiry Date</FieldLabel>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} 
                  />
                </Field>
              )} />
              <Controller name="unitPrice" control={form.control} render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs font-bold text-slate-700">Unit Price</FieldLabel>
                  <Input type="number" step="0.01" {...field} />
                </Field>
              )} />
            </div>

          </FieldGroup>
        </form>
      </CardContent>

      <div className="p-6 pt-0 border-t border-slate-100/80 mt-2">
        <Button
          type="submit"
          form="create-inventory-form"
          disabled={isPending}
          className="w-full bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg h-10"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Batch
        </Button>
      </div>
    </Card>
  );
}