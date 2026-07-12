"use client";

import CTA from "./CTA";
import DashboardPreview from "./DashboardPreview";
import FAQ from "./FAQ";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Navbar from "./Navbar";
import Stats from "./Stats";
import Testimonials from "./Testimonials";
import WhyChooseUs from "./WhyChooseUs";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-green-600 selection:text-white antialiased overflow-x-hidden">
      {/* Background ambient gradient element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-linear-to-b from-green-50/50 to-transparent pointer-events-none -z-10" />
      
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <WhyChooseUs />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}