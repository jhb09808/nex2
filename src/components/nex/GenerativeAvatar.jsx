import React from "react";
import AuraAvatar from "@/components/nex/aura/AuraAvatar";

/**
 * Deprecated — kept as a thin shim so older call sites keep working.
 * The fingerprint concept has been replaced by NEX2 Aura.
 * New code should import AuraAvatar directly and pass the full profile.
 */
export default function GenerativeAvatar({ seed = "default", isVerified, plan, interests, className = "" }) {
  return (
    <AuraAvatar
      profile={{ aura_seed: seed, is_verified: isVerified, plan, interests }}
      className={className}
    />
  );
}