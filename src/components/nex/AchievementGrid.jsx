import React from "react";
import { motion } from "framer-motion";
import { Zap, Users, Network, Star, Trophy, BadgeCheck, Sparkles, CheckCircle, Crown } from "lucide-react";

export const ACHIEVEMENTS = [
  { id: "first_connection", icon: Zap, label: "First Step", desc: "1 connection", check: (c) => c >= 1, color: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5", border: "border-blue-500/15" },
  { id: "social_circle", icon: Users, label: "Social Circle", desc: "5 connections", check: (c) => c >= 5, color: "text-cyan-400", bg: "from-cyan-500/15 to-blue-600/5", border: "border-cyan-500/15" },
  { id: "well_connected", icon: Network, label: "Well Connected", desc: "10 connections", check: (c) => c >= 10, color: "text-violet-400", bg: "from-violet-500/15 to-purple-600/5", border: "border-violet-500/15" },
  { id: "network_hub", icon: Star, label: "Network Hub", desc: "25 connections", check: (c) => c >= 25, color: "text-amber-400", bg: "from-amber-500/15 to-orange-600/5", border: "border-amber-500/15" },
  { id: "super_connector", icon: Trophy, label: "Super Connector", desc: "50 connections", check: (c) => c >= 50, color: "text-yellow-400", bg: "from-yellow-500/15 to-amber-600/5", border: "border-yellow-500/15" },
  { id: "nex2_legend", icon: Crown, label: "NEX2 Legend", desc: "100 connections", check: (c) => c >= 100, color: "text-emerald-400", bg: "from-emerald-500/15 to-teal-600/5", border: "border-emerald-500/15" },
  { id: "verified", icon: BadgeCheck, label: "Verified", desc: "Get verified", check: (_, p) => p?.is_verified, color: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5", border: "border-blue-500/15" },
  { id: "og_member", icon: Sparkles, label: "OG Member", desc: "Early access", check: (_, p) => p?.is_og, color: "text-amber-400", bg: "from-amber-500/15 to-orange-600/5", border: "border-amber-500/15" },
  { id: "profile_complete", icon: CheckCircle, label: "Complete Profile", desc: "Bio + interests", check: (_, p) => p?.bio && p?.interests?.length >= 3, color: "text-emerald-400", bg: "from-emerald-500/15 to-teal-600/5", border: "border-emerald-500/15" },
];

export default function AchievementGrid({ connectionCount = 0, profile }) {
  const earnedCount = ACHIEVEMENTS.filter((a) => a.check(connectionCount, profile)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Achievements</p>
        <span className="text-white/30 text-[10px] font-mono">{earnedCount}/{ACHIEVEMENTS.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ACHIEVEMENTS.map((achievement, i) => {
          const earned = achievement.check(connectionCount, profile);
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className={`relative rounded-xl p-3 flex flex-col items-center text-center transition-all ${
                earned
                  ? `bg-gradient-to-br ${achievement.bg} border ${achievement.border}`
                  : "bg-white/[0.02] border border-white/5 opacity-40 grayscale"
              }`}
            >
              {earned && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-2 h-2 text-emerald-400" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${earned ? "bg-white/5" : "bg-white/[0.02]"}`}>
                <Icon className={`w-4 h-4 ${earned ? achievement.color : "text-white/30"}`} />
              </div>
              <p className={`text-[10px] font-medium leading-tight ${earned ? "text-white/80" : "text-white/30"}`}>{achievement.label}</p>
              <p className={`text-[9px] mt-0.5 ${earned ? "text-white/40" : "text-white/20"}`}>{achievement.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}