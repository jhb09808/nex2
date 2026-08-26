import React from "react";
import AuraAvatar from "@/components/nex/aura/AuraAvatar";

const TIER_STYLES = {
  free: {
    ring: "rgba(255,255,255,0.2)",
    glow: "rgba(255,255,255,0.06)",
  },
  plus: {
    ring: "rgba(96,165,250,0.5)",
    glow: "rgba(59,130,246,0.15)",
  },
  pro: {
    ring: "rgba(251,191,36,0.5)",
    glow: "rgba(245,158,11,0.15)",
  },
  platinum: {
    ring: "rgba(34,211,238,0.5)",
    glow: "rgba(34,211,238,0.15)",
  },
};

export default function UserAvatar({ name, size = "md", isOnline, plan = "free", interests, isVerified, gender, profile, className = "" }) {
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

  const tier = TIER_STYLES[plan] || TIER_STYLES.free;
  // A full profile gives the richest Aura; otherwise build one from the props
  // this avatar was given so every surface stays consistent.
  const auraProfile = profile || { aura_seed: name || "unknown", plan, interests, is_verified: isVerified, gender };
  // Tiny avatars stay static — dozens of animated orbs on the radar is waste.
  const animated = size === "lg" || size === "xl";

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizes[size]} rounded-full flex-shrink-0 overflow-hidden`}
        style={{
          border: `2px solid ${tier.ring}`,
          boxShadow: `0 0 12px ${tier.glow}`,
        }}
      >
        <AuraAvatar profile={auraProfile} animated={animated} />
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