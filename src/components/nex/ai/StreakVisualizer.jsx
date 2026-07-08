import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Zap, Award, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";

const BADGES = [
  { id: "first_connection", icon: Zap, label: "First Connection", threshold: 1, color: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5", border: "border-blue-500/15" },
  { id: "on_fire", icon: Flame, label: "On Fire (3 days)", threshold: 3, color: "text-amber-400", bg: "from-amber-500/15 to-orange-600/5", border: "border-amber-500/15" },
  { id: "week_warrior", icon: Trophy, label: "Week Warrior (7 days)", threshold: 7, color: "text-yellow-400", bg: "from-yellow-500/15 to-amber-600/5", border: "border-yellow-500/15" },
  { id: "two_week_titan", icon: Star, label: "Two-Week Titan (14 days)", threshold: 14, color: "text-violet-400", bg: "from-violet-500/15 to-purple-600/5", border: "border-violet-500/15" },
  { id: "month_master", icon: Crown, label: "Month Master (30 days)", threshold: 30, color: "text-cyan-400", bg: "from-cyan-500/15 to-blue-600/5", border: "border-cyan-500/15" },
];

export default function StreakVisualizer({ profile }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const data = await base44.entities.NetworkingMemory.filter({}, "-last_interaction_date", 100);
      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { streak, dailyCounts, totalConnections } = useMemo(() => {
    if (memories.length === 0) return { streak: 0, dailyCounts: [], totalConnections: 0 };

    const byDate = {};
    memories.forEach((m) => {
      if (!m.last_interaction_date) return;
      const day = m.last_interaction_date.split("T")[0];
      byDate[day] = (byDate[day] || 0) + 1;
    });

    const sortedDates = Object.keys(byDate).sort().reverse();

    let streakCount = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (byDate[today] || byDate[yesterday]) {
      let checkDate = byDate[today] ? today : yesterday;
      while (byDate[checkDate]) {
        streakCount++;
        checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0];
      }
    }

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      last7.push({ date: d, count: byDate[d] || 0, label: new Date(d).toLocaleDateString("en", { weekday: "short" }).charAt(0) });
    }

    return { streak: streakCount, dailyCounts: last7, totalConnections: memories.length };
  }, [memories]);

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);
  const earnedBadges = BADGES.filter((b) => streak >= b.threshold);
  const nextBadge = BADGES.find((b) => streak < b.threshold);
  const todayCount = dailyCounts[dailyCounts.length - 1]?.count || 0;

  if (loading) {
    return (
      <GlassCard>
        <div className="shimmer rounded-xl h-32" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="ai-card rounded-[1.5rem] p-5 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl" />

        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center border border-amber-500/10`}>
                <Flame className="w-6 h-6 text-amber-400 flame-flicker" />
              </div>
              {streak >= 3 && (
                <div className="absolute -inset-1 rounded-2xl border border-amber-500/20 animate-pulse" style={{ animationDuration: "2s" }} />
              )}
            </div>
            <div>
              <p className="text-white font-bold text-2xl leading-none">{streak} <span className="text-sm text-white/40 font-normal">days</span></p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Networking Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/10">
            <Award className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400 text-xs font-bold">{totalConnections} total</span>
          </div>
        </div>

        {/* Daily bar chart */}
        <div className="relative">
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Daily Interactions (Last 7 Days)</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {dailyCounts.map((day, i) => {
              const heightPct = day.count > 0 ? Math.max((day.count / maxCount) * 100, 8) : 0;
              const isToday = i === dailyCounts.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-white/50 text-[10px] font-mono font-medium">{day.count || ""}</span>
                  <div className="w-full flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-full rounded-md min-h-[2px] ${
                        day.count > 0
                          ? isToday
                            ? "bg-gradient-to-t from-blue-600 to-blue-400 glow-blue-sm"
                            : "bg-gradient-to-t from-blue-500/40 to-blue-400/30"
                          : "bg-white/5"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isToday ? "text-blue-400" : "text-white/30"}`}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Next goal */}
      {nextBadge && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="ai-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5`}>
              <nextBadge.icon className={`w-4 h-4 ${nextBadge.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium">Next Reward</p>
              <p className="text-white/40 text-xs">{nextBadge.label}</p>
            </div>
            <span className="text-white/50 text-xs font-mono">{streak}/{nextBadge.threshold} days</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((streak / nextBadge.threshold) * 100, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Badges grid */}
      <div>
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">Reward Badges</p>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge, i) => {
            const earned = streak >= badge.threshold;
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`relative rounded-2xl p-4 flex flex-col items-center text-center transition-all ${
                  earned
                    ? `bg-gradient-to-br ${badge.bg} border ${badge.border}`
                    : "bg-white/[0.02] border border-white/5 opacity-40 grayscale"
                }`}
              >
                {earned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-emerald-400" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${earned ? "bg-white/5" : "bg-white/[0.02]"}`}>
                  <Icon className={`w-5 h-5 ${earned ? badge.color : "text-white/30"}`} />
                </div>
                <p className={`text-xs font-medium leading-tight ${earned ? "text-white/80" : "text-white/30"}`}>{badge.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}