import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Zap, Activity } from "lucide-react";
import CountUp from "@/components/nex/home/CountUp";

const STATS = [
  { label: "Active Now", value: 1247, icon: Users, color: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5" },
  { label: "Live Events", value: 23, icon: Calendar, color: "text-violet-400", bg: "from-violet-500/15 to-violet-600/5" },
  { label: "New Links", value: 89, icon: Zap, color: "text-amber-400", bg: "from-amber-500/15 to-orange-600/5" },
  { label: "Pulse Score", value: 94, icon: Activity, color: "text-emerald-400", bg: "from-emerald-500/15 to-teal-600/5" },
];

export default function CityActivity() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="neon-card rounded-2xl p-4 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg}`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${stat.color.replace("text-", "bg-")} animate-pulse`} style={{ animationDuration: "2s" }} />
              </div>
              <p className="text-white text-2xl font-bold font-mono">
                <CountUp to={stat.value} />
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}