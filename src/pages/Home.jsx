import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radar, TrendingUp, Calendar, ChevronRight, Search, Sparkles, ArrowUpRight, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import NearbyNudge from "@/components/nex/NearbyNudge";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: (await base44.auth.me()).id });
      if (profiles.length > 0) {
        if (!profiles[0].onboarding_complete) {
          navigate("/onboarding");
          return;
        }
        setProfile(profiles[0]);
      } else {
        navigate("/onboarding");
        return;
      }
      const allUsers = await base44.entities.UserProfile.list("-created_date", 20);
      setNearbyUsers(allUsers.filter((u) => u.id !== profiles[0].id));
      const evts = await base44.entities.NearbyEvent.list("-date", 5);
      setEvents(evts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-t-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  const trendingTopics = ["AI & Tech", "Fitness Goals", "Startup Ideas", "Night Events", "Photography"];
  const activeUsers = nearbyUsers.filter((u) => u.is_online).length;

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Holographic background orbs */}
      <div className="holo-orb w-64 h-64 bg-blue-600 top-0 -left-20" style={{ animation: "float-y 8s ease-in-out infinite" }} />
      <div className="holo-orb w-80 h-80 bg-violet-600 top-40 -right-24" style={{ animation: "float-y 10s ease-in-out infinite 1s" }} />
      <div className="holo-orb w-56 h-56 bg-cyan-500 bottom-20 left-1/3" style={{ animation: "float-y 7s ease-in-out infinite 2s" }} />

      <motion.div
        className="relative px-4 pt-6 safe-top space-y-7 pb-24"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-white/40 text-[11px] font-medium uppercase tracking-widest">Online · {activeUsers} nearby</p>
            </div>
            <h1 className="text-3xl font-bold holo-text">{profile?.username || "User"}</h1>
          </div>
          <button onClick={() => navigate("/profile")} className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500/20 via-violet-500/20 to-cyan-500/20 blur-md" />
            <UserAvatar src={profile?.profile_photo} size="md" isOnline={true} className="relative" />
          </button>
        </motion.div>

        {/* Search */}
        <motion.button
          variants={fadeUp}
          onClick={() => {}}
          className="neon-card w-full rounded-2xl flex items-center gap-3 px-4 py-3 text-left group"
        >
          <Search className="w-4 h-4 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
          <span className="text-white/30 text-sm flex-1">Search the network...</span>
          <div className="px-2 py-0.5 rounded-md bg-white/5 text-white/30 text-[10px] font-mono">⌘K</div>
        </motion.button>

        {/* Nearby nudge */}
        <motion.div variants={fadeUp}>
          <NearbyNudge />
        </motion.div>

        {/* Radar / Nearby People */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2 uppercase tracking-wider">
              <Radar className="w-4 h-4 text-blue-400" />
              Proximity Radar
            </h2>
            <button onClick={() => navigate("/map")} className="neon-card px-3 py-1.5 rounded-lg text-blue-400 text-xs font-medium flex items-center gap-1 group">
              Open map
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {nearbyUsers.length > 0 ? nearbyUsers.slice(0, 8).map((user, i) => (
              <motion.button
                key={user.id}
                variants={fadeUp}
                onClick={() => navigate(`/user/${user.id}`)}
                className="neon-card w-32 flex flex-col items-center rounded-2xl p-4 space-y-3 flex-shrink-0 relative group"
              >
                {user.is_online && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400">
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping" />
                  </div>
                )}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500/10 to-violet-500/10 group-hover:from-blue-500/30 group-hover:to-violet-500/30 blur transition-all" />
                  <UserAvatar src={user.profile_photo} size="lg" isOnline={user.is_online} className="relative" />
                </div>
                <div className="text-center w-full">
                  <p className="text-white text-xs font-medium truncate">{user.username}</p>
                  <p className="text-blue-400/50 text-[10px] font-mono mt-0.5">{(Math.random() * 5).toFixed(1)} mi</p>
                </div>
              </motion.button>
            )) : (
              <div className="neon-card flex-1 text-center rounded-2xl py-10 px-4">
                <p className="text-white/30 text-sm">No signals detected nearby.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trending Topics */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2 uppercase tracking-wider mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Trending in your zone
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic, i) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <InterestTag label={topic} size="sm" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Events */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2 uppercase tracking-wider mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            Live events
          </h2>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((event) => (
                <motion.button
                  key={event.id}
                  whileTap={{ scale: 0.98 }}
                  className="neon-card w-full rounded-2xl p-3 flex items-center gap-3 text-left group"
                >
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-violet-600" />
                    <Calendar className="w-5 h-5 text-white relative" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{event.title}</p>
                    <p className="text-blue-400/40 text-xs font-mono">{event.category}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="neon-card rounded-2xl py-8 px-4 text-center">
              <Activity className="w-6 h-6 text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No live events in range</p>
            </div>
          )}
        </motion.div>

        {/* Recently Joined */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2 uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            New connections
          </h2>
          <div className="space-y-2">
            {nearbyUsers.slice(0, 5).map((user) => (
              <motion.button
                key={user.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/user/${user.id}`)}
                className="neon-card w-full rounded-2xl p-3 flex items-center gap-3 text-left group"
              >
                <UserAvatar src={user.profile_photo} size="sm" isOnline={user.is_online} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.username}</p>
                  <p className="text-blue-400/40 text-xs truncate font-mono">{user.interests?.slice(0, 3).join(" · ")}</p>
                </div>
                <span className="text-white/20 text-[10px] font-mono uppercase tracking-wide">new</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}