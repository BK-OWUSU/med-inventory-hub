// app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { 
  Activity, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Layers, 
  Building2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LoginFormValues, loginSchema } from "@/types/schemas/auth.schema";
import { AppResponse, JwtPayload } from "@/types/types/app.type";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const login  = useAuthStore((state)=> state.login);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting},
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMeValue = watch("rememberMe");

const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      // 1. Send the data to the store (it handles catching the 403 and mapping success: true)
      const response = await login(data) as AppResponse;
      
      if (!response.success) {
        setServerError(response.message || "Invalid clinical operational credentials.");
        return;
      }

      // 2. Safely trigger the client-side router transition
      if (response.redirectTo) {
        console.log("Redirecting browser layout to:", response.redirectTo); // Should print "/change-password"
        router.push(response.redirectTo);
        return;
      }

    } catch (err) {
      console.error("Frontend Login Submission Catch Block Error:", err);
      setServerError("An unexpected error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-50 antialiased selection:bg-green-600 selection:text-white">
      
      {/* ================= LEFT COLUMN: BILLBOARD DISPLAY ================= */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative bg-green-950 items-center justify-center p-12 overflow-hidden border-r border-slate-200">
        {/* Background Radial Ambient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.15),transparent_60%)] pointer-events-none" />
        
        {/* Animated Main Image Frame Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-xl aspect-4/5 rounded-2xl overflow-hidden shadow-2xl border border-green-800/50 group"
        >
          <Image
            src="/img/pharmacy-1.webp"
            alt="Clinical pharmacy micro-fulfillment tracking ecosystem core node"
            fill
            priority
            className="object-cover object-center transform transition-transform duration-10000 group-hover:scale-105"
            sizes="(max-w-7xl) 40vw, 100vw"
          />
          {/* Subtle Dynamic Overlay Matrix */}
          <div className="absolute inset-0 bg-linear-to-t from-green-950/90 via-green-900/40 to-transparent" />
          
          {/* Static Branding overlay parameters inside the visual stage */}
          <div className="absolute bottom-0 inset-x-0 p-8 z-10 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-bold tracking-wide text-sm uppercase">
              <Activity className="h-5 w-5" />
              <span>PharmSync Global Node</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Ensuring medical resource mobility across networks.
            </h2>
            <p className="text-green-200/80 text-sm leading-relaxed max-w-md">
              Secure, role-verified system state tracking optimized for hospital hubs, distribution loops, and regional clinics.
            </p>
          </div>
        </motion.div>

        {/* Floating Telemetry Metric Module 1 */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-20 right-8 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 max-w-xs"
        >
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Identity Isolation</p>
            <p className="text-sm font-semibold text-slate-800">256-bit Encrypted Session</p>
          </div>
        </motion.div>

        {/* Floating Telemetry Metric Module 2 */}
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-24 left-8 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 max-w-xs"
        >
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Inter-facility Hubs</p>
            <p className="text-sm font-semibold text-slate-800">Active Node Reconciliation</p>
          </div>
        </motion.div>
      </div>

      {/* ================= RIGHT COLUMN: INTERACTIVE FORM CONTEXT ================= */}
      <div className="flex flex-col col-span-1 lg:col-span-7 xl:col-span-6 justify-center items-center px-4 sm:px-8 lg:px-16 py-12 relative">
        
        {/* Soft Background Accent for Mobile Layout Context */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-110 space-y-6"
        >
          {/* Enterprise Anchor Identity Banner */}
          <div className="flex items-center justify-between lg:justify-start gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2 text-green-800 font-bold text-xl tracking-tight focus-visible:outline-2 focus-visible:outline-green-600 rounded-md">
              <Activity className="h-6 w-6 text-green-600" aria-hidden="true" />
              <span>PharmSync</span>
            </Link>
            <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>V4 Secure</span>
            </div>
          </div>

          <Card className="border border-slate-200 bg-white shadow-xl shadow-slate-100/50 rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1.5 pt-8 px-6 sm:px-8">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm leading-relaxed">
                Sign in to manage pharmacy inventory and inter-facility orders.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-8 pb-6">
              {/* Submission Target Warning Alerts */}
              {serverError && (
                <Alert variant="destructive" className="mb-4 bg-red-50 text-red-900 border-red-200 rounded-xl">
                  <AlertDescription className="text-xs font-medium">{serverError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Email Identification Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    placeholder="name@facility.org"
                    aria-invalid={!!errors.email}
                    className={`h-11 rounded-xl border bg-slate-50/50 focus:bg-white transition-all duration-200 ${
                      errors.email ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-green-600/20 focus:border-green-600"
                    }`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-red-600 animate-slide-in" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-green-700 hover:text-green-800 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-green-600 rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      className={`h-11 pr-11 rounded-xl border bg-slate-50/50 focus:bg-white transition-all duration-200 ${
                        errors.password ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-green-600/20 focus:border-green-600"
                    }`}
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isSubmitting}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-slate-600 rounded-lg"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-red-600 role='alert'">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Session Checkbox Parameter */}
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="rememberMe"
                    disabled={isSubmitting}
                    checked={rememberMeValue}
                    onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
                    className="border-slate-300 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700 rounded"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-xs font-medium text-slate-600 select-none cursor-pointer"
                  >
                    Remember this terminal for 30 days
                  </Label>
                </div>

                {/* Primary Secure Gate Action Submission */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-linear-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 ease-in-out transform active:scale-[0.99] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying Token Assets...
                    </span>
                  ) : (
                    "Sign In to System"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="bg-slate-50/80 px-6 sm:px-8 py-4 border-t border-slate-100 flex justify-center">
              <p className="text-xs text-slate-500 text-center leading-normal">
                Don&apos;t have an account?{" "}
                <span className="font-semibold text-slate-700">Contact your network administrator.</span>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}