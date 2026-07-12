import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Flame } from "lucide-react";
import CountUp from "@/components/nex/home/CountUp";
import { base44 } from "@/api/base44Client";

export default function GlobalCounters() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const res = await base44.functions.invoke("getGlobalCounts", {});
      setCounts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !counts) {
    return (
      <div className="flex gap-3 w-full">
        <div className="flex-1 glass-strong rounded-2xl p-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-white/5 mb-2" />
          <div className="h-6 w-12 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded mt-1" />
        </div>
        <div className="flex-1 glass-strong rounded-2xl p-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-white/5 mb-2" />
          <div className="h-6 w-12 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded mt-1" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: "Active members",
      value: counts.active_count,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      ring: "border-blue-500/20",
      glow: "bg-blue-500/10",
    },
    {
      icon: Flame,
      label: "On the waitlist",
      value: counts.waitlist_count,
      color: "text-orange-400",
      bg: "bg-orange-500/15",
      ring: "border-orange-500/20",
      glow: "bg-orange-500/10",
    },
  ];

  return (
    <div className="flex gap-3 w-full">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
          className="flex-1 relative glass-strong rounded-2xl p-4 overflow-hidden"
        >
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${stat.glow} blur-2xl`} />
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.ring} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white leading-none">
              <CountUp to={stat.value} />
            </p>
            <p className="text-white/40 text-xs mt-1">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}