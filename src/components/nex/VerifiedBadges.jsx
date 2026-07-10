import React from "react";
import { BadgeCheck, Star } from "lucide-react";

/**
 * Renders verification badges next to a user's name.
 * - Blue check (BadgeCheck) for verified users
 * - Gold star (Star) for OG / early-access users
 */
export default function VerifiedBadges({ isVerified, isOg, size = "md", className = "" }) {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  const iconSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-1 flex-shrink-0 ${className}`}>
      {isVerified && <BadgeCheck className={`${iconSize} text-blue-400`} />}
      {isOg && <Star className={`${iconSize} text-amber-400 fill-amber-400/30`} />}
    </div>
  );
}