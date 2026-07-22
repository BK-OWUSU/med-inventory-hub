"use client"

import * as React from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Pill, 
  FileText, 
  Plus, 
  Save, 
  Sparkles, 
  HelpCircle,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { updateDrugFormSchema, UpdateDrugFormValues } from "@/types/schemas/drug.schema"
import { DosageForm, Unit } from "@/generated/prisma/enums"
import { DrugWithCategory } from "@/types/types/drugs.types" 
import { toast } from "sonner"
import { updateDrugAction } from "@/lib/actions/drugs-actions"
import { useDrugStore } from "@/store/drugStore"
import { Switch } from "@/components/ui/switch"

// Define the exact narrow type representing only name and id
export type DrugCategoryDropdownOption = {
  id: string;
  name: string;
};

interface EditDrugFormProps {
  drug: DrugWithCategory;
  categories: DrugCategoryDropdownOption[]; // Narrowed down strictly to id and name
  onSuccess?: () => void;
}

export default function EditDrugForm({ drug, categories, onSuccess}: EditDrugFormProps) {
  const { fetchDrugs } = useDrugStore()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateDrugFormValues>({
    resolver: zodResolver(updateDrugFormSchema),
    defaultValues: {
      name: drug.name || "",
      genericName: drug.genericName || "",
      categoryId: drug.categoryId || "",
      strength: drug.strength || "",
      unit: drug.unit as Unit,
      dosageForm: (drug.dosageForm as DosageForm) || undefined,
      isControlled: drug.isControlled ?? false,
      description: drug.description || "",
      isActive: drug.isActive
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form

  const watchedFields = useWatch({
    control,
    name: ["name", "strength", "dosageForm", "unit", "description", ],
  })

  const [watchName, watchStrength, watchDosageForm, watchUnit, watchDescription] = watchedFields

  function onSubmit(data: UpdateDrugFormValues) {
    startTransition(() => {      
      toast.promise(
        async () => {
          const res = await updateDrugAction(drug.id, data);
          if (!res.success) {
            throw new Error(res.error || "Failed to update drug");
          }
          return res;
        }, 
        {
          loading: "Updating drug...",
          success: (res) => {
            fetchDrugs();
            onSuccess?.(); 
            return res.message || "Drug updated successfully";
          },
          error: (err) => err.message || "Error updating drug"
        }
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 pb-8 font-sans">
      
      {/* 1. Header Information */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded">
          Editing: {drug.customId || "Formulary Asset"}
        </span>
        <h2 className="text-lg font-bold text-slate-900 leading-tight">
          Modify Drug Specs
        </h2>
        <p className="text-xs text-slate-500">
          Updating specifications for {drug.name}. Any active inventory references will preserve this record configuration.
        </p>
      </div>

      <Separator className="bg-slate-100" />

      {/* 2. Basic Info Section Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-lg">
              <Pill className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Drug Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Drug Name <span className="text-rose-500">*</span>
              </Label>
              <Input 
                id="name"
                placeholder="e.g. Paracetamol" 
                {...register("name")} 
                className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" 
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Generic Name */}
            <div className="space-y-1.5">
              <Label htmlFor="genericName" className="text-xs font-semibold text-slate-700">Generic Name</Label>
              <Input 
                id="genericName"
                placeholder="e.g. Acetaminophen" 
                {...register("genericName")} 
                className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" 
              />
              {errors.genericName && <p className="text-xs text-rose-500 mt-1">{errors.genericName.message}</p>}
            </div>

            {/* Category Select Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Category</Label>
              <div className="flex gap-1.5 items-center">
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="h-9 text-sm bg-white border-slate-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-sm">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.categoryId && <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>}
            </div>

            {/* Strength & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="strength" className="text-xs font-semibold text-slate-700">Strength</Label>
                <Input 
                  id="strength"
                  placeholder="e.g. 500" 
                  {...register("strength")} 
                  className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" 
                />
                {errors.strength && <p className="text-xs text-rose-500 mt-1">{errors.strength.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Unit <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 text-sm bg-white border-slate-200">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {Object.values(Unit).map((unitVal) => (
                          <SelectItem key={unitVal} value={unitVal} className="text-sm">
                            {unitVal.charAt(0) + unitVal.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && <p className="text-xs text-rose-500 mt-1">{errors.unit.message}</p>}
              </div>
            </div>

            {/* Dosage Form */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Dosage Form</Label>
              <Controller
                control={control}
                name="dosageForm"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger className="h-9 text-sm bg-white border-slate-200">
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {Object.values(DosageForm).map((formVal) => (
                        <SelectItem key={formVal} value={formVal} className="text-sm">
                          {formVal.charAt(0) + formVal.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.dosageForm && <p className="text-xs text-rose-500 mt-1">{errors.dosageForm.message}</p>}
            </div>

            {/* Is Controlled */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-semibold text-slate-700">Is Controlled Drug?</Label>
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              </div>
              <Controller
                control={control}
                name="isControlled"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val === "yes")}
                    value={field.value ? "yes" : "no"}
                    className="flex gap-6 pt-0.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="yes" 
                        id="edit-controlled-yes" 
                        className="text-emerald-600 border-slate-300 focus-visible:ring-emerald-600 data-[state=checked]:border-emerald-600" 
                      />
                      <Label htmlFor="edit-controlled-yes" className="text-sm text-slate-700 font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="no" 
                        id="edit-controlled-no" 
                        className="text-emerald-600 border-slate-300 focus-visible:ring-emerald-600 data-[state=checked]:border-emerald-600" 
                      />
                      <Label htmlFor="edit-controlled-no" className="text-sm text-slate-700 font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 relative">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description</Label>
              <Textarea 
                id="description"
                placeholder="Enter drug indications or instructions..." 
                className="min-h-24 resize-none text-sm border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 rounded-lg pb-6"
                maxLength={500}
                {...register("description")}
              />
              <div className="absolute right-2.5 bottom-2 text-[10px] text-slate-400 font-mono">
                {(watchDescription || "").length} / 500
              </div>
              {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Extended Options Section Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Additional Specifications</h3>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-600">Active Status</span>
            <Controller
              control={control}
              name="isActive"
              render={({ field: switchField }) => (
                <Switch 
                  checked={switchField.value} 
                  onCheckedChange={switchField.onChange}
                  className="data-[state=checked]:bg-emerald-600" 
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Live Mini Preview */}
      <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Live Formulaic Output</span>
        </div>
        <p className="text-xs font-bold text-slate-800">
          {watchName || drug.name} {watchStrength || drug.strength} {watchDosageForm ? watchDosageForm.toLowerCase() : (drug.dosageForm?.toLowerCase() || "tablet")}
        </p>
        <p className="text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Packaging Format:</span> Box / {watchUnit ? watchUnit.toLowerCase() : (drug.unit?.toLowerCase() || "tablet")}
        </p>
      </div>

      {/* 5. Execution Drawer Footer */}
      <div className="flex items-center justify-between gap-2 pt-4 w-full">
        {onSuccess && (
          <Button 
            onClick={onSuccess} 
            type="button" 
            variant="outline" 
            className="h-9 px-7 text-xs font-semibold border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50"
          >
            Discard
          </Button>
        )}
        <Button 
          disabled={isPending} 
          type="submit" 
          className="h-9 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg gap-1.5"
        >
          {isPending ? (
            <RefreshCw className="h-4 w-4 text-emerald-200 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" /> 
              Save Changes
            </>
          )}
        </Button>
      </div>

    </form>
  )
}