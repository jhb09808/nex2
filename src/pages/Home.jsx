import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Radar, Activity, Briefcase, Users, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import NearbyNudge from "@/components/nex/NearbyNudge";
import LiveRadar from "@/components/nex/home/LiveRadar";
import TodayMission from "@/components/nex/home/TodayMission";
import CityActivity from "@/components/nex/home/CityActivity";
import TrendingCommunities from "@/components/nex/home/TrendingCommunities";
import MomentsAround from "@/components/nex/home/MomentsAround";
import AIBriefing from "@/components/nex/ai/AIBriefing";
import AIMatchmaker from "@/components/nex/ai/AIMatchmaker";
import OpportunityFeed from "@/components/nex/ai/OpportunityFeed";
import NetworkingStreak from "@/components/nex/ai/NetworkingStreak";
import AIGoals from "@/components/nex/ai/AIGoals";
import ProfileCard from "@/components/nex/home/ProfileCard";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0) {
        if (!profiles[0].onboarding_complete) { navigate("/onboarding"); return; }
        setProfile(profiles[0]);
      } else { navigate("/onboarding"); return; }
      const allUsers = await base44.entities.UserProfile.list("-created_date", 20);
      setNearbyUsers(allUsers.filter((u) => u.id !== profiles[0].id));
      const evts = await base44.entities.NearbyEvent.list("-date", 5);
      setEvents(evts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="holo-orb w-48 h-48 bg-blue-600 top-1/4 left-1/4" />
        <div className="holo-orb w-64 h-64 bg-violet-600 bottom-1/4 right-1/4" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-400 animate-spin" />
          </div>
          <p className="text-white/30 text-xs font-mono uppercase tracking-wider">NEX AI initializing...</p>
        </div>
      </div>
    );
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  const SectionHeader = ({ icon: Icon, children, action }) => (
    <div className="flex items-center justify-between mb-4 px-1">
      <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-400" />
        {children}
      </h2>
      {action}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Holographic background */}
      <div className="holo-orb w-72 h-72 bg-blue-600 top-0 -left-24" style={{ animation: "float-y 9s ease-in-out infinite" }} />
      <div className="holo-orb w-80 h-80 bg-violet-600 top-96 -right-28" style={{ animation: "float-y 11s ease-in-out infinite 1s" }} />
      <div className="holo-orb w-56 h-56 bg-cyan-500 bottom-32 left-1/3" style={{ animation: "float-y 7s ease-in-out infinite 2s" }} />

      <motion.div
        className="relative px-4 pt-6 safe-top space-y-8 pb-28"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ai-dot" />
              <p className="text-white/30 text-[10px] font-medium uppercase tracking-[0.2em]">NEX AI · Active</p>
            </div>
            <h1 className="text-3xl font-bold holo-text">{profile?.username || "User"}</h1>
          </div>
          <button onClick={() => navigate("/profile")} className="relative">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-500/20 via-violet-500/20 to-cyan-500/20 blur-md" />
            <UserAvatar src={profile?.profile_photo} size="md" isOnline={true} className="relative" />
          </button>
        </motion.div>

        {/* AI Daily Briefing — HERO */}
        <motion.div variants={fadeUp}>
          <AIBriefing profile={profile} nearbyUsers={nearbyUsers} events={events} />
        </motion.div>

        {/* Live Radar */}
        <motion.div variants={fadeUp}>
          <LiveRadar nearbyUsers={nearbyUsers} />
        </motion.div>

        {/* Networking Streak + Today's Mission */}
        <motion.div variants={fadeUp} className="space-y-4">
          <NetworkingStreak streakMessage="You're on a 5-day streak. Connect with 1 more person today!" />
          <div>
            <SectionHeader icon={Target}>Today's Mission</SectionHeader>
            <TodayMission />
          </div>
        </motion.div>

        {/* AI Goals */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Target}>AI Networking Goals</SectionHeader>
          <AIGoals />
        </motion.div>

        {/* People You Should Meet — AI Matchmaker */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Users}>People You Should Meet</SectionHeader>
          <AIMatchmaker nearbyUsers={nearbyUsers} myInterests={profile?.interests} />
        </motion.div>

        {/* Discover Nearby — Enhanced Profile Cards */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Radar}>Discover Nearby</SectionHeader>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {nearbyUsers.length > 0 ? nearbyUsers.slice(0, 8).map((user, i) => (
              <ProfileCard key={user.id} user={user} myInterests={profile?.interests} index={i} />
            )) : (
              <div className="ai-card rounded-[1.75rem] py-10 px-4 text-center w-full">
                <p className="text-white/30 text-sm">No signals detected nearby yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Opportunity Feed */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Briefcase}>AI Opportunity Feed</SectionHeader>
          <OpportunityFeed myInterests={profile?.interests} />
        </motion.div>

        {/* City Activity */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Activity}>City Activity</SectionHeader>
          <CityActivity />
        </motion.div>

        {/* Trending Communities */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Users}>Trending Communities</SectionHeader>
          <TrendingCommunities />
        </motion.div>

        {/* Moments Around You */}
        <motion.div variants={fadeUp}>
          <SectionHeader icon={Radio}>Moments Around You</SectionHeader>
          <MomentsAround events={events} />
        </motion.div>
      </motion.div>
    </div>
  );
}