import React from "react";

export default function InterestTag({ label, selected, onClick, size = "md" }) {
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} rounded-full font-medium transition-all duration-200 ${
        selected
          ? "gradient-blue text-white glow-blue-sm"
          : "bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/80 active:scale-95"
      }`}
    >
      {label}
    </button>
  );
}