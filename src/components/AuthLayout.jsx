import React from "react";
import { Zap } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,4%)] px-4 relative">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-blue glow-blue mb-4">
            <Zap className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-white/40 mt-2 text-sm">{subtitle}</p>}
        </div>
        <div className="glass-strong rounded-2xl p-6">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-white/40 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}