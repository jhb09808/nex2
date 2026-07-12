import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Edit3, Shield, Award, Crown, Diamond, ChevronRight, LogOut, Share2, Handshake } from "lucide-react";
import ShareButton from "@/components/nex/ShareButton";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import { getUserNumber } from "@/components/nex/userDisplay";
import StreakVisualizer from "@/components/nex/ai/StreakVisualizer";
import NetworkingStreak from "@/components/nex/ai/NetworkingStreak";
import NetworkRankCard from "@/components/nex/ai/NetworkRankCard";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      // Compute actual connections from accepted conversations
      const conversations = await base44.entities.Conversation.filter({ participants: me.id });
      setConnectionCount(conversations.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout("/welcome");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const planBadge = {
    free: null,
    plus: { icon: Award, label: "Plus", color: "text-blue-400" },
    pro: { icon: Crown, label: "Pro", color: "text-yellow-400" },
    platinum: { icon: Diamond, label: "Platinum", color: "text-cyan-300" },
  };

  const badge = planBadge[profile?.plan];

  return (
    <div className="px-4 pt-6 safe-top space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <ShareButton profile={profile} />
      </div>

      {/* Profile Card */}
      <GlassCard strong className="flex flex-col items-center text-center !pt-8 !pb-6">
        <div className="relative mb-4">
          <UserAvatar name={profile?.username} size="xl" isOnline={true} plan={profile?.plan} />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white">{profile?.username}</h2>
          <VerifiedBadges isVerified={profile?.is_verified} isOg={profile?.is_og} size="md" />
        </div>
        <p className="text-white/30 text-xs font-mono mb-1">#{getUserNumber(profile)}</p>
        {badge && (
          <div className="flex items-center gap-1 mb-2">
            <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
            <span className={`text-xs font-medium ${badge.color}`}>{badge.label}</span>
          </div>
        )}
        {profile?.bio && <p className="text-white/40 text-sm max-w-xs">{profile.bio}</p>}
      </GlassCard>

      {/* Interests */}
      {profile?.interests?.length > 0 && (
        <GlassCard>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <InterestTag key={interest} label={interest} size="sm" />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="text-center !p-3">
          <div className="flex items-center justify-center gap-1">
            <Handshake className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xl font-bold gradient-text">{connectionCount}</p>
          </div>
          <p className="text-white/30 text-[10px] mt-0.5">Connections</p>
        </GlassCard>
        <GlassCard className="text-center !p-3">
          <p className="text-xl font-bold gradient-text">0</p>
          <p className="text-white/30 text-[10px] mt-0.5">Chats</p>
        </GlassCard>
        <GlassCard className="text-center !p-3">
          <p className="text-xl font-bold gradient-text">{profile?.badges?.length || 0}</p>
          <p className="text-white/30 text-[10px] mt-0.5">Badges</p>
        </GlassCard>
      </div>

      {/* Networking Streak & XP */}
      <NetworkingStreak streakMessage="Keep your streak alive — connect with 1 more person today!" />

      {/* Global Network Rank & Leaderboard */}
      <NetworkRankCard />

      {/* Networking Streak Visualizer */}
      <StreakVisualizer profile={profile} />

      {/* Menu */}
      <div className="space-y-1">
        {[
          { label: "Edit Profile", icon: Edit3, path: "/edit-profile" },
          { label: "Premium Plans", icon: Crown, path: "/premium" },
          { label: "Settings", icon: Settings, path: "/settings" },
        ].map((item) => (
          <GlassCard key={item.label} className="flex items-center gap-3 !p-3.5" onClick={() => navigate(item.path)}>
            <item.icon className="w-5 h-5 text-white/40" />
            <span className="text-white/70 text-sm font-medium flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-white/20" />
          </GlassCard>
        ))}

        <GlassCard className="flex items-center gap-3 !p-3.5" onClick={handleLogout}>
          <LogOut className="w-5 h-5 text-red-400/60" />
          <span className="text-red-400/60 text-sm font-medium flex-1">Log Out</span>
        </GlassCard>
      </div>
    </div>
  );
}