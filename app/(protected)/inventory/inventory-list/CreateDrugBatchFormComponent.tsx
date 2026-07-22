"use client";

import * as React from "react";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlusCircle, Loader2, Check, ChevronsUpDown } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { addDrugInventoryBatchSchema, AddDrugInventoryBatchInput } from "@/types/schemas/inventory.schema";
import { createDrugBatchAction } from "@/lib/actions/inventory.action";
import { DrugList} from "@/types/types/drugs.types";

interface CreateInventoryFormProps {
  drugId?: string;
  drugs?: DrugList[];

  onSuccess?: () => void;
}

export function CreateDrugBatchForm({ drugId, onSuccess, drugs = [] }: CreateInventoryFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  const form = useForm<AddDrugInventoryBatchInput>({
    resolver: zodResolver(addDrugInventoryBatchSchema),
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

  const { control } = form; 
// 2. Watch the specific field using the hook
const watchedDrugId = useWatch({
  control,
  name: "drugId",
});
// 3. Find the selected drug using the watched value
const selectedDrug = drugs.find((d) => d.id === watchedDrugId);

  async function onSubmit(data: AddDrugInventoryBatchInput) {
    startTransition(() => {      
        toast.promise(
          async () => {
            const res =  await createDrugBatchAction(data);
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

            {/* Drug Selection (Combobox) */}
            <Controller
              name="drugId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">Select Drug *</FieldLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between font-normal", !field.value && "text-slate-500")}
                      >
                        {field.value
                          ? selectedDrug?.name || "Select drug..."
                          : "Select drug..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-100 p-0">
                      <Command>
                        <CommandInput placeholder="Search drugs by name..." />
                        <CommandList>
                          <CommandEmpty>No drug found.</CommandEmpty>
                          <CommandGroup>
                            {drugs.map((drug) => (
                              <CommandItem
                                key={drug.id}
                                value={drug.name}
                                onSelect={() => {
                                  form.setValue("drugId", drug.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn("mr-2 h-4 w-4", field.value === drug.id ? "opacity-100" : "opacity-0")}
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{drug.name}</span>
                                  <span className="text-xs text-slate-500">{drug.dosageForm} • {drug.category?.name}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {fieldState.error?.message && (
                    <FieldError errors={[{ message: fieldState.error.message }]} />
                  )}
                </Field>
              )}
            />
            
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