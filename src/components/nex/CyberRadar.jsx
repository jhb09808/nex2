import React from "react";
import { motion } from "framer-motion";

const NODES = [
  { angle: 30, dist: 55, delay: 0 },
  { angle: 95, dist: 38, delay: 0.4 },
  { angle: 175, dist: 62, delay: 0.8 },
  { angle: 250, dist: 45, delay: 1.2 },
  { angle: 320, dist: 52, delay: 1.6 },
];

export default function CyberRadar() {
  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
        style={{ background: "radial-gradient(circle, rgba(0,122,255,0.4), transparent 70%)" }}
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400"
        style={{ boxShadow: "0 0 10px rgba(0,212,255,0.8)" }}
      />

      {/* Sweep */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(0,212,255,0.1) 20deg, rgba(0,212,255,0.22) 45deg, transparent 60deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Nodes */}
      {NODES.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * (node.dist / 2);
        const y = 50 + Math.sin(rad) * (node.dist / 2);
        return (
          <motion.div
            key={i}
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center"
            style={{ left: `${x}%`, top: `${y}%`, boxShadow: "0 0 8px rgba(0,212,255,0.3)" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
          </motion.div>
        );
      })}
    </div>
  );
}