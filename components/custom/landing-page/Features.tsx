// components/landing/Features.tsx
"use client";
import { Box, RefreshCw, Eye, ShieldAlert, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "motion/react";
import { FeatureCardProps } from "@/types/types/landing.type";

const featuresData: FeatureCardProps[] = [
  {
    icon: <Box className="h-6 w-6 text-green-600" />,
    title: "Inventory Management",
    description: "Granular control over medicine batches, active chemical compound categorization, and stock alerts."
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-green-600" />,
    title: "Inter-Facility Ordering",
    description: "Seamless peer-to-peer stock requesting pathways designed to prevent supply shortfalls systematically."
  },
  {
    icon: <Eye className="h-6 w-6 text-green-600" />,
    title: "Real-Time Stock Visibility",
    description: "Instantaneous system-wide querying access metrics for high-demand clinical formulations."
  },
  {
    icon: <ShieldAlert className="h-6 w-6 text-green-600" />,
    title: "Batch & Expiry Tracking",
    description: "Automated alert infrastructure detailing product obsolescence safety constraints."
  },
  {
    icon: <KeyRound className="h-6 w-6 text-green-600" />,
    title: "Secure Authentication",
    description: "Role-based identity parameters protecting regulatory workflows with cryptographically verified profiles."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-green-600" />,
    title: "Audit Logs",
    description: "Immutable transactional event trails supporting clinical compliance verification."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Engineered for High-Compliance Medical Operations
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A resilient operational toolset created to maintain continuous logistics validation profiles under intensive multi-tier facility requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresData.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="h-full border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-md group">
                <CardHeader>
                  <div className="p-3 bg-slate-50 group-hover:bg-green-50 rounded-xl w-fit transition-colors duration-300 mb-4">
                    {feat.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 mb-2">{feat.title}</CardTitle>
                  <CardDescription className="text-slate-600 text-sm leading-relaxed">{feat.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}