"use client"

import * as React from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Pill, 
  Plus, 
  Save, 
  Sparkles, 
  HelpCircle, 
  ArrowLeft,
  RefreshCw,
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
import { useDrugCategoryStore } from "@/store/drugCategory"
import { PERMISSIONS } from "@/lib/constants/permisions"
import { Badge } from "@/components/ui/badge"
import { Can } from "@/components/security/Can"


export default function AddNewDrugPage() {
  const {fetchDrugs} = useDrugStore();
  const {fetchCategories, categories} = useDrugCategoryStore()

  const router = useRouter();
  const drugListPath = "/drugs/drug-list";
  const handleCancel = () => {
    router.push(drugListPath)
  }
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(()=>{
    fetchCategories();
  },[fetchCategories])

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
    },
  })

  const { register, handleSubmit, control, formState: { errors }, reset } = form

  // Updated watched fields to include all inputs
  const watchedFields = useWatch({
    control,
    name: ["name", "genericName", "strength", "dosageForm", "unit", "isControlled", "description"],
  })

  const [watchName, watchGeneric, watchStrength, watchDosageForm, watchUnit, watchIsControlled, watchDescription] = watchedFields

  function onSubmit(data: DrugFormValues) {
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
              reset();
              return res.message || "Drug created successfully";
            },
            error: (err) => err.message || "Error creating drug"
          }
        );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-lg">
                  <Pill className="h-4 w-4" />
                </div>
                <h2 className="text-md font-bold text-slate-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                <div className="space-y-3 sm:col-span-1">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Drug Name <span className="text-rose-500">*</span></Label>
                  <Input id="name" placeholder="e.g. Paracetamol" {...register("name")} className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" />
                  {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="genericName" className="text-xs font-semibold text-slate-700">Generic Name</Label>
                  <Input id="genericName" placeholder="e.g. Acetaminophen" {...register("genericName")} className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-700">Category</Label>
                  <div className="flex gap-2 items-center">
                    <Controller control={control} name="categoryId" render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 text-sm bg-white border-slate-200"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {categories.map((cat, kx) => <SelectItem key={kx} value={cat.id} className="text-sm">{cat.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )} />
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 border-slate-200 shrink-0 text-slate-600 rounded-lg hover:bg-slate-50"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="strength" className="text-xs font-semibold text-slate-700">Strength</Label>
                  <Input id="strength" placeholder="e.g. 500" {...register("strength")} className="h-9 text-sm focus-visible:ring-emerald-600 focus-visible:border-emerald-600" />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-700">Unit <span className="text-rose-500">*</span></Label>
                  <Controller control={control} name="unit" render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-9 text-sm bg-white border-slate-200"><SelectValue placeholder="Select unit" /></SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {Object.values(Unit).map((unitVal) => <SelectItem key={unitVal} value={unitVal} className="text-sm">{unitVal.charAt(0) + unitVal.slice(1).toLowerCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-700">Dosage Form</Label>
                  <Controller control={control} name="dosageForm" render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-9 text-sm bg-white border-slate-200"><SelectValue placeholder="Select dosage form" /></SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {Object.values(DosageForm).map((formVal) => <SelectItem key={formVal} value={formVal} className="text-sm">{formVal.charAt(0) + formVal.slice(1).toLowerCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1.5"><Label className="text-xs font-semibold text-slate-700">Is Controlled Drug?</Label><HelpCircle className="h-3.5 w-3.5 text-slate-400" /></div>
                <Controller control={control} name="isControlled" render={({ field }) => (
                    <RadioGroup onValueChange={(val) => field.onChange(val === "yes")} value={field.value ? "yes" : "no"} className="flex gap-6 pt-1">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="controlled-yes" className="text-emerald-800" /><Label htmlFor="controlled-yes" className="text-sm cursor-pointer">Yes</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="controlled-no" className="text-emerald-800" /><Label htmlFor="controlled-no" className="text-sm cursor-pointer">No</Label></div>
                    </RadioGroup>
                  )} />
              </div>

              <div className="space-y-3 relative">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Enter description..." className="min-h-25 resize-none text-sm border-slate-200 focus-visible:ring-emerald-600 rounded-lg" maxLength={500} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Enhanced Live Preview */}
        <div className="space-y-4 flex flex-col h-full">
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden flex-1">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-4">
                <Sparkles className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold tracking-tight">Real-Time Summary</h3>
              </div>
              
              {/* Preview Content with spacing */}
              <div className="space-y-5">
                
                {/* Main Identity */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identity</p>
                  <p className="text-sm font-semibold text-slate-900">{watchName || "---"}</p>
                  <p className="text-xs text-slate-500 italic">{watchGeneric || "No generic name provided"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strength</p>
                    <p className="text-xs font-medium text-slate-700">{watchStrength || "---"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Form/Unit</p>
                    <p className="text-xs font-medium text-slate-700">{watchDosageForm || "---"} / {watchUnit || "---"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-flex ${watchIsControlled ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {watchIsControlled ? "Controlled Substance" : "Standard Drug"}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {watchDescription || "No description provided..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={handleCancel} type="button" variant="outline" className="flex-1 h-9 text-xs font-semibold border-slate-200 text-slate-700 rounded-lg bg-white px-5 hover:bg-slate-50">Cancel</Button>
            <Can
               permission={PERMISSIONS.DRUG_CREATE}
               fallback={<Badge>Read Only</Badge>}>
              <Button disabled={isPending} type="submit" className="flex-1 h-9 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg gap-1.5 px-5">
                  {isPending ? <RefreshCw className={`h-4 w-4 text-white ${isPending ? "animate-spin" : ""}`} />: <span className="flex gap-2"><Save className="h-4 w-4" /> Save Drug</span>}
              </Button>
          </Can>
          </div>
        </div>
      </div>
    </form>
  )
}