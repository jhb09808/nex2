import React from "react";

export default function GlassCard({ children, className = "", onClick, strong = false }) {
  return (
    <div
      onClick={onClick}
      className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl p-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}