import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Diamond, Crown, Sparkles, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProfileCard from "@/components/nex/home/ProfileCard";
import GlassCard from "@/components/nex/GlassCard";

export default function PlatinumFeed() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [platinumUsers, setPlatinumUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notPlatinum, setNotPlatinum] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length === 0) {
        navigate("/onboarding");
        return;
      }
      const myProfile = profiles[0];
      setProfile(myProfile);

      if (myProfile.plan !== "platinum") {
        setNotPlatinum(true);
        setLoading(false);
        return;
      }

      const allUsers = await base44.entities.UserProfile.list("-created_date", 50);
      const platinum = allUsers.filter(
        (u) => u.id !== myProfile.id && u.plan === "platinum" && !u.is_banned && !u.is_suspended
      );
      setPlatinumUsers(platinum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="holo-orb w-48 h-48 bg-cyan-500 top-1/4 left-1/4" />
        <div className="holo-orb w-64 h-64 bg-blue-600 bottom-1/4 right-1/4" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin" />
          </div>
          <p className="text-white/30 text-xs font-mono uppercase tracking-wider">Platinum Lounge...</p>
        </div>
      </div>
    );
  }

  if (notPlatinum) {
    return (
      <div className="px-4 pt-10 safe-top">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto"
        >
          <GlassCard strong className="flex flex-col items-center text-center !py-10 ai-border">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center mb-5">
              <Lock className="w-7 h-7 text-cyan-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Platinum Members Only</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              The Platinum Lounge is an exclusive, curated network reserved for our highest-tier members.
            </p>
            <button
              onClick={() => navigate("/premium")}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
            >
              <Diamond className="w-4 h-4" /> Upgrade to Platinum
            </button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="holo-orb w-72 h-72 bg-cyan-500 top-0 -left-24" style={{ animation: "float-y 9s ease-in-out infinite" }} />
      <div className="holo-orb w-80 h-80 bg-blue-600 top-96 -right-28" style={{ animation: "float-y 11s ease-in-out infinite 1s" }} />

      <motion.div
        className="relative px-4 pt-6 safe-top space-y-6 pb-28"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between pr-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Diamond className="w-3.5 h-3.5 text-cyan-300" />
              <p className="text-white/30 text-[10px] font-medium uppercase tracking-[0.2em]">Platinum Lounge</p>
            </div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Exclusive Circle</span>
            </h1>
          </div>
        </motion.div>

        {/* Curated banner */}
        <motion.div variants={fadeUp}>
          <GlassCard className="flex items-center gap-3 !p-4 ai-border">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Your network is curated</p>
              <p className="text-white/40 text-xs mt-0.5">
                {platinumUsers.length} elite member{platinumUsers.length !== 1 ? "s" : ""} in your exclusive circle
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Platinum member cards */}
        {platinumUsers.length > 0 ? (
          <motion.div variants={fadeUp} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {platinumUsers.map((user, i) => (
              <ProfileCard key={user.id} user={user} myInterests={profile?.interests} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}>
            <GlassCard className="flex flex-col items-center text-center !py-12">
              <Crown className="w-8 h-8 text-cyan-300/50 mb-3" />
              <p className="text-white/50 text-sm font-medium">No other Platinum members yet</p>
              <p className="text-white/30 text-xs mt-1">Your exclusive circle is growing. Check back soon.</p>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}