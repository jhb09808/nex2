import React from "react";
import { motion } from "framer-motion";
import { Target, Flame, Zap } from "lucide-react";

export default function TodayMission() {
  const completed = 1;
  const total = 3;
  const progress = (completed / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="neon-card rounded-[1.75rem] p-5 relative overflow-hidden"
    >
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl" />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10">
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Today's Mission</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider">Daily objective</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/10">
          <Flame className="w-3 h-3 text-amber-400" />
          <span className="text-amber-400 text-xs font-bold">5</span>
        </div>
      </div>

      <p className="relative text-white/80 text-sm mb-4">
        Connect with <span className="text-white font-semibold">3 people</span> nearby who share your interests
      </p>

      {/* Progress */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="text-white/40 text-xs font-mono">{completed}/{total}</span>
      </div>

      {/* Reward */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-white/50 text-xs">Reward: <span className="text-blue-400 font-semibold">+50 XP</span></span>
        </div>
        <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors border border-white/5">
          Continue
        </button>
      </div>
    </motion.div>
  );
}