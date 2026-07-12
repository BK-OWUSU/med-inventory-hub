"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { FolderPlus, Loader2 } from "lucide-react"

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

interface AddDrugCategoryFormProps {
  onSuccess?: () => void
}

export default function AddDrugCategoryForm({ onSuccess }: AddDrugCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<DrugCategoryFormValues>({
    resolver: zodResolver(drugCategorySchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  })

  async function onSubmit(data: DrugCategoryFormValues) {
    setIsSubmitting(true)
    try {
      console.log("Submitting category to database:", data)
      
      // Simulate database operation delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Category saved successfully")
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-xl bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden font-sans">
      <CardHeader className="space-y-1 bg-slate-50/50 border-b border-slate-100 p-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-lg">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-slate-900">Add New Category</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal mt-0.5">
              Create a database classification group for managing systemic drugs.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form id="add-category-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                    disabled={isSubmitting}
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

            {/* 2. Is Active Toggle Field (Horizontal Layout) */}
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
                  
                  {/* Shadcn Switch integrated seamlessly through Controller */}
                  <Switch
                    id="category-form-status"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
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
            disabled={isSubmitting}
            onClick={() => form.reset()}
            className="h-9 text-xs font-semibold border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-50 px-4"
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            form="add-category-form"
            disabled={isSubmitting}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg gap-1.5 px-4 shadow-xs disabled:opacity-70 min-w-[110px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Category"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}