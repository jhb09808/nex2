import React from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy } from "lucide-react";

export default function NetworkingStreak({ streakMessage }) {
  const streak = 5;
  const xp = 1240;
  const level = 4;
  const xpToNext = 2000;
  const xpProgress = (xp / xpToNext) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="ai-card rounded-[1.5rem] p-5 relative overflow-hidden"
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl" />
      <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl" />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center border border-amber-500/10">
              <Flame className="w-6 h-6 text-amber-400 flame-flicker" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-2xl leading-none">{streak} <span className="text-sm text-white/40 font-normal">days</span></p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Networking Streak</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/10">
          <Trophy className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 text-xs font-bold">Lvl {level}</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/40 text-[10px] font-mono">{xp.toLocaleString()} XP</span>
          <span className="text-white/20 text-[10px] font-mono">{xpToNext.toLocaleString()} XP</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {streakMessage && (
        <p className="relative text-white/40 text-xs leading-relaxed">{streakMessage}</p>
      )}
    </motion.div>
  );
}