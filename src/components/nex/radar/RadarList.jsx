import React from "react";
import { MapPin, EyeOff, Sparkles, MessageCircle } from "lucide-react";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { getInterestIcon } from "@/components/nex/radar/interestIcons";
import { getUserDisplayName, getUserNumberLabel } from "@/components/nex/userDisplay";

export default function RadarList({ users, onUserClick }) {
  if (users.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/40 text-sm mb-1">No one nearby</p>
        <p className="text-white/20 text-xs">Try expanding your radius or adjusting filters</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 px-4 pt-32 pb-28 space-y-2 overflow-y-auto scrollbar-hide">
      {users.map((user) => {
        const name = getUserDisplayName(user);
        return (
          <GlassCard
            key={user.id}
            onClick={() => onUserClick(user)}
            className="flex items-center gap-3 !p-3"
          >
            {user.visibility === "anonymous" ? (
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-5 h-5 text-white/40" />
              </div>
            ) : (
              <UserAvatar name={name} size="md" isOnline={user.is_online} plan={user.plan} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-semibold text-sm truncate">{name}</p>
                <VerifiedBadges isVerified={user.is_verified} isOg={user.is_og} size="sm" />
              </div>
              <p className="text-white/30 text-[10px] font-mono">{getUserNumberLabel(user)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {user._dist != null && (
                  <span className="text-white/40 text-[11px] flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {user._dist < 0.1 ? `${Math.round(user._dist * 5280)} ft` : `${user._dist.toFixed(1)} mi`}
                  </span>
                )}
                {user._shared > 0 && (
                  <span className="text-blue-400 text-[11px] flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    {user._shared} shared
                  </span>
                )}
              </div>
              {user.interests?.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {user.interests.slice(0, 5).map((interest) => {
                    const Icon = getInterestIcon(interest);
                    if (!Icon) return null;
                    return <Icon key={interest} className="w-3.5 h-3.5 text-white/30" />;
                  })}
                </div>
              )}
            </div>
            <MessageCircle className="w-4 h-4 text-white/20 flex-shrink-0" />
          </GlassCard>
        );
      })}
    </div>
  );
}