// components/landing/Testimonials.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { TestimonialProps } from "@/types/types/types/landing.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials: TestimonialProps[] = [
  {
    quote: "This platform transformed our multi-hub setup. We reallocated over $200k in expiring stock to facilities that needed it immediately.",
    author: "Dr. Elena Rostova",
    role: "Chief of Pharmacy Logistics",
    facility: "Metro General Hospital Network",
    avatarUrl: "/avatars/elena.webp"
  },
  {
    quote: "Setting up inter-facility requests takes seconds. It eliminates back-and-forth phone calls and gives us clear, real-time audit logs.",
    author: "Marcus Vance",
    role: "Director of Inventory Ops",
    facility: "Beacon Healthcare Systems",
    avatarUrl: "/avatars/marcus.webp"
  },
  {
    quote: "The inventory dashboard helps us easily maintain compliance. System updates are instantaneous across our 14 regional clinic sites.",
    author: "Sarah Jenkins, PharmD",
    role: "Lead Clinical Pharmacist",
    facility: "Unity Health Alliance",
    avatarUrl: "/avatars/sarah.webp"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by Modern Clinical Operators
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            See how regional networks and hospital pharmacies reduce waste and optimize daily supply lines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="h-full border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <CardContent className="pt-6 flex flex-col justify-between h-full">
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={t.avatarUrl} alt={t.author} />
                      <AvatarFallback className="bg-green-100 text-green-800 text-xs font-bold">
                        {t.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{t.author}</h4>
                      <p className="text-xs text-slate-500">{t.role}, <span className="text-green-700 font-medium">{t.facility}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}