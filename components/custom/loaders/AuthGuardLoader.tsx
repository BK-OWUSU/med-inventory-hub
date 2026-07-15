"use client";

import React from "react";
import { motion } from "motion/react";
import { Pill } from "lucide-react";

export function AuthGuardLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center h-16 w-16">
          
          {/* 1. Outermost soft radiating ripple */}
          <motion.div
            className="absolute h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            animate={{
              scale: [1, 2.2],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: [0.21, 0.85, 0.4, 1], // Custom medical pulse ease
            }}
          />

          {/* 2. Inner crisp radiating ripple */}
          <motion.div
            className="absolute h-10 w-15 rounded-full bg-emerald-500/5 border border-emerald-500/10"
            animate={{
              scale: [1, 1.6],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0.15, // Slight offset for secondary wave
              ease: [0.21, 0.85, 0.4, 1],
            }}
          />

          {/* 3. The Beating Heart (Pill Container) */}
          <motion.div
            className="relative z-10 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
            animate={{
              // Classic double-beat sequence (systole & diastole)
              scale: [1, 1.15, 1.08, 1.25, 1, 1],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              // Keyframe mapping: quick double pulse at the start of the 1.4s cycle, then a rest period
              times: [0, 0.12, 0.20, 0.38, 0.55, 1],
              ease: "easeInOut",
            }}
          >
            <Pill className="h-5 w-5 rotate-45" />
          </motion.div>
        </div>

        {/* 4. Elegant Text fading */}
        <motion.p 
          className="text-xs font-bold text-slate-500 tracking-widest uppercase"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Syncing Workspace
        </motion.p>
      </div>
    </div>
  );
}