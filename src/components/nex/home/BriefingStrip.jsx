import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Radio, Calendar } from "lucide-react";

export default function BriefingStrip({ nearbyUsers = [], events = [] }) {
  const [expanded, setExpanded] = useState(false);
  const online = nearbyUsers.filter((u) => u.is_online).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ai-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 active:scale-[0.99] transition-transform"
      >
        <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center flex-shrink-0 ai-glow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left flex items-center gap-2 min-w-0">
          <span className="text-white/80 text-sm font-medium">
            ✦ {nearbyUsers.length} nearby
          </span>
          <span className="text-white/20">·</span>
          <span className="text-white/80 text-sm font-medium">
            {events.length} events today
          </span>
          <span className="text-white/20 hidden sm:inline">·</span>
          <span className="text-blue-400 text-xs font-medium truncate hidden sm:inline">
            {online > 0 ? `${online} online now` : "scanning your area"}
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="text-white/50 text-xs">{online} people active right now</span>
              </div>
              {events.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  <span className="text-white/50 text-xs truncate">{e.title}</span>
                </div>
              ))}
              {nearbyUsers.length === 0 && events.length === 0 && (
                <p className="text-white/30 text-xs">No signals detected nearby yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}