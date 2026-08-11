import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Users, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import BriefingStrip from "@/components/nex/home/BriefingStrip";
import TopMatch from "@/components/nex/home/TopMatch";
import MissionStrip from "@/components/nex/home/MissionStrip";
import OpportunityFeed from "@/components/nex/ai/OpportunityFeed";
import GlobalCounters from "@/components/nex/GlobalCounters";
import OpportunityDiscovery from "@/components/nex/opportunity/OpportunityDiscovery";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discoveryTab, setDiscoveryTab] = useState("people");

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

  const SectionHeader = ({ icon: Icon, children }) => (
    <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2 mb-4 px-1">
      <Icon className="w-4 h-4 text-blue-400" />
      {children}
    </h2>
  );

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {/* Holographic background */}
      <div className="holo-orb w-72 h-72 bg-blue-600 top-0 -left-24" style={{ animation: "float-y 9s ease-in-out infinite" }} />
      <div className="holo-orb w-80 h-80 bg-violet-600 top-96 -right-28" style={{ animation: "float-y 11s ease-in-out infinite 1s" }} />
      <div className="holo-orb w-56 h-56 bg-cyan-500 bottom-32 left-1/3" style={{ animation: "float-y 7s ease-in-out infinite 2s" }} />

      <motion.div
        className="relative px-4 pt-6 safe-top space-y-6 pb-28 flex-1 min-h-0 overflow-y-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between pr-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ai-dot" />
              <p className="text-white/30 text-[10px] font-medium uppercase tracking-[0.2em]">NEX AI · Active</p>
            </div>
            <h1 className="text-3xl font-bold holo-text">{profile?.username || "User"}</h1>
          </div>
        </motion.div>

        {/* Community counters */}
        <motion.div variants={fadeUp}>
          <GlobalCounters />
        </motion.div>

        {/* Discovery Mode Tabs */}
        <motion.div variants={fadeUp}>
          <div className="flex p-1 rounded-xl bg-white/[0.03] border border-white/5">
            <button
              onClick={() => setDiscoveryTab("people")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-cyber font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                discoveryTab === "people" ? "neon-btn text-white" : "text-white/40"
              }`}
            >
              <Users size={14} /> People You Should Meet
            </button>
            <button
              onClick={() => setDiscoveryTab("opportunities")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-cyber font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                discoveryTab === "opportunities" ? "neon-btn text-white" : "text-white/40"
              }`}
            >
              <Zap size={14} /> Opportunities For You
            </button>
          </div>
        </motion.div>

        {/* People You Should Meet Tab */}
        {discoveryTab === "people" && (
          <>
            {/* Briefing Strip */}
            <motion.div variants={fadeUp}>
              <BriefingStrip nearbyUsers={nearbyUsers} events={events} />
            </motion.div>

            {/* Top Match */}
            <motion.div variants={fadeUp}>
              <SectionHeader icon={Users}>Who You Should Meet</SectionHeader>
              <TopMatch nearbyUsers={nearbyUsers} myInterests={profile?.interests} profile={profile} />
            </motion.div>

            {/* Today's Mission — slim strip */}
            <motion.div variants={fadeUp}>
              <MissionStrip />
            </motion.div>

            {/* AI Opportunity Feed */}
            <motion.div variants={fadeUp}>
              <SectionHeader icon={Briefcase}>Opportunities</SectionHeader>
              <OpportunityFeed myInterests={profile?.interests} />
            </motion.div>
          </>
        )}

        {/* Opportunities For You Tab */}
        {discoveryTab === "opportunities" && (
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Zap}>Opportunity Mode</SectionHeader>
            <OpportunityDiscovery
              profile={profile}
              isPlatinum={profile?.plan === "platinum"}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}