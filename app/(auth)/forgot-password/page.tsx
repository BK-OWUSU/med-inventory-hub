// app/(auth)/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  ArrowLeft, 
  Mail, 
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
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/types/schemas/auth.schema";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      // Simulate verification system delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      setServerError("System failed to process the request. Please check your network connection.");
    }
  };

  const handleResend = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Resending security token to:", submittedEmail);
    } catch (err) {
      console.error(err);
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
          className="relative w-full max-w-xl aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-green-800/50 group"
        >
          <Image
            src="/img/pharmacy-2.webp"
            alt="Secure authentication framework interface panel"
            fill
            priority
            className="object-cover object-center transform transition-transform duration-10000 group-hover:scale-105"
            sizes="(max-w-7xl) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-transparent" />
          
          <div className="absolute bottom-0 inset-x-0 p-8 z-10 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-bold tracking-wide text-sm uppercase">
              <Activity className="h-5 w-5" />
              <span>PharmSync Access Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Protecting health system infrastructure.
            </h2>
            <p className="text-green-200/80 text-sm leading-relaxed max-w-md">
              Recover operational credentials securely using encrypted token relays designed for verified staff accounts.
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
            <p className="text-xs text-slate-500 font-medium">Recovery Layer</p>
            <p className="text-sm font-semibold text-slate-800">Automated Audit Handshake</p>
          </div>
        </motion.div>
      </div>

      {/* ================= RIGHT COLUMN: INTERACTIVE FORM CONTEXT ================= */}
      <div className="flex flex-col col-span-1 lg:col-span-7 xl:col-span-6 justify-center items-center px-4 sm:px-8 lg:px-16 py-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="w-full max-w-[440px] space-y-6">
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
                // ================= OPTION A: INITIAL EMAIL REQUEST FORM =================
                <motion.div
                  key="forgot-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1.5 pt-8 px-6 sm:px-8">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <LockKeyhole className="h-5 w-5 text-green-700" />
                      Forgot Password?
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm leading-relaxed">
                      Enter your registered email address and we&apos;ll send you instructions to reset your password.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 pb-4">
                    {serverError && (
                      <Alert variant="destructive" className="mb-4 bg-red-50 text-red-900 border-red-200 rounded-xl">
                        <AlertDescription className="text-xs font-medium">{serverError}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            disabled={isSubmitting}
                            placeholder="name@facility.org"
                            aria-invalid={!!errors.email}
                            className={`h-11 pl-10 rounded-xl border bg-slate-50/50 focus:bg-white transition-all duration-200 ${
                              errors.email ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-green-600/20 focus:border-green-600"
                            }`}
                            {...register("email")}
                          />
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.email && (
                          <p className="text-xs font-medium text-red-600" role="alert">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 bg-linear-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 mt-2 transform active:scale-[0.99] disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2 justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Dispatching Security Link...
                          </span>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  </CardContent>

                  <CardFooter className="bg-slate-50/80 px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-500">
                      Remember your password?{" "}
                      <Link href="/login" className="font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors">
                        Sign In
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
                      Check Your Email
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-sm leading-relaxed px-2">
                      If an account exists for <span className="font-semibold text-slate-900 break-all">{submittedEmail}</span>, a password reset link has been sent. Please check your inbox and spam folder.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 pb-6 space-y-3">
                    <Button
                      variant="outline"
                      onClick={handleResend}
                      className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                    >
                      Resend Email
                    </Button>
                    
                    <Link href="/login" className="block w-full">
                      <Button variant="ghost" className="w-full h-11 text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                      </Button>
                    </Link>
                  </CardContent>
                  
                  <div className="bg-slate-50/80 py-4 border-t border-slate-100 text-xs text-slate-400">
                    {/* Token tracking id: sync-{Math.random().toString(36).substr(2, 9)} */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

    </div>
  );
}