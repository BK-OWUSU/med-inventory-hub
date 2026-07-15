// app/(auth)/change-password/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  KeyRound, 
  Loader2, 
  CircleCheckBig, 
  ShieldCheck, 
  LockKeyhole 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordSchema, resetPasswordSchema } from "@/types/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";
import { AppResponse } from "@/types/types/app.type";

export default function ChangePasswordPage() {
  const { changePassword, loading } = useAuthStore();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
  setServerError(null);
  try {
    // 2. Dispatch the payload through your store's resetPassword action
    const response = await changePassword(data) as AppResponse;
    
    if (response.success) {
      setIsSuccess(true);
      
      // 3. Gracefully redirect the user to their landing dashboard after the success animation
      const destination = response.redirectTo || "/dashboard";
      setTimeout(() => {
        router.push(destination);
      }, 2500);
    } else {
      setServerError(response.message || "Failed to update security credentials.");
    }
  } catch (err: unknown) {
    console.error("Frontend Password Reset Catch Block Error:", err);
    setServerError("An unexpected operational error occurred during submission.");
  }
};

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-50 antialiased selection:bg-green-600 selection:text-white">
      
      {/* ================= LEFT COLUMN: BILLBOARD DISPLAY ================= */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative bg-green-950 items-center justify-center p-12 overflow-hidden border-r border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.15),transparent_60%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-xl aspect-4/5 rounded-2xl overflow-hidden shadow-2xl border border-green-800/50 group"
        >
          <Image
            src="/img/pharmacy-2.webp"
            alt="Secure authentication framework interface panel"
            fill
            priority
            className="object-cover object-center transform transition-transform duration-10000 group-hover:scale-105"
            sizes="(max-w-7xl) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-green-950/90 via-green-900/40 to-transparent" />
          
          <div className="absolute bottom-0 inset-x-0 p-8 z-10 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-bold tracking-wide text-sm uppercase">
              <Activity className="h-5 w-5" />
              <span>PharmSync Access Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Protecting health system infrastructure.
            </h2>
            <p className="text-green-200/80 text-sm leading-relaxed max-w-md">
              Establish your personal security keys to finalize authorization and enter the operations environment.
            </p>
          </div>
        </motion.div>

        {/* Floating Telemetry Metric Module */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-20 right-8 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 max-w-xs"
        >
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Security Guard</p>
            <p className="text-sm font-semibold text-slate-800">Mandatory Key Handshake</p>
          </div>
        </motion.div>
      </div>

      {/* ================= RIGHT COLUMN: INTERACTIVE FORM CONTEXT ================= */}
      <div className="flex flex-col col-span-1 lg:col-span-7 xl:col-span-6 justify-center items-center px-4 sm:px-8 lg:px-16 py-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="w-full max-w-110 space-y-6">
          {/* Logo Heading Header */}
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="flex items-center gap-2 text-green-800 font-bold text-xl tracking-tight focus-visible:outline-2 focus-visible:outline-green-600 rounded-md">
              <Activity className="h-6 w-6 text-green-600" aria-hidden="true" />
              <span>PharmSync</span>
            </Link>
          </div>

          <Card className="border border-slate-200 bg-white shadow-xl shadow-slate-100/50 rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {!isSuccess ? (
                // ================= OPTION A: PASSWORD RESET FORM =================
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1.5 pt-8 px-6 sm:px-8">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <LockKeyhole className="h-5 w-5 text-green-700" />
                      Set New Password
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm leading-relaxed">
                      First-time login setup. Choose a secure, unique password to safeguard your health operational workspace.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 pb-4">
                    {serverError && (
                      <Alert variant="destructive" className="mb-4 bg-red-50 text-red-900 border-red-200 rounded-xl">
                        <AlertDescription className="text-xs font-medium">{serverError}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      {/* New Password Input Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type="password"
                            disabled={isSubmitting}
                            placeholder="••••••••"
                            aria-invalid={!!errors.newPassword}
                            className={`h-11 pl-10 rounded-xl border bg-slate-50/50 focus:bg-white transition-all duration-200 ${
                              errors.newPassword ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-green-600/20 focus:border-green-600"
                            }`}
                            {...register("newPassword")}
                          />
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.newPassword && (
                          <p className="text-xs font-medium text-red-600" role="alert">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password Input Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type="password"
                            disabled={isSubmitting}
                            placeholder="••••••••"
                            aria-invalid={!!errors.confirmPassword}
                            className={`h-11 pl-10 rounded-xl border bg-slate-50/50 focus:bg-white transition-all duration-200 ${
                              errors.confirmPassword ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-green-600/20 focus:border-green-600"
                            }`}
                            {...register("confirmPassword")}
                          />
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs font-medium text-red-600" role="alert">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-linear-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 mt-2 transform active:scale-[0.99] disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating Operational Key...
                        </span>
                      ) : (
                        "Save Password & Log In"
                      )}
                    </Button>
                    </form>
                  </CardContent>

                  <CardFooter className="bg-slate-50/80 px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-500">
                      Need assistance?{" "}
                      <Link href="/login" className="font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors">
                        Return to Login
                      </Link>
                    </p>
                  </CardFooter>
                </motion.div>
              ) : (
                // ================= OPTION B: SUCCESS STATE DISPLAY =================
                <motion.div
                  key="success-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <CardHeader className="pt-10 pb-4 px-6 sm:px-8 flex flex-col items-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shadow-sm animate-scale-in">
                      <CircleCheckBig className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                      Password Set Successfully!
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-sm leading-relaxed px-2">
                      Your identity credentials have been updated. Preparing workspace structures and routing session to core dashboard systems...
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 pb-8 flex justify-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Starting secure terminal interface session...
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

    </div>
  );
}