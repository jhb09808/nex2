import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Flame } from "lucide-react";
import CountUp from "@/components/nex/home/CountUp";
import { base44 } from "@/api/base44Client";

export default function GlobalCounters() {
  const [counts, setCounts] = useState({ active_count: 0, waitlist_count: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    base44.functions.invoke("getGlobalCounts", {})
      .then((res) => setCounts(res.data))
      .catch((err) => console.error("GlobalCounters error:", err))
      .finally(() => setLoaded(true));
  }, []);

  const stats = [
    {
      icon: Users,
      label: "Active members",
      value: counts.active_count || 0,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      border: "border-blue-400/25",
      glow: "rgba(0, 122, 255, 0.06)",
    },
    {
      icon: Flame,
      label: "On the waitlist",
      value: counts.waitlist_count || 0,
      color: "text-orange-400",
      bg: "bg-orange-500/15",
      border: "border-orange-400/25",
      glow: "rgba(255, 136, 0, 0.05)",
    },
  ];

  return (
    <div className="flex gap-3 w-full">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: loaded ? 0 : 1, y: loaded ? 12 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
          className={`flex-1 relative rounded-2xl p-4 overflow-hidden border ${stat.border}`}
          style={{ background: "rgba(0, 50, 150, 0.04)", boxShadow: `0 0 15px ${stat.glow}` }}
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: stat.glow }} />
          <div className="relative">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center mb-2.5`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="font-cyber text-2xl font-bold text-white leading-none">
              <CountUp to={stat.value} />
            </p>
            <p className="text-blue-200/50 text-[10px] mt-1.5 font-cyber tracking-wider uppercase">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}