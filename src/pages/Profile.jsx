import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Edit3, Shield, Award, Crown, Diamond, ChevronRight, LogOut, Share2, Handshake } from "lucide-react";
import ShareButton from "@/components/nex/ShareButton";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";
import { getUserNumber } from "@/components/nex/userDisplay";
import AchievementGrid from "@/components/nex/AchievementGrid";
import InterestBanner from "@/components/nex/InterestBanner";
import ProfileOpportunitySection from "@/components/nex/ProfileOpportunitySection";

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
      // Sync connections_count on the profile so other users see accurate numbers
      if (profiles[0] && profiles[0].connections_count !== conversations.length) {
        await base44.entities.UserProfile.update(profiles[0].id, { connections_count: conversations.length });
      }
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
      <div className="cyber-frame cyber-corners relative rounded-2xl p-6 flex flex-col items-center text-center">
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
        {profile?.bio && <p className="text-white/40 text-sm max-w-xs mb-3">{profile.bio}</p>}

        {profile?.interests?.length > 0 && (
          <div className="w-full mb-4">
            <InterestBanner interests={profile.interests} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Handshake className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xl font-bold gradient-text">{connectionCount}</p>
            </div>
            <p className="text-white/30 text-[10px] mt-0.5">Connections</p>
          </div>
          <div className="text-center border-x border-white/5">
            <p className="text-xl font-bold gradient-text">0</p>
            <p className="text-white/30 text-[10px] mt-0.5">Chats</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold gradient-text">{profile?.badges?.length || 0}</p>
            <p className="text-white/30 text-[10px] mt-0.5">Badges</p>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <ProfileOpportunitySection profile={profile} isOwnProfile={true} />

      {/* Achievements */}
      <AchievementGrid connectionCount={connectionCount} profile={profile} />

      {/* Menu */}
      <div className="space-y-2">
        {[
          { label: "Edit Profile", icon: Edit3, path: "/edit-profile", accent: "text-cyan-300" },
          { label: "Premium Plans", icon: Crown, path: "/premium", accent: "text-amber-300" },
          { label: "Settings", icon: Settings, path: "/settings", accent: "text-blue-300" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="cyber-frame group w-full flex items-center gap-3 p-4 rounded-xl active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:border-cyan-500/20 transition-colors">
              <item.icon className={`w-4 h-4 ${item.accent}`} />
            </div>
            <span className="text-white/80 text-sm font-cyber font-medium tracking-wide flex-1 text-left">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-300/50 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="cyber-frame group w-full flex items-center gap-3 p-4 rounded-xl active:scale-[0.98] transition-transform border-red-500/10"
        >
          <div className="w-9 h-9 rounded-lg bg-red-500/[0.06] border border-red-500/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-400/70" />
          </div>
          <span className="text-red-400/70 text-sm font-cyber font-medium tracking-wide flex-1 text-left">Log Out</span>
          <ChevronRight className="w-4 h-4 text-red-400/20 group-hover:text-red-400/40 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
}