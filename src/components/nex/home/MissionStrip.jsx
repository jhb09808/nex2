import React from "react";
import { motion } from "framer-motion";
import { Target, Zap } from "lucide-react";

export default function MissionStrip() {
  const completed = 1;
  const total = 3;
  const progress = (completed / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-card rounded-2xl p-3.5 relative overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10 flex-shrink-0">
          <Target className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-white/80 text-xs font-medium truncate">Connect with 3 people nearby</p>
            <span className="text-white/30 text-[10px] font-mono flex-shrink-0 ml-2">{completed}/{total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 flex-shrink-0">
          <Zap className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 text-[10px] font-bold">+50 XP</span>
        </div>
      </div>
    </motion.div>
  );
}