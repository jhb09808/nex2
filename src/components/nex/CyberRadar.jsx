import React from "react";
import { motion } from "framer-motion";

const BLIPS = [
  { angle: 200, dist: 68, color: "#FFA500", delay: 0 },
  { angle: 235, dist: 44, color: "#00BFFF", delay: 0.4 },
  { angle: 260, dist: 72, color: "#0047AB", delay: 0.8 },
  { angle: 10, dist: 64, color: "#00FF00", delay: 1.2 },
  { angle: 55, dist: 76, color: "#FFA500", delay: 1.6 },
  { angle: 95, dist: 52, color: "#8A2BE2", delay: 2.0 },
];

export default function CyberRadar() {
  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
        style={{ background: "radial-gradient(circle, rgba(0,71,171,0.4), transparent 70%)" }}
      />

      {/* Concentric rings */}
      <div className="absolute inset-0 rounded-full border border-blue-500/15" />
      <div className="absolute inset-[15%] rounded-full border border-blue-500/20" />
      <div className="absolute inset-[33%] rounded-full border border-blue-500/25" />

      {/* Crosshair */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/10" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/10" />

      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"
        style={{ boxShadow: "0 0 8px rgba(0,212,255,0.8)" }}
      />

      {/* Sweep */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(0,71,171,0.1) 20deg, rgba(0,71,171,0.25) 45deg, transparent 60deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Colored blips */}
      {BLIPS.map((blip, i) => {
        const rad = (blip.angle * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * (blip.dist / 2);
        const y = 50 + Math.sin(rad) * (blip.dist / 2);
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              backgroundColor: blip.color,
              boxShadow: `0 0 8px ${blip.color}, 0 0 16px ${blip.color}80`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.15, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: blip.delay, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}