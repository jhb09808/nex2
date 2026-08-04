import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/nex/Logo";

export default function CompanyFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-black overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 100%, rgba(59,130,246,0.05) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo size="sm" />
            <p className="text-xs text-white/40 max-w-xs text-center md:text-left font-light">
              Building the future of real-world networking.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-cyber uppercase tracking-wider text-white/40">
            <Link to="/company" className="hover:text-white transition-colors">Company</Link>
            <a href="/company#careers" className="hover:text-white transition-colors">Careers</a>
            <a href="/company#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 font-cyber uppercase tracking-wider">
            © {new Date().getFullYear()} NEX2. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}