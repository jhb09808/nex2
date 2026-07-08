import React from "react";
import { MapPin } from "lucide-react";

const TIER_LABELS = {
  same_venue: "Same venue",
  same_block: "Same block",
  nearby: "Nearby",
  far: "In your area",
};

const TIER_COLORS = {
  same_venue: "text-green-400",
  same_block: "text-blue-400",
  nearby: "text-white/40",
  far: "text-white/30",
};

export default function ProximityTier({ tier = "nearby", className = "" }) {
  const label = TIER_LABELS[tier] || TIER_LABELS.nearby;
  const color = TIER_COLORS[tier] || TIER_COLORS.nearby;

  return (
    <span className={`inline-flex items-center gap-1 text-sm ${color} ${className}`}>
      <MapPin className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export function calculateProximityTier(distanceMiles) {
  if (distanceMiles <= 0.05) return "same_venue";
  if (distanceMiles <= 0.2) return "same_block";
  if (distanceMiles <= 2) return "nearby";
  return "far";
}