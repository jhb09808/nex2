import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radar, ArrowUpRight } from "lucide-react";

export default function LiveRadar({ nearbyUsers = [] }) {
  const navigate = useNavigate();
  const online = nearbyUsers.filter((u) => u.is_online).length;
  const dots = nearbyUsers.slice(0, 7);

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate("/map")}
      className="neon-card rounded-[2rem] p-6 relative overflow-hidden cursor-pointer group"
    >
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-violet-600/5" />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-xl gradient-blue flex items-center justify-center">
            <Radar className="w-4 h-4 text-white" />
            <div className="absolute inset-0 rounded-xl gradient-blue opacity-50 animate-ping" style={{ animationDuration: "3s" }} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Live Radar</p>
            <p className="text-blue-400/50 text-[10px] font-mono uppercase tracking-wider">Scanning 5mi radius</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-blue-400 text-xs font-medium">
          Open <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Radar visualization */}
      <div className="relative w-full aspect-square max-w-[200px] mx-auto">
        {/* Concentric rings */}
        {[0.3, 0.55, 0.8, 1].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-blue-500/10" style={{ inset: `${(1 - s) * 50}%` }} />
        ))}
        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/5" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/5" />
        {/* Sweep */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.12) 40deg, transparent 80deg)", animation: "radar-sweep 4s linear infinite" }}
        />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full gradient-blue glow-blue z-10" />
        {/* User dots */}
        {dots.map((user, i) => {
          const angle = (i / dots.length) * Math.PI * 2 + 0.3;
          const radius = 18 + (i % 3) * 12;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          return (
            <div key={user.id} className="absolute z-10" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400">
                {user.is_online && <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping" style={{ animationDuration: "2s" }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="relative flex items-center justify-around mt-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <p className="text-white text-2xl font-bold">{online}</p>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Live now</p>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="text-center">
          <p className="text-white text-2xl font-bold">{nearbyUsers.length}</p>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">In range</p>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="text-center">
          <p className="text-blue-400 text-2xl font-bold">5<span className="text-sm text-white/40">mi</span></p>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Radius</p>
        </div>
      </div>
    </motion.div>
  );
}