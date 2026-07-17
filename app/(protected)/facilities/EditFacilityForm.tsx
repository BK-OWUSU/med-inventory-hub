"use client"

import * as React from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, MapPin, Save, RefreshCw } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"

import {
  UpdateFacilitySchema,
  UpdateFacilityInput,
} from "@/types/schemas/facility.schema"
import { FacilityType } from "@/generated/prisma/browser"
import { updateFacilityAction } from "@/lib/actions/facilities.action"
import type { FacilityListResponse } from "@/types/types/facility.type"

interface EditFacilityFormProps {
  facility: FacilityListResponse["facilities"][number]
  onSuccess?: () => void
}

export default function EditFacilityForm({ facility, onSuccess }: EditFacilityFormProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateFacilityInput>({
    resolver: zodResolver(UpdateFacilitySchema),
    defaultValues: {
      id: facility.id,
      customId: facility.customId,
      name: facility.name ?? "",
      type: facility.type,
      location: facility.location ?? "",
      address: facility.address ?? "",
      phone: facility.phone ?? "",
      email: facility.email ?? "",
      licenseNumber: facility.licenseNumber ?? "",
      imageUrl: facility.imageUrl ?? "",
      isActive: facility.isActive,
      isVerified: facility.isVerified,
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form

  const watchedType = useWatch({ control, name: "type" })

  function onSubmit(data: UpdateFacilityInput) {
    startTransition(() => {
      toast.promise(
        async () => {
          const res = await updateFacilityAction(data.id, data)
          if (!res.success) throw new Error(res.error || "Failed to update facility")
          return res
        },
        {
          loading: "Updating facility...",
          success: () => {
            onSuccess?.()
            return "Facility updated successfully"
          },
          error: (err) => err.message,
        }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 pb-4 font-sans">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Edit Facility</h2>
        <p className="text-xs text-slate-500">Update the details for this healthcare facility.</p>
      </div>

      <Separator className="bg-slate-100" />

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
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Custom ID <span className="text-rose-500">*</span></Label>
              <Input {...register("customId")} className="h-9" />
              {errors.customId && (
                <p className="text-[11px] text-rose-500">{errors.customId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Facility Name <span className="text-rose-500">*</span></Label>
            <Input {...register("name")} className="h-9" />
            {errors.name && (
              <p className="text-[11px] text-rose-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">License Number <span className="text-rose-500">*</span></Label>
            <Input {...register("licenseNumber")} className="h-9" />
            {errors.licenseNumber && (
              <p className="text-[11px] text-rose-500">{errors.licenseNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/30 gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-700">Active</Label>
                    <p className="text-[11px] text-slate-400 font-normal">Toggle to mark this facility as active.</p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-800 data-[state=unchecked]:bg-slate-200"
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="isVerified"
              render={({ field }) => (
                <div className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/30 gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-700">Verified</Label>
                    <p className="text-[11px] text-slate-400 font-normal">Toggle to mark this facility as verified.</p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-800 data-[state=unchecked]:bg-slate-200"
                  />
                </div>
              )}
            />
          </div>

          {watchedType && (
            <p className="text-[11px] text-slate-400">Selected type: {watchedType}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-xs rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Contact & Location</h3>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Location</Label>
            <Input {...register("location")} className="h-9" />
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
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Image URL</Label>
            <Input {...register("imageUrl")} className="h-9" />
            {errors.imageUrl && (
              <p className="text-[11px] text-rose-500">{errors.imageUrl.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={onSuccess} type="button" variant="ghost" className="h-9 text-xs">Cancel</Button>
        <Button disabled={isPending} type="submit" className="h-9 bg-emerald-800 hover:bg-emerald-700 text-white text-xs">
          {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save Changes</>}
        </Button>
      </div>
    </form>
  )
}
