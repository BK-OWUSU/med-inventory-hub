"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, MapPin, Plus, RefreshCw, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"

import { CreateFacilitySchema, CreateFacilityInput } from "@/types/schemas/facility.schema"
import { FacilityType, UserRole } from "@/generated/prisma/browser"
import { createFacilityAction } from "@/lib/actions/facilities.action"

interface AddFacilityFormProps {
  onSuccess?: () => void;
}

export default function AddFacilityForm({ onSuccess }: AddFacilityFormProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateFacilityInput>({
    resolver: zodResolver(CreateFacilitySchema),
    defaultValues: {
      name: "",
      type: FacilityType.CLINIC,
      location: "",
      address: "",
      phone: "",
      email: "",
      licenseNumber: "",
      isActive: true,
      isVerified: false,
      adminEmail: "",
      fullName: "",
      role: UserRole.ADMIN,
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form

  function onSubmit(data: CreateFacilityInput) {
    startTransition(() => {
      toast.promise(
        async () => {
          const res = await createFacilityAction(data);
          if (!res.success) throw new Error(res.error || "Failed to create facility");
          return res;
        },
        {
          loading: "Creating facility and assigning admin...",
          success: () => {
            onSuccess?.();
            return "Facility created successfully";
          },
          error: (err) => err.message
        }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 pb-4 font-sans">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">New Facility</h2>
        <p className="text-xs text-slate-500">Register a new healthcare facility in the system.</p>
      </div>

      <Separator className="bg-slate-100" />

      {/* Facility Details */}
      <Card className="border-slate-200/80 shadow-xs rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
             <Building2 className="h-4 w-4 text-emerald-700" />
             <h3 className="text-sm font-bold text-slate-900">Facility Details</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Type <span className="text-rose-500">*</span></Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(FacilityType).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-xs text-rose-500">{errors.type.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">License Number <span className="text-rose-500">*</span></Label>
              <Input {...register("licenseNumber")} className="h-9" />
              {errors.licenseNumber && <p className="text-xs text-rose-500">{errors.licenseNumber.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Facility Name <span className="text-rose-500">*</span></Label>
            <Input {...register("name")} className="h-9" />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card className="border-slate-200/80 shadow-xs rounded-xl">
         <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <MapPin className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Contact & Location</h3>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Location</Label>
              <Input {...register("location")} className="h-9" />
              {errors.location && <p className="text-xs text-rose-500">{errors.location.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address</Label>
              <Textarea {...register("address")} className="min-h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone</Label>
                  <Input {...register("phone")} className="h-9" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input {...register("email")} className="h-9" />
                  {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
               </div>
            </div>
         </CardContent>
      </Card>

      {/* Initial Administrator */}
      <Card className="border-slate-200/80 shadow-xs rounded-xl">
         <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <UserCog className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Initial Administrator</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name <span className="text-rose-500">*</span></Label>
                  <Input {...register("fullName")} className="h-9" />
                  {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Role</Label>
                  <Input {...register("role")} disabled className="h-9 bg-slate-50 cursor-not-allowed" />
              </div>
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address <span className="text-rose-500">*</span></Label>
                <Input {...register("adminEmail")} className="h-9" />
                {errors.adminEmail && <p className="text-xs text-rose-500">{errors.adminEmail.message}</p>}
            </div>
         </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={onSuccess} type="button" variant="ghost" className="h-9 text-xs">Cancel</Button>
        <Button disabled={isPending} type="submit" className="h-9 bg-emerald-800 hover:bg-emerald-700 text-white text-xs">
          {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add Facility</>}
        </Button>
      </div>
    </form>
  )
}