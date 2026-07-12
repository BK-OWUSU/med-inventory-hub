// components/landing/WhyChooseUs.tsx
"use client";

import React from "react";
import { Zap, ShieldCheck, HeartPulse, LineChart, MessageSquareCode, Workflow } from "lucide-react";
import { motion } from "motion/react";

const benefits = [
  { icon: <Zap className="h-5 w-5 text-green-700" />, title: "Faster Procurement", desc: "Reduces processing workflows from days to minutes using automated route checks." },
  { icon: <HeartPulse className="h-5 w-5 text-green-700" />, title: "Zero Shortages", desc: "Predicts facility demand anomalies before stock hits critically low thresholds." },
  { icon: <Workflow className="h-5 w-5 text-green-700" />, title: "Real-Time Collaboration", desc: "Connects procurement staff and pharmacists through secure operational workspaces." },
  { icon: <ShieldCheck className="h-5 w-5 text-green-700" />, title: "Secure Platform", desc: "Meets global healthcare data criteria, including end-to-end audit security tracking." },
  { icon: <LineChart className="h-5 w-5 text-green-700" />, title: "Smart Reporting", desc: "Generates clear performance dashboards and inventory summaries with one click." },
  { icon: <MessageSquareCode className="h-5 w-5 text-green-700" />, title: "Smart Inventory", desc: "Applies historical machine patterns to optimize seasonal batch reorder points." },
];

export default function WhyChooseUs() {
  return (
    <section id="benefits" className="py-20 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Designed to Protect Your Supply Channels
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A modern approach that cuts procurement friction, maintains full visibility, and keeps key inventory aligned with hospital demands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}