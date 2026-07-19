import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";

export default function GrowthDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getGrowthMetrics", {})
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <GlassCard className="text-center !py-8">
        <p className="text-white/30 text-sm">Failed to load growth metrics</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold gradient-text">{data.active_profiles}</p>
          <p className="text-white/30 text-xs mt-1">Active Profiles</p>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold gradient-text">{data.total_profiles}</p>
          <p className="text-white/30 text-xs mt-1">Total Profiles</p>
        </GlassCard>
      </div>

      <GlassCard>
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Daily New Users (14 days)</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.daily_counts}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              itemStyle={{ color: "#60A5FA" }}
            />
            <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fill="url(#userGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}