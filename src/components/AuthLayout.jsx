import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ title, subtitle, footer, children, showBack = false }) {
  return (
    <div className="fixed inset-0 cyber-bg flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md cyber-frame cyber-corners relative rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/a1047e68c_29CEE08A-B9AB-4759-8C30-4B99BC19A018.png"
            alt="NEX2"
            className="h-14 w-auto object-contain"
          />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 ai-dot" />
            <span className="text-[10px] font-cyber font-semibold text-green-400 tracking-widest">EARLY ACCESS</span>
          </div>
        </div>

        {showBack && (
          <Link to="/welcome" className="flex items-center gap-1 text-blue-200/40 text-xs hover:text-blue-200/70 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> BACK
          </Link>
        )}

        <div className="text-center space-y-1.5">
          <h1 className="font-cyber text-xl font-bold tracking-wider text-white neon-text">{title}</h1>
          {subtitle && <p className="text-blue-200/50 text-xs">{subtitle}</p>}
        </div>

        {children}

        {footer && (
          <p className="text-center text-blue-200/40 text-xs">{footer}</p>
        )}

        <div className="flex items-center justify-center pt-3 border-t border-blue-500/10">
          <span className="text-blue-200/40 text-[10px] tracking-wide">© 2026 NEX2, Inc. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  );
}