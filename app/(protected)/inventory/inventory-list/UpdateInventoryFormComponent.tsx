"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

import { updateStockSchema, UpdateStockInput } from "@/types/schemas/inventory.schema";
import { updateInventoryStockAction } from "@/lib/actions/inventory.action";
import { StockMovementType } from "@/generated/prisma/browser";


interface UpdateInventoryFormProps {
  inventoryId: string;
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

export function UpdateInventoryForm({ inventoryId, onSuccess }: UpdateInventoryFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<UpdateStockInput>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      inventoryId: inventoryId,
      type: StockMovementType.IN,
      quantity: 0,
      notes: "",
    },
  });

  async function onSubmit(data: UpdateStockInput) {
    startTransition(async () => {
      const res = await updateInventoryStockAction(data);
      if (!res.success) {
        toast.error(res.error || "Failed to update stock");
      } else {
        toast.success(res.message || "Stock updated successfully");
        onSuccess?.();
      }
    });
  }

  return (
    <Card className="w-full max-w-xl bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden font-sans">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 border border-blue-100/40 rounded-lg">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Update Stock</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Adjust current inventory levels.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form id="update-stock-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-200"
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

            {/* Quantity */}
            <Controller name="quantity" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs font-bold text-slate-700">Quantity *</FieldLabel>
                <Input type="number" {...field} placeholder="0" />
                {fieldState.error?.message && (
                  <FieldError errors={[{ message: fieldState.error.message }]} />
                )}
              </Field>
            )} />

            {/* Notes */}
            <Controller name="notes" control={form.control} render={({ field }) => (
              <Field>
                <FieldLabel className="text-xs font-bold text-slate-700">Notes</FieldLabel>
                <Textarea {...field} placeholder="Reason for adjustment..." />
              </Field>
            )} />
            
          </FieldGroup>
        </form>
      </CardContent>

      <div className="p-6 pt-0 border-t border-slate-100/80 mt-2">
        <Button
          type="submit"
          form="update-stock-form"
          disabled={isPending}
          className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Process Movement
        </Button>
      </div>
    </Card>
  );
}