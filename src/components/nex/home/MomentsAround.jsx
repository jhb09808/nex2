import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import moment from "moment";

const MOCK_MOMENTS = [
  { user: "Maya", action: "checked in at", place: "Blue Bottle Coffee", time: "2m", color: "bg-blue-400" },
  { user: "Liam", action: "shared a moment from", place: "Riverside Park", time: "8m", color: "bg-violet-400" },
  { user: "Sofia", action: "is hosting", place: "Tech Meetup · The Hub", time: "15m", color: "bg-amber-400" },
  { user: "Noah", action: "just joined", place: "AI Builders NYC", time: "23m", color: "bg-emerald-400" },
];

export default function MomentsAround({ events = [] }) {
  const moments = events.length > 0
    ? events.slice(0, 4).map((e, i) => ({
        user: "Someone",
        action: "is at",
        place: e.title,
        time: moment(e.date).fromNow(),
        color: ["bg-blue-400", "bg-violet-400", "bg-amber-400", "bg-emerald-400"][i % 4],
      }))
    : MOCK_MOMENTS;

  return (
    <div className="relative pl-4">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/20 via-white/5 to-transparent" />

      <div className="space-y-4">
        {moments.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative flex items-start gap-3"
          >
            {/* Dot */}
            <div className="relative z-10 mt-1.5">
              <div className={`w-3.5 h-3.5 rounded-full ${m.color} ring-4 ring-[hsl(0,0%,4%)]`} />
              {i === 0 && <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping" style={{ animationDuration: "2s" }} />}
            </div>
            {/* Content */}
            <div className="flex-1 neon-card rounded-2xl p-3 -mt-0.5">
              <p className="text-white/80 text-sm leading-snug">
                <span className="text-white font-semibold">{m.user}</span>{" "}
                <span className="text-white/40">{m.action}</span>{" "}
                <span className="text-blue-400 font-medium">{m.place}</span>
              </p>
              <p className="text-white/20 text-[10px] font-mono mt-1">{m.time} ago</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}