// components/landing/FAQ.tsx
"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQProps } from "@/types/types/types/landing.type";

const faqItems: FAQProps[] = [
  {
    value: "item-1",
    question: "Who can access and use this platform?",
    answer: "Licensed hospitals, regional clinical networks, independent community pharmacies, and verified pharmaceutical distribution hubs can join after passing verification."
  },
  {
    value: "item-2",
    question: "Is inventory updated in real time across facilities?",
    answer: "Yes. Every stock transfer, item collection, and local inventory modification updates the shared ledger immediately, keeping error margins near zero."
  },
  {
    value: "item-3",
    question: "How are inter-facility orders approved?",
    answer: "Facilities can choose automatic approvals based on set stock levels, or route requests to authorized staff for manual sign-off before transfer."
  },
  {
    value: "item-4",
    question: "What security measures protect patient and formula data?",
    answer: "The platform uses industry-standard encryption for data at rest and in transit, includes strict role-based access limits, and keeps complete audit logs to meet high compliance standards."
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Find answers to common questions about platform access, security, and integration.
          </p>
        </div>

        <Accordion  className="w-full bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          {faqItems.map((item) => (
            <AccordionItem key={item.value} value={item.value} className="border-b border-slate-100 last:border-0">
              <AccordionTrigger className="text-slate-900 hover:text-green-700 font-semibold text-left transition-colors duration-200 py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}