import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/nex/Logo";

export default function CompanyFooter() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Logo size="sm" />
            <p className="text-xs text-white/40 max-w-xs text-center md:text-left">
              Building the future of real-world networking.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <Link to="/company" className="hover:text-white transition-colors">Company</Link>
            <a href="/company#careers" className="hover:text-white transition-colors">Careers</a>
            <a href="/company#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} NEX2. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}