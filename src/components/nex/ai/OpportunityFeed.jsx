import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FALLBACK_OPPS = [
  { title: "Startup hiring designers", type: "Job", company: "Nebula Labs", budget: "$80k-$120k", dist: "1.2 mi", time: "2h ago", industry: "Tech", color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5" },
  { title: "Needs a videographer today", type: "Gig", company: "Skyline Studios", budget: "$500", dist: "0.5 mi", time: "45m ago", industry: "Media", color: "text-violet-400", bg: "from-violet-500/10 to-violet-600/5" },
  { title: "Looking for podcast guests", type: "Collab", company: "The Founder Show", budget: "Exposure", dist: "2.8 mi", time: "1h ago", industry: "Content", color: "text-amber-400", bg: "from-amber-500/10 to-orange-600/5" },
  { title: "Investor seeking founders", type: "Investment", company: "Angel Network", budget: "$50k-$500k", dist: "3.1 mi", time: "3h ago", industry: "VC", color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-600/5" },
  { title: "Photographer needed this weekend", type: "Gig", company: "Private Client", budget: "$300", dist: "0.8 mi", time: "20m ago", industry: "Photo", color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-600/5" },
  { title: "Creator filming nearby — need talent", type: "Collab", company: "@creativeco", budget: "Revenue share", dist: "1.5 mi", time: "1h ago", industry: "Creator", color: "text-pink-400", bg: "from-pink-500/10 to-violet-600/5" },
];

export default function OpportunityFeed({ myInterests }) {
  const [opportunities, setOpportunities] = useState(FALLBACK_OPPS);

  return (
    <div className="space-y-3">
      {opportunities.map((opp, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="ai-card rounded-2xl p-4 relative overflow-hidden group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${opp.bg} pointer-events-none`} />
          <div className="relative">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md bg-white/5 ${opp.color} text-[9px] font-bold uppercase tracking-wider`}>
                  {opp.type}
                </span>
                <span className="text-white/20 text-[10px] font-mono">{opp.industry}</span>
              </div>
              <div className="flex items-center gap-1 text-white/20 text-[10px] font-mono">
                <Clock className="w-3 h-3" /> {opp.time}
              </div>
            </div>

            <p className="text-white font-semibold text-sm leading-tight mb-1">{opp.title}</p>
            <p className="text-white/40 text-xs mb-3">{opp.company}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/30 text-[10px] font-mono">
                  <MapPin className="w-3 h-3" /> {opp.dist}
                </div>
                {opp.budget && (
                  <div className={`text-[10px] font-mono font-semibold ${opp.color}`}>
                    {opp.budget}
                  </div>
                )}
              </div>
              <button className="px-3 py-1.5 rounded-lg gradient-blue text-white text-xs font-medium flex items-center gap-1 group-hover:scale-105 transition-transform">
                Connect
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}