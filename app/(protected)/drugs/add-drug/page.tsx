"use client"

import * as React from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Pill, 
  FileText, 
  Plus, 
  Save, 
  Lightbulb, 
  Info, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  ArrowLeft,
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

import { drugFormSchema, DrugFormValues } from "@/types/schemas/drug.schema"
import { DosageForm, Unit } from "@/generated/prisma/enums"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createDrugAction } from "@/lib/actions/drugs-actions"
import { useDrugStore } from "@/store/drugStore"
import { DRUG_CATEGORIES } from "@/lib/constants/categories"


export default function AddNewDrugPage() {
  const {fetchDrugs} = useDrugStore();
  const router = useRouter();
  const drugListPath = "/drugs/drug-list";
  const handleCancel = () => {
    router.push(drugListPath)
  }

  const [isPending, startTransition] = React.useTransition();
  const MOCK_CATEGORIES = DRUG_CATEGORIES

  const form = useForm<DrugFormValues>({
    resolver: zodResolver(drugFormSchema),
    defaultValues: {
      name: "",
      genericName: "",
      categoryId: "",
      strength: "",
      unit: undefined,
      dosageForm: undefined,
      isControlled: false,
      description: "",
      minStockLevel: 20,
      manufacturer: "",
      notes: "",
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form

  // Safely watching field states using useWatch to render real-time preview data
  const watchedFields = useWatch({
    control,
    name: ["name", "strength", "dosageForm", "unit", "description", "notes"],
  })

  const [watchName, watchStrength, watchDosageForm, watchUnit, watchDescription, watchNotes] = watchedFields

  function onSubmit(data: DrugFormValues) {
    console.log("Verified structural drug asset payload:", data)
        startTransition(() => {      
        toast.promise(
          async () => {
            const res = await createDrugAction(data);
            if (!res.success) {
              throw new Error(res.error || "Failed to create drug");
            }
            return res;
          }, 
          {
            loading: "Creating drug...",
            success: (res) => {
              fetchDrugs();
              return res.message || "Drug created successfully";
            },
            error: (err) => err.message || "Error creating drug"
          }
        );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* Title View Layout Workspace Section */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Drug</h1>
            <p className="text-sm text-slate-500 font-normal">
              Add a new medicine to the central drug catalogue.
            </p>
          </div>
           <Button type="button"  onClick={handleCancel}
           className="h-9 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg gap-1.5 px-5"
           >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
        </div>
      </div>

      {/* Core Multi-Column Operational Viewport Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* Left Area Content Workspace Section (Inputs Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Card: Basic Identity Metrics */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-lg">
                  <Pill className="h-4 w-4" />
                </div>
                <h2 className="text-md font-bold text-slate-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Drug Name Input */}
                <div className="space-y-1.5 sm:col-span-1">
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

                {/* Generic Name Input */}
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

                {/* Category Select Controller */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Category</Label>
                  <div className="flex gap-1.5 items-center">
                    <Controller
                      control={control}
                      name="categoryId"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 text-sm bg-white border-slate-200">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {MOCK_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.key} value={cat.key} className="text-sm">{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 border-slate-200 shrink-0 text-slate-600 rounded-lg hover:bg-slate-50">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.categoryId && <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>}
                </div>

                {/* Strength Input */}
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

                {/* Unit Select Controller */}
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

                {/* Dosage Form Select Controller */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Dosage Form</Label>
                  <Controller
                    control={control}
                    name="dosageForm"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>

              {/* Controlled Narcotic Track Switch Radio System */}
              <div className="space-y-2">
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
                      className="flex gap-6 pt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="controlled-yes" className="text-emerald-800 border-slate-300 focus-visible:ring-emerald-600" />
                        <Label htmlFor="controlled-yes" className="text-sm text-slate-700 font-normal cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="controlled-no" className="text-emerald-800 border-slate-300 focus-visible:ring-emerald-600" />
                        <Label htmlFor="controlled-no" className="text-sm text-slate-700 font-normal cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Description Textarea Field */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Enter drug description, indications, usage or other relevant information..." 
                  className="min-h-25 resize-none text-sm border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 rounded-lg pb-6"
                  maxLength={500}
                  {...register("description")}
                />
                <div className="absolute right-2.5 bottom-2 text-[10px] text-slate-400 font-mono">
                  {(watchDescription || "").length} / 500
                </div>
                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Section Card: Extended Optional Operations Profiles */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-lg">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-md font-bold text-slate-900">Additional Information</h2>
                  <span className="text-xs font-normal text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">(Optional)</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Minimum Stock Level */}
                <div className="space-y-1.5">
                  <Label htmlFor="minStockLevel" className="text-xs font-semibold text-slate-700">Default Minimum Stock Level</Label>
                  <Input 
                    id="minStockLevel"
                    type="number" 
                    {...register("minStockLevel")} 
                    className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" 
                  />
                  <p className="text-[11px] text-slate-400 font-normal">Minimum quantity to trigger low stock alert</p>
                  {errors.minStockLevel && <p className="text-xs text-rose-500 mt-1">{errors.minStockLevel.message}</p>}
                </div>

                {/* Preferred Manufacturer */}
                <div className="space-y-1.5">
                  <Label htmlFor="manufacturer" className="text-xs font-semibold text-slate-700">Preferred Manufacturer</Label>
                  <Input 
                    id="manufacturer"
                    placeholder="e.g. Pfizer, GSK, Sanofi" 
                    {...register("manufacturer")} 
                    className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" 
                  />
                  {errors.manufacturer && <p className="text-xs text-rose-500 mt-1">{errors.manufacturer.message}</p>}
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Any additional notes..." 
                  className="min-h-20 resize-none text-sm border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 rounded-lg pb-6"
                  maxLength={300}
                  {...register("notes")}
                />
                <div className="absolute right-2.5 bottom-2 text-[10px] text-slate-400 font-mono">
                  {(watchNotes || "").length} / 300
                </div>
                {errors.notes && <p className="text-xs text-rose-500 mt-1">{errors.notes.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions Execution Bar Container */}
          <div className="flex items-center justify-between pt-2">
            <Button onClick={handleCancel} type="button" variant="outline" className="h-9 text-xs font-semibold border-slate-200 text-slate-700 rounded-lg bg-white px-5 hover:bg-slate-50">
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="h-9 text-xs font-semibold border-emerald-200 text-emerald-800 bg-emerald-50/40 rounded-lg px-5 hover:bg-emerald-50">
                Save & Add Another
              </Button>
              <Button disabled = {isPending} type="submit" className="h-9 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg gap-1.5 px-5">
                 {isPending ? <RefreshCw className={`h-4 w-4 text-slate-600 ${isPending ? "animate-spin" : ""}`} />: <span><Save className="h-4 w-4" /> Save Drug</span>}
              </Button>
            </div>
          </div>

        </div>

        {/* Right Contextual Guide Sidebar Panel Column */}
        <div className="space-y-4">
          
          {/* Guide Card Box */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-2.5">
                <Lightbulb className="h-4 w-4 stroke-[2.5]" />
                <h3 className="text-sm font-bold tracking-tight">Drug Information Guide</h3>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex gap-2.5 items-start">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-0.5">Drug Name</p>
                    <p className="text-slate-500 leading-normal">Enter the brand or trade name of the medicine as it appears on the packaging.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-0.5">Generic Name</p>
                    <p className="text-slate-500 leading-normal">Enter the chemical or non-proprietary name of the medicine.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-0.5">Strength</p>
                    <p className="text-slate-500 leading-normal">Specify the strength of the drug (e.g., 500mg, 5ml, 10IU).</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-0.5">Dosage Form</p>
                    <p className="text-slate-500 leading-normal">Select the physical form in which the drug is available.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-0.5">Controlled Drug</p>
                    <p className="text-slate-500 leading-normal">Enable this if the drug is regulated and requires a special license.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Contextual Dynamic Examples Box */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2.5">
                <Sparkles className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold tracking-tight">Form Input Live Preview</h3>
              </div>
              
              <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Database Preview Token</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {watchName || "Paracetamol"} {watchStrength || "500mg"} {watchDosageForm ? watchDosageForm.toLowerCase() : "Tablet"}
                </p>
                <p className="text-[11px] text-slate-500 font-normal">
                  <span className="font-semibold text-slate-700">Packaging Format:</span> Box / {watchUnit ? watchUnit.toLowerCase() : "tablet"}
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <p className="font-semibold text-slate-700">System Formulaic Mock Examples:</p>
                <div className="text-[11px] space-y-1.5 text-slate-500 bg-slate-50/40 p-2.5 rounded-lg border border-slate-100/60">
                  <p><span className="font-medium text-slate-800">Paracetamol 500mg Tablet:</span> Strength: 500mg | Form: Tablet | Unit: Box</p>
                  <p><span className="font-medium text-slate-800">Amoxicillin 250mg Capsule:</span> Strength: 250mg | Form: Capsule | Unit: Box</p>
                  <p><span className="font-medium text-slate-800">Salbutamol Syrup 2mg/5ml:</span> Strength: 2mg/5ml | Form: Syrup | Unit: Bottle</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Callout Component */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-800">
                <MessageSquare className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold tracking-tight">Need Help?</h3>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                If you have any questions, please contact your system administrator.
              </p>
              <Button type="button" variant="outline" className="w-full h-8 text-xs font-semibold border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 gap-1.5">
                Contact Support
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </form>
  )
}