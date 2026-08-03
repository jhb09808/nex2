import React from "react";

export default function Logo({ size = "md", className = "" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-baseline gap-0.5 ${className}`}>
      <span className={`font-cyber font-black tracking-tight ${sizes[size]} text-white leading-none`}>
        NEX
      </span>
      <span className={`font-cyber font-black tracking-tight ${sizes[size]} gradient-text leading-none`}>
        2
      </span>
    </div>
  );
}