// components/landing/DashboardPreview.tsx
"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function DashboardPreview() {
  return (
    <section className="py-20 bg-white border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A Clean Workspace for High-Velocity Logistics
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            The unified tracking layout simplifies supply transfers, updates medical ledger states, and issues notifications without administrative overhead.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto max-w-5xl rounded-2xl bg-slate-900 p-3 shadow-2xl border border-slate-800"
        >
          {/* Top window styling accents */}
          <div className="flex items-center gap-2 px-3 pb-3">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="text-xs text-slate-500 font-mono ml-4">https://app.pharmsync.org/dashboard</div>
          </div>
          
          <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-slate-950">
            <Image
              src="/img/pharmacy-2.webp"
              alt="Interactive enterprise core web interface displaying dynamic stock controls"
              fill
              className="object-cover"
              sizes="(max-w-7xl) 80vw, 100vw"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}