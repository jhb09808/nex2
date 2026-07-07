import React from "react";

export default function UserAvatar({ src, size = "md", isOnline, className = "" }) {
  const sizes = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const dotSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-white/10 flex-shrink-0`}>
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-blue opacity-40 flex items-center justify-center">
            <span className="text-white/60 text-xs font-semibold">?</span>
          </div>
        )}
      </div>
      {isOnline !== undefined && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${dotSizes[size]} rounded-full border-2 border-[hsl(0,0%,4%)] ${
            isOnline ? "bg-blue-400 glow-blue-sm" : "bg-white/20"
          }`}
        />
      )}
    </div>
  );
}