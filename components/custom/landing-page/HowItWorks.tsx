// components/landing/HowItWorks.tsx
"use client";
import { StepProps } from "@/types/types/landing.type";
import { motion } from "motion/react";

const steps: StepProps[] = [
  { number: "01", title: "Register Facility", description: "Onboard your hospital, clinic, or wholesale pharmaceutical hub using strict regulatory credentials." },
  { number: "02", title: "Manage Inventory", description: "Sync existing local item catalogues via intuitive imports or live automated middleware configurations." },
  { number: "03", title: "Request Medicines", description: "Instantly broadcast localized dynamic orders to adjacent distribution nodes experiencing surplus stocks." },
  { number: "04", title: "Receive & Update Stock", description: "Validate incoming batches securely via smart scanning workflows to automatically balance ledger states." }
];

export default function HowItWorks() {
  return (
    <section id="process" className="py-20 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Streamlined Peer Redistribution Architecture
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Four targeted operational actions map the entire path from localized zero-stock alarms to certified asset procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl font-extrabold text-green-100 block mb-4 font-mono">{step.number}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}