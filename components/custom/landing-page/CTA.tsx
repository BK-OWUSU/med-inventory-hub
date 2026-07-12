// components/landing/CTA.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function CTA() {
   const router = useRouter()
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-linear-to-br from-green-900 to-green-800 text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-xl border border-green-950"
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl max-w-2xl mx-auto leading-tight">
            Ready to Modernize Your Pharmacy Inventory?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-green-100 max-w-xl mx-auto">
            Join the verified medical networks using PharmSync to lower product waste and secure reliable medicine access.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
             onClick={()=> router.push("/login")}  
             size="lg" className="bg-white text-green-900 hover:bg-green-50 font-semibold shadow-md w-full sm:w-auto px-8 transition-colors duration-200">
              Get Started Now
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white border border-white/20 w-full sm:w-auto px-8">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}