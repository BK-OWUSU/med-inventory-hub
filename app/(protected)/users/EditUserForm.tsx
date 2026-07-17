"use client"

import * as React from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User2, Mail, Shield, Phone, Save, RefreshCw } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"

import {
  UpdateUserSchema,
  UpdateUserInput,
} from "@/types/schemas/user.schema"
import { UserRole } from "@/generated/prisma/browser"
import { updateUserAction } from "@/lib/actions/user.action"
import type { UserListResponse } from "@/types/types/user.types"

const VISIBLE_ROLES = [UserRole.ADMIN, UserRole.PHARMACIST, UserRole.STAFF, UserRole.VIEWER] as const;

interface EditUserFormProps {
  user: UserListResponse["users"][number]
  onSuccess?: () => void
}

export default function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      id: user.id,
      customId: user.customId,
      fullName: user.fullName ?? "",
      role: user.role,
      email: user.email ?? "",
      phone: user.phone ?? "",
      facilityId: user.facility?.id ?? "",
      isActive: user.isActive,
      needsPasswordChange: user.needsPasswordChange,
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form

  const watchedRole = useWatch({ control, name: "role" })

  function onSubmit(data: UpdateUserInput) {
    startTransition(() => {
      toast.promise(
        async () => {
          const res = await updateUserAction(data.id, data)
          if (!res.success) throw new Error(res.error || "Failed to update user")
          return res
        },
        {
          loading: "Updating user...",
          success: () => {
            onSuccess?.()
            return "User updated successfully"
          },
          error: (err) => err.message,
        }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 pb-4 font-sans">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
        <p className="text-xs text-slate-500">Update the details for this user account.</p>
      </div>

      <Separator className="bg-slate-100" />

      <Card className="border-slate-200/80 shadow-xs rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
             <User2 className="h-4 w-4 text-emerald-700" />
             <h3 className="text-sm font-bold text-slate-900">User Details</h3>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Full Name <span className="text-rose-500">*</span></Label>
            <Input {...register("fullName")} className="h-9" />
            {errors.fullName && (
              <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Email <span className="text-rose-500">*</span></Label>
            <Input {...register("email")} type="email" className="h-9" />
            {errors.email && (
              <p className="text-[11px] text-rose-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role <span className="text-rose-500">*</span></Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {VISIBLE_ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone</Label>
              <Input {...register("phone")} className="h-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Custom ID</Label>
            <Input {...register("customId")} className="h-9" disabled />
            {errors.customId && (
              <p className="text-[11px] text-rose-500">{errors.customId.message}</p>
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
                    <p className="text-[11px] text-slate-400 font-normal">Toggle to mark this user as active.</p>
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
              name="needsPasswordChange"
              render={({ field }) => (
                <div className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/30 gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-700">Force Password Change</Label>
                    <p className="text-[11px] text-slate-400 font-normal">Require password change on next login.</p>
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

          {watchedRole && (
            <p className="text-[11px] text-slate-400">Selected role: {watchedRole.replace("_", " ")}</p>
          )}
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
