import React from "react";

const TIER_STYLES = {
  free: {
    gradient: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
    ring: "rgba(255,255,255,0.2)",
    glow: "rgba(255,255,255,0.06)",
  },
  plus: {
    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    ring: "rgba(96,165,250,0.5)",
    glow: "rgba(59,130,246,0.15)",
  },
  pro: {
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    ring: "rgba(251,191,36,0.5)",
    glow: "rgba(245,158,11,0.15)",
  },
  platinum: {
    gradient: "linear-gradient(135deg, #22D3EE, #60A5FA)",
    ring: "rgba(34,211,238,0.5)",
    glow: "rgba(34,211,238,0.15)",
  },
};

export default function UserAvatar({ src, size = "md", isOnline, plan = "free", showProfilePhoto = false, blurLevel = 0, className = "" }) {
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

  const textSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
    xl: "text-3xl",
  };

  const tier = TIER_STYLES[plan] || TIER_STYLES.free;
  const showPhoto = (plan === "platinum" || plan === "pro") && showProfilePhoto && src;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center`}
        style={{
          background: showPhoto ? undefined : tier.gradient,
          border: `2px solid ${tier.ring}`,
          boxShadow: `0 0 12px ${tier.glow}`,
        }}
      >
        {showPhoto ? (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: blurLevel > 0 ? `blur(${blurLevel}px)` : "none",
              transition: "filter 600ms ease-in-out, transform 600ms ease-in-out",
              transform: blurLevel > 0 ? "scale(1.15)" : "scale(1)",
            }}
          />
        ) : (
          <span className={`${textSizes[size]} font-bold text-white/90`}>
            {/* Initial displayed for non-platinum tiers */}
          </span>
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