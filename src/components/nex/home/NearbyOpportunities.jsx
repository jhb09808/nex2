import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Camera, Users, GraduationCap, MapPin, ArrowUpRight } from "lucide-react";

const OPPS = [
  { type: "Job", title: "Senior Product Designer", company: "Nebula Labs", dist: "1.2 mi", icon: Briefcase, color: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5", tag: "Hiring" },
  { type: "Gig", title: "Event Photographer", company: "Skyline Events", dist: "0.5 mi", icon: Camera, color: "text-violet-400", bg: "from-violet-500/15 to-violet-600/5", tag: "Paid" },
  { type: "Collab", title: "Co-founder for AI Startup", company: "Stealth Mode", dist: "3.1 mi", icon: Users, color: "text-amber-400", bg: "from-amber-500/15 to-orange-600/5", tag: "Equity" },
  { type: "Mentor", title: "Design Mentorship", company: "Dribbble NYC", dist: "2.8 mi", icon: GraduationCap, color: "text-emerald-400", bg: "from-emerald-500/15 to-teal-600/5", tag: "Free" },
];

export default function NearbyOpportunities() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {OPPS.map((opp, i) => {
        const Icon = opp.icon;
        return (
          <motion.div
            key={opp.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="neon-card rounded-2xl p-4 w-[220px] flex-shrink-0 relative group cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${opp.bg} rounded-2xl`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5`}>
                  <Icon className={`w-4 h-4 ${opp.color}`} />
                </div>
                <span className={`px-2 py-0.5 rounded-md bg-white/5 ${opp.color} text-[9px] font-bold uppercase tracking-wider`}>
                  {opp.tag}
                </span>
              </div>
              <p className="text-white font-semibold text-sm leading-tight mb-1">{opp.title}</p>
              <p className="text-white/40 text-xs mb-3">{opp.company}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-white/30 text-[10px] font-mono">
                  <MapPin className="w-3 h-3" /> {opp.dist}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}