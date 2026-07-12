// components/landing/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter()
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Text Deliverables column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-6">
              Next-Gen Healthcare Logistics
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl/none">
              Connecting Pharmacies. <br />
              <span className="text-green-700">Saving Lives.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Optimize medicine supply channels, manage real-time inventory assets securely, and enable frictionless inter-facility redistribution queries across your healthcare ecosystem.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button
               onClick={()=> router.push("/login")}  
               size="lg" className="bg-green-700 hover:bg-green-800 text-white gap-2 shadow-md">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-100">
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Graphical/Creative Layout context with overlaid components */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            <div className="relative w-full max-w-135 aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <Image
                src="/img/pharmacy-1.webp"
                alt="Modern pharmacy dynamic storage inventory dashboard environment overview"
                fill
                priority
                className="object-cover"
                sizes="(max-w-7xl) 50vw, 100vw"
              />
            </div>

            {/* Overlaid UI components context metrics */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 hidden sm:flex"
            >
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Stock Available</p>
                <p className="text-sm font-bold text-slate-800">99.4% Fulfillment</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 right-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 hidden sm:flex"
            >
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Requests</p>
                <p className="text-sm font-bold text-slate-800">12 Active Transfers</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute top-1/2 -right-6 bg-white p-3 rounded-xl shadow-md border border-slate-100 items-center gap-2 hidden lg:flex"
            >
              <Layers className="h-4 w-4 text-green-700" />
              <span className="text-xs font-semibold text-slate-700">42 Connected Facilities</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}