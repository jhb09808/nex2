import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowUpRight } from "lucide-react";

const COMMUNITIES = [
  { name: "AI Builders NYC", members: "3.4k", tag: "Tech", color: "from-blue-500/15 to-blue-600/5", dot: "bg-blue-400" },
  { name: "Design Circle", members: "1.9k", tag: "Design", color: "from-violet-500/15 to-violet-600/5", dot: "bg-violet-400" },
  { name: "Founders Club", members: "987", tag: "Startup", color: "from-amber-500/15 to-orange-600/5", dot: "bg-amber-400" },
  { name: "Fitness Collective", members: "2.5k", tag: "Health", color: "from-emerald-500/15 to-teal-600/5", dot: "bg-emerald-400" },
];

export default function TrendingCommunities() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {COMMUNITIES.map((comm, i) => (
        <motion.div
          key={comm.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
          className="neon-card rounded-2xl p-4 relative overflow-hidden group cursor-pointer"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${comm.color}`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${comm.dot}`} />
              <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-white font-semibold text-sm leading-tight mb-1">{comm.name}</p>
            <div className="flex items-center gap-1 text-white/30 text-[10px]">
              <Users className="w-3 h-3" />
              <span className="font-mono">{comm.members}</span>
              <span className="mx-1">·</span>
              <span>{comm.tag}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}