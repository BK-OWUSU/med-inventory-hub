// components/landing/Footer.tsx
"use client";
import Link from "next/link";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        
        {/* Brand identity matrix column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <FiActivity className="h-5 w-5 text-green-500" />
            <span>PharmSync</span>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            Providing distributed networks with verified ledger security, real-time tracking, and automated supply logistics.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn Profile"><FaLinkedin className="h-5 w-5" /></a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter Feed"><FaTwitter className="h-5 w-5" /></a>
            <a href="#" className="hover:text-white transition-colors" aria-label="GitHub Repository"><FaGithub className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Links lists columns */}
        <div>
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link href="#benefits" className="hover:text-white transition-colors">Benefits</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Security Specs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Compliance Whitepapers</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Support & Contact</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">System Status</Link></li>
            <li><span className="block text-slate-300 font-medium mt-1">support@pharmsync.org</span></li>
          </ul>
        </div>

      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; {new Date().getFullYear()} PharmSync Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}