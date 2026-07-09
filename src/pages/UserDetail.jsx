import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import WaveButton from "@/components/nex/safety/WaveButton";
import BlockReportSheet from "@/components/nex/safety/BlockReportSheet";
import { getUserDisplayName } from "@/components/nex/userDisplay";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const profile = await base44.entities.UserProfile.get(userId);
      setUser(profile);
      const me = await base44.auth.me();
      const myP = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (myP.length > 0) setMyProfile(myP[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMutualMatch = (convoId) => {
    navigate(`/chat/${convoId}`);
  };

  const mutualInterests = user && myProfile
    ? user.interests?.filter((i) => myProfile.interests?.includes(i)) || []
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">User not found</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 safe-top pb-8 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-4">
        <ArrowLeft className="w-5 h-5 text-white/60" />
      </button>

      <div className="flex flex-col items-center text-center mb-6">
        <UserAvatar name={getUserDisplayName(user)} size="xl" isOnline={user.is_online} plan={user.plan} className="mb-4" />
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-white">{getUserDisplayName(user)}</h1>
          {user.is_verified && <Shield className="w-5 h-5 text-blue-400" />}
        </div>
      </div>

      {user.bio && (
        <GlassCard className="mb-4">
          <p className="text-white/60 text-sm leading-relaxed">{user.bio}</p>
        </GlassCard>
      )}

      {mutualInterests.length > 0 && (
        <GlassCard className="mb-4">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-3">
            {mutualInterests.length} Mutual Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {mutualInterests.map((i) => (
              <InterestTag key={i} label={i} selected size="sm" />
            ))}
          </div>
        </GlassCard>
      )}

      {user.interests?.length > 0 && (
        <GlassCard className="mb-6">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">All Interests</p>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((i) => (
              <InterestTag key={i} label={i} size="sm" selected={mutualInterests.includes(i)} />
            ))}
          </div>
        </GlassCard>
      )}

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <WaveButton targetUser={user} onMutualMatch={handleMutualMatch} />
        </div>
        <button
          onClick={() => setSafetyOpen(true)}
          className="w-14 py-4 rounded-2xl glass flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
        >
          <Shield className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <BlockReportSheet user={user} open={safetyOpen} onClose={() => setSafetyOpen(false)} onBlocked={() => navigate(-1)} />
    </div>
  );
}