import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Calendar, ChevronRight, Search, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const trendingTopics = ["AI & Tech", "Fitness Goals", "Startup Ideas", "Night Events", "Photography"];

  return (
    <div className="px-4 pt-6 safe-top space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm">Welcome back</p>
          <h1 className="text-2xl font-bold text-white">{profile?.username || "User"}</h1>
        </div>
        <button onClick={() => navigate("/profile")} className="relative">
          <UserAvatar src={profile?.profile_photo} size="md" isOnline={true} />
        </button>
      </div>

      {/* Search */}
      <GlassCard className="flex items-center gap-3 !p-3" onClick={() => {}}>
        <Search className="w-5 h-5 text-white/30" />
        <span className="text-white/30 text-sm">Search people, interests, events...</span>
      </GlassCard>

      {/* Nearby shared-interest nudge */}
      <NearbyNudge />

      {/* Nearby People */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Nearby
          </h2>
          <button onClick={() => navigate("/map")} className="text-blue-400 text-sm font-medium flex items-center gap-1">
            View map <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {nearbyUsers.length > 0 ? nearbyUsers.slice(0, 8).map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="w-28 flex flex-col items-center !p-3 space-y-2" onClick={() => navigate(`/user/${user.id}`)}>
                <UserAvatar src={user.profile_photo} size="lg" isOnline={user.is_online} />
                <p className="text-white text-xs font-medium truncate w-full text-center">{user.username}</p>
                <p className="text-white/30 text-[10px]">{(Math.random() * 5).toFixed(1)} mi</p>
              </GlassCard>
            </motion.div>
          )) : (
            <GlassCard className="flex-1 text-center !py-8">
              <p className="text-white/30 text-sm">No one nearby yet. Check back later!</p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Trending Nearby
        </h2>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <InterestTag key={topic} label={topic} size="sm" />
          ))}
        </div>
      </div>

      {/* Events */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          Nearby Events
        </h2>
        {events.length > 0 ? events.map((event) => (
          <GlassCard key={event.id} className="mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{event.title}</p>
                <p className="text-white/30 text-xs">{event.category}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
          </GlassCard>
        )) : (
          <GlassCard className="text-center !py-6">
            <p className="text-white/30 text-sm">No events nearby</p>
          </GlassCard>
        )}
      </div>

      {/* Recently Joined */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-400" />
          Recently Joined
        </h2>
        <div className="space-y-2">
          {nearbyUsers.slice(0, 5).map((user) => (
            <GlassCard key={user.id} className="flex items-center gap-3 !p-3" onClick={() => navigate(`/user/${user.id}`)}>
              <UserAvatar src={user.profile_photo} size="sm" isOnline={user.is_online} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.username}</p>
                <p className="text-white/30 text-xs truncate">{user.interests?.slice(0, 3).join(", ")}</p>
              </div>
              <span className="text-white/20 text-xs">just now</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}