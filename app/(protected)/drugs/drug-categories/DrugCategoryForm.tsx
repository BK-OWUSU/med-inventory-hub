"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { FolderPlus, Pencil, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DrugCategoryFormValues, drugCategorySchema } from "@/types/schemas/drug.schema"
import { Textarea } from "@/components/ui/textarea"
import { createDrugCategoryAction, updateDrugCategoryAction } from "@/lib/actions/drug-category-actions"

// 1. Extend props to accept optional initial data for edit operations
interface DrugCategoryFormProps {
  initialData?: DrugCategoryFormValues & { id?: string }
  onSuccess?: () => void
}

export default function DrugCategoryFormComponent({ initialData, onSuccess }: DrugCategoryFormProps) {
  const isEditMode = !!initialData?.id
  const [isPending, startTransition] = React.useTransition();

  // 2. Set up React Hook Form with proper fallbacks
  const form = useForm<DrugCategoryFormValues>({
    resolver: zodResolver(drugCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  })

  // 3. Reactively reset form state when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        isActive: true,
      })
    }
  }, [initialData, form])
async function onSubmit(data: DrugCategoryFormValues) {
  try {
    if (isEditMode) {
      console.log(`Updating existing category (${initialData?.id}):`, data)
      const payload = {
        ...data,
        isActive: !!data.isActive
      };
      
      startTransition(() => {      
        toast.promise(
          async () => {
            const res = await updateDrugCategoryAction(initialData?.id || "", payload);
            if (!res.success) {
              throw new Error(res.error || "Failed to update drug category");
            }
            return res;
          }, 
          {
            loading: "Updating drug category...",
            success: (res) => {
              onSuccess?.(); // Triggers parent updates safely on success
              return res.message || "Drug category updated successfully";
            },
            error: (err) => err.message || "Error updating drug category"
          }
        );
      });
    } else {
      console.log("Submitting new category to database:", data)
      
      startTransition(() => {      
        toast.promise(
          async () => {
            const res = await createDrugCategoryAction(data);
            if (!res.success) {
              throw new Error(res.error || "Failed to create drug category");
            }
            return res;
          }, 
          {
            loading: "Creating drug category...",
            success: (res) => {
              form.reset();   // Clears inputs only after DB successfully saves
              onSuccess?.();  // Refreshes data list or closes modal
              return res.message || "Drug category created successfully";
            },
            error: (err) => err.message || "Error creating drug category"
          }
        );
      });
    }
  } catch (error) {
    console.error(error)
    toast.error("An unexpected error occurred.")
  }
}


  return (
    <Card className="w-full max-w-xl bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden font-sans">
      <CardHeader className="space-y-1 bg-slate-50/50 border-b border-slate-100 p-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-lg">
            {isEditMode ? (
              <Pencil className="h-5 w-5" />
            ) : (
              <FolderPlus className="h-5 w-5" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal mt-0.5">
              {isEditMode 
                ? `Update properties for the "${initialData?.name}" classification group.`
                : "Create a database classification group for managing systemic drugs."
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form id="drug-category-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-6">
            
            {/* 1. Category Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-form-name" className="text-xs font-bold text-slate-700 tracking-wide">
                    Category Name <span className="text-rose-500">*</span>
                  </FieldLabel>
                  
                  <Input
                    {...field}
                    id="category-form-name"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., Antibiotics, Analgesics, Cardiovascular"
                    autoComplete="off"
                    className="h-10 text-sm font-normal text-slate-900 bg-white border-slate-200 rounded-lg focus-visible:ring-emerald-700/30 focus-visible:border-emerald-700 placeholder:text-slate-400"
                  />
                  
                  <FieldDescription className="text-[11px] text-slate-400 font-normal">
                    Enter a unique, descriptive group classification label.
                  </FieldDescription>
                  
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="text-xs font-semibold text-rose-600" />
                  )}
                </Field>
              )}
            />

            {/* 2. Category Description Field */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-form-description" className="text-xs font-bold text-slate-700 tracking-wide">
                    Description
                  </FieldLabel>
                  
                  <Textarea
                    {...field}
                    id="category-form-description"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    placeholder="Brief details about this category"
                    autoComplete="off"
                    className="h-20 text-sm font-normal text-slate-900 bg-white border-slate-200 rounded-lg focus-visible:ring-emerald-700/30 focus-visible:border-emerald-700 placeholder:text-slate-400 py-2.5 resize-none"
                  />
                  
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="text-xs font-semibold text-rose-600" />
                  )}
                </Field>
              )}
            />

            {/* 3. Is Active Toggle Field (Horizontal Layout) */}
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Field 
                  orientation="horizontal" 
                  className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/30 gap-4"
                >
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor="category-form-status" className="text-xs font-bold text-slate-700 tracking-wide">
                      Active Status
                    </FieldLabel>
                    <FieldDescription className="text-[11px] text-slate-400 font-normal">
                      Determine if this drug category should immediately display as live and selectable.
                    </FieldDescription>
                  </div>
                  
                  <Switch
                    id="category-form-status"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    className="data-[state=checked]:bg-emerald-800 data-[state=unchecked]:bg-slate-200"
                  />
                </Field>
              )}
            />

          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="p-6 pt-0 border-t border-slate-100/80 mt-2">
        <Field orientation="horizontal" className="w-full flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => form.reset()}
            className="h-9 text-xs font-semibold border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-50 px-4"
          >
            {isEditMode ? "Reset Changes" : "Clear Form"}
          </Button>
          <Button
            type="submit"
            form="drug-category-form"
            disabled={isPending}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg gap-1.5 px-4 shadow-xs disabled:opacity-70 min-w-27.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              isEditMode ? "Update Category" : "Save Category"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}