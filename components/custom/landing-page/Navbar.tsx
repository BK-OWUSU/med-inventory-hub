// components/landing/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Benefits", href: "#benefits" },
  { name: "Process", href: "#process" },
  { name: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full p-2 border-b border-slate-200/80 bg-white/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2 text-green-800 font-semibold text-xl focus-visible:outline-2 focus-visible:outline-green-600 rounded-md">
          <Activity className="h-6 w-6 text-green-600" aria-hidden="true" />
          <span>PharmSync</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8" aria-label="Global desktop navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-green-700 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-green-600 rounded-sm"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Call to Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
             onClick={()=> router.push("/login")} 
             variant="ghost" className="text-slate-700 hover:text-green-700 font-medium">
            Login
          </Button>
          <Button
           onClick={()=> router.push("/login")}  
          className="bg-green-700 hover:bg-green-800 text-white shadow-sm transition-all duration-200">
            Get Started
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger >
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-75 sm:w-100">
              <SheetTitle className="text-left text-green-800 font-semibold mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" /> PharmSync
              </SheetTitle>
              <nav className="flex flex-col gap-4 mt-8" aria-label="Global mobile navigation">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-slate-700 hover:text-green-700 transition-colors py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-4 border-slate-200" />
                <Button variant="outline" className="w-full text-center">Login</Button>
                <Button className="w-full bg-green-700 hover:bg-green-800 text-white">Get Started</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}