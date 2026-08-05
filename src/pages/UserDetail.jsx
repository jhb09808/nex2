import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Handshake } from "lucide-react";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";
import WaveButton from "@/components/nex/safety/WaveButton";
import BlockReportSheet from "@/components/nex/safety/BlockReportSheet";
import ShareButton from "@/components/nex/ShareButton";
import AchievementGrid from "@/components/nex/AchievementGrid";
import InterestBanner from "@/components/nex/InterestBanner";
import ProfileOpportunitySection from "@/components/nex/ProfileOpportunitySection";
import { getUserDisplayName, getUserNumber } from "@/components/nex/userDisplay";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const passedUser = location.state?.user;
      let targetUser;
      if (passedUser) {
        targetUser = passedUser;
        setUser(passedUser);
      } else {
        targetUser = await base44.entities.UserProfile.get(userId);
        setUser(targetUser);
      }
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
      <div className="fixed inset-0 cyber-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 cyber-bg flex items-center justify-center">
        <p className="text-white/40 font-cyber tracking-wider">USER NOT FOUND</p>
      </div>
    );
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="relative min-h-screen cyber-bg overflow-hidden">
      {/* Holographic background orbs */}
      <div className="holo-orb w-72 h-72 bg-blue-600 top-0 -left-24" style={{ animation: "float-y 9s ease-in-out infinite" }} />
      <div className="holo-orb w-80 h-80 bg-violet-600 top-96 -right-28" style={{ animation: "float-y 11s ease-in-out infinite 1s" }} />
      <div className="holo-orb w-56 h-56 bg-cyan-500 bottom-32 left-1/3" style={{ animation: "float-y 7s ease-in-out infinite 2s" }} />

      <motion.div
        className="relative px-4 pt-6 safe-top pb-8 max-w-lg mx-auto space-y-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Back button */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl cyber-frame flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-cyan-300/70" />
        </motion.button>

        {/* Profile header */}
        <motion.div variants={fadeUp} className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 40px rgba(59,130,246,0.3), 0 0 80px rgba(139,92,246,0.15)" }} />
            <UserAvatar name={getUserDisplayName(user)} size="xl" isOnline={user.is_online} plan={user.plan} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-cyber font-bold text-white neon-text">{getUserDisplayName(user)}</h1>
            <VerifiedBadges isVerified={user.is_verified} isOg={user.is_og} size="lg" />
          </div>
          <p className="text-cyan-300/40 text-xs font-cyber tracking-widest mb-2">#{getUserNumber(user)}</p>
          {user?.connections_count != null && (
            <div className="flex items-center gap-1.5 text-cyan-300/50 text-sm font-cyber">
              <Handshake className="w-4 h-4" />
              <span className="tracking-wide">{user.connections_count} {user.connections_count === 1 ? "CONNECTION" : "CONNECTIONS"}</span>
            </div>
          )}
        </motion.div>

        {/* Bio */}
        {user.bio && (
          <motion.div variants={fadeUp} className="cyber-frame cyber-corners relative rounded-2xl p-4">
            <p className="text-white/70 text-sm leading-relaxed">{user.bio}</p>
          </motion.div>
        )}

        {/* Mutual interests */}
        {mutualInterests.length > 0 && (
          <motion.div variants={fadeUp} className="cyber-frame rounded-2xl p-4">
            <p className="text-xs font-cyber font-semibold text-cyan-400 uppercase tracking-wider mb-3">
              {mutualInterests.length} Mutual Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {mutualInterests.map((i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-cyber font-medium neon-btn text-white">
                  {getSubInterestName(i)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* All interests — horizontal scrolling banner */}
        {user.interests?.length > 0 && (
          <motion.div variants={fadeUp} className="cyber-frame rounded-2xl p-4">
            <p className="text-xs font-cyber font-semibold text-white/40 uppercase tracking-wider mb-3">
              {user.interests.length} Interests
            </p>
            <InterestBanner interests={user.interests} highlight={mutualInterests} />
          </motion.div>
        )}

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          <div className="cyber-frame rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Handshake className="w-4 h-4 text-cyan-400" />
              <p className="text-xl font-cyber font-bold holo-text">{user.connections_count || 0}</p>
            </div>
            <p className="text-white/30 text-[10px] font-cyber uppercase tracking-wider mt-1">Connections</p>
          </div>
          <div className="cyber-frame rounded-2xl p-4 text-center">
            <p className="text-xl font-cyber font-bold holo-text">{user.badges?.length || 0}</p>
            <p className="text-white/30 text-[10px] font-cyber uppercase tracking-wider mt-1">Badges</p>
          </div>
        </motion.div>

        {/* Opportunities */}
        <motion.div variants={fadeUp}>
          <ProfileOpportunitySection profile={user} isOwnProfile={false} />
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fadeUp} className="mb-2">
          <AchievementGrid connectionCount={user.connections_count || 0} profile={user} />
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="flex gap-3 items-start">
          <div className="flex-1">
            <WaveButton targetUser={user} onMutualMatch={handleMutualMatch} />
          </div>
          <ShareButton profile={user} />
          <button
            onClick={() => setSafetyOpen(true)}
            className="w-14 py-4 rounded-2xl cyber-frame flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
          >
            <Shield className="w-5 h-5 text-white/40" />
          </button>
        </motion.div>
      </motion.div>

      <BlockReportSheet user={user} open={safetyOpen} onClose={() => setSafetyOpen(false)} onBlocked={() => navigate(-1)} />
    </div>
  );
}