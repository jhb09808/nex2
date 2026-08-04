import React from "react";

/**
 * Futuristic animated background for the Company page.
 * - Subtle perspective grid floor
 * - Drifting holographic orbs
 * - Scanline overlay
 */
export default function CompanyBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #050a14 0%, #000000 70%)",
        }}
      />

      {/* Animated grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[60vh]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)",
          transform: "perspective(400px) rotateX(60deg) translateY(20%) scale(2.5)",
          transformOrigin: "center bottom",
        }}
      />

      {/* Holographic orbs */}
      <div
        className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{
          background: "rgba(59,130,246,0.12)",
          animation: "nex-ambient-breathe 10s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{
          background: "rgba(139,92,246,0.08)",
          animation: "nex-ambient-breathe 12s ease-in-out 2s infinite",
        }}
      />
      <div
        className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full blur-[90px]"
        style={{
          background: "rgba(34,211,238,0.06)",
          animation: "nex-ambient-breathe 14s ease-in-out 4s infinite",
        }}
      />

      {/* Scanline */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(59,130,246,0.015) 4px)",
        }}
      />
    </div>
  );
}