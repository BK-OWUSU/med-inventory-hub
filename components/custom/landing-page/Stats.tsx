// components/landing/Stats.tsx
"use client";
import { StatProps } from "@/types/types/landing.type";
import { motion } from "motion/react";
const statsData: StatProps[] = [
  { value: "1,200+", label: "Facilities Connected" },
  { value: "4.8M+", label: "Medicines Tracked" },
  { value: "99.94%", label: "Inventory Accuracy" },
  { value: "< 12m", label: "Avg. Request Fulfillment" }
];

export default function Stats() {
  return (
    <section className="py-16 bg-green-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2 font-mono">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-green-200 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}