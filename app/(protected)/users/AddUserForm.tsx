"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User2, Mail, Shield, Phone, Save, Plus, RefreshCw } from "lucide-react"
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

import { CreateUserSchema, CreateUserInput, VISIBLE_ROLES } from "@/types/schemas/user.schema"
import { UserRole } from "@/generated/prisma/browser"
import { createUserAction } from "@/lib/actions/user.action"
import { useAuthStore } from "@/store/authStore"

interface AddUserFormProps {
  onSuccess?: () => void;
}

export default function AddUserForm({ onSuccess }: AddUserFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const {user} = useAuthStore();
  const currentUserFacilityId = user?.facility?.id || "";

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: UserRole.PHARMACIST,
      phone: "",
      facilityId: currentUserFacilityId,
      isActive: true,
      needsPasswordChange: true,
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form

  function onSubmit(data: CreateUserInput) {
    startTransition(() => {
      toast.promise(
        async () => {
          const res = await createUserAction(data);
          if (!res.success) throw new Error(res.error || "Failed to create user");
          return res;
        },
        {
          loading: "Creating user...",
          success: () => {
            onSuccess?.();
            return "User created successfully";
          },
          error: (err) => err.message
        }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 pb-4 font-sans">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">New User</h2>
        <p className="text-xs text-slate-500">Create a new user account in the system.</p>
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
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-xs rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
              <Shield className="h-4 w-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Settings</h3>
          </div>

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
                  <p className="text-[11px] text-slate-400 font-normal">Require user to change password on first login.</p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-emerald-800 data-[state=unchecked]:bg-slate-200"
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={onSuccess} type="button" variant="ghost" className="h-9 text-xs">Cancel</Button>
        <Button disabled={isPending} type="submit" className="h-9 bg-emerald-800 hover:bg-emerald-700 text-white text-xs">
          {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add User</>}
        </Button>
      </div>
    </form>
  )
}
