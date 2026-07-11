import React from "react";
import { getInterestIcon } from "@/components/nex/radar/interestIcons";

export default function InterestTag({ label, selected, onClick, size = "md", iconOnly = false }) {
  const Icon = getInterestIcon(label);

  if (iconOnly && Icon) {
    const containerSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
    const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <button
        onClick={onClick}
        title={label}
        className={`${containerSize} rounded-xl flex items-center justify-center transition-all duration-200 ${
          selected
            ? "gradient-blue text-white glow-blue-sm"
            : "bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/80 active:scale-95"
        }`}
      >
        <Icon className={iconSize} />
      </button>
    );
  }

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
      {Icon && <Icon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}