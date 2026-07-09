import React, { useMemo } from "react";

// Interest → blip color mapping (reused from profile card coding)
// green, orange, amber, purple, blue palette
const INTEREST_COLORS = {
  Technology: "#38bdf8",
  Fitness: "#f97316",
  Business: "#38bdf8",
  Cars: "#f97316",
  Nightlife: "#a855f7",
  Photography: "#a855f7",
  Travel: "#38bdf8",
  Food: "#fbbf24",
  Creators: "#a855f7",
  Startups: "#38bdf8",
  Sports: "#4ade80",
  Music: "#a855f7",
  Art: "#a855f7",
  Gaming: "#4ade80",
  Fashion: "#fbbf24",
  Movies: "#a855f7",
  Reading: "#4ade80",
  Hiking: "#38bdf8",
  Yoga: "#4ade80",
  Cooking: "#fbbf24",
  Design: "#a855f7",
  Crypto: "#38bdf8",
  Science: "#38bdf8",
  Pets: "#4ade80",
};

const DEFAULT_BLIP_COLOR = "#38bdf8";

function getBlipColor(user) {
  const interests = user.interests || [];
  for (const interest of interests) {
    if (INTEREST_COLORS[interest]) return INTEREST_COLORS[interest];
  }
  return DEFAULT_BLIP_COLOR;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

export default function RadarScope({
  center,
  markers = [],
  effectiveRadius = 0.5,
  getUserLatLng,
  distanceMiles,
  onUserClick,
  onClusterClick,
  blurred = false,
}) {
  const radius = effectiveRadius || 1;

  const blips = useMemo(() => {
    return markers.map((m) => {
      if (m.type === "cluster") {
        const dist = distanceMiles(center.lat, center.lng, m.lat, m.lng);
        const angle = Math.atan2(m.lng - center.lng, m.lat - center.lat);
        const fraction = Math.min(dist / radius, 0.92);
        const r = fraction * 44;
        return { ...m, x: 50 + Math.sin(angle) * r, y: 50 - Math.cos(angle) * r };
      }
      const [uLat, uLng] = getUserLatLng(m.user);
      const dist = distanceMiles(center.lat, center.lng, uLat, uLng);
      const angle = Math.atan2(uLng - center.lng, uLat - center.lat);
      const fraction = Math.min(dist / radius, 0.92);
      const r = fraction * 44;
      // Privacy: deterministic jitter so exact position is obscured
      const hash = hashStr(m.user.id || "x");
      const jx = ((hash % 100) / 100 - 0.5) * 4;
      const jy = (((hash * 31) % 100) / 100 - 0.5) * 4;
      const color = getBlipColor(m.user);
      const pulseDelay = (hash % 40) / 10; // 0–4s staggered pulse
      return {
        ...m,
        color,
        pulseDelay,
        x: Math.max(8, Math.min(92, 50 + Math.sin(angle) * r + jx)),
        y: Math.max(8, Math.min(92, 50 - Math.cos(angle) * r + jy)),
      };
    });
  }, [markers, center, radius, getUserLatLng, distanceMiles]);

  const rings = [0.25, 0.5, 0.75, 1];
  const spokes = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <div
      className="absolute inset-0 z-0 flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at center, hsl(210,20%,5%) 0%, hsl(0,0%,2%) 75%)",
        filter: blurred ? "blur(16px) brightness(0.35)" : "none",
        transition: "filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="relative w-full h-full max-w-[560px] max-h-[560px] aspect-square">
        {/* Scope circle background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at center, hsl(200,30%,3%) 0%, hsl(0,0%,0%) 100%)" }}
        />

        {/* Concentric range rings — perfect circles, evenly spaced, teal */}
        {rings.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ inset: `${(1 - s) * 50}%`, border: "1px solid hsl(187, 39%, 27%)" }}
          />
        ))}

        {/* Radial spokes — 8 lines from center, faint teal */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {spokes.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x2 = 50 + Math.sin(rad) * 50;
            const y2 = 50 - Math.cos(rad) * 50;
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={x2}
                y2={y2}
                stroke="hsl(187, 39%, 27%)"
                strokeWidth="0.15"
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Rotating sweep with fading afterglow trail */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, hsla(187, 60%, 45%, 0.02) 280deg, hsla(187, 60%, 45%, 0.06) 320deg, hsla(187, 70%, 55%, 0.14) 350deg, hsla(187, 80%, 60%, 0.22) 360deg, transparent 360deg)",
            animation: "radar-sweep 4.5s linear infinite",
            maskImage: "radial-gradient(circle, white 49%, transparent 50%)",
            WebkitMaskImage: "radial-gradient(circle, white 49%, transparent 50%)",
          }}
        />

        {/* Bright leading edge of sweep */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 358deg, hsla(187, 90%, 65%, 0.35) 360deg, transparent 360deg)",
            animation: "radar-sweep 4.5s linear infinite",
            maskImage: "radial-gradient(circle, white 49%, transparent 50%)",
            WebkitMaskImage: "radial-gradient(circle, white 49%, transparent 50%)",
          }}
        />

        {/* Center user marker — fixed dot with thin ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-5 h-5 rounded-full border border-white/30" />
            <div className="absolute w-5 h-5 rounded-full bg-white/5 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative w-2 h-2 rounded-full bg-white" style={{ boxShadow: "0 0 10px rgba(255,255,255,0.8)" }} />
          </div>
        </div>

        {/* Contact blips — glowing, colored by interest, staggered pulse */}
        {blips.map((blip, idx) => (
          <div
            key={blip.type === "cluster" ? `cluster-${blip.key}-${idx}` : blip.user.id}
            className="absolute z-10"
            style={{ left: `${blip.x}%`, top: `${blip.y}%`, transform: "translate(-50%, -50%)" }}
          >
            {blip.type === "cluster" ? (
              <button onClick={() => onClusterClick(blip.key)} className="active:scale-90 transition-transform">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-pulse" />
                  <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border border-white/20 flex items-center justify-center text-white text-xs font-bold" style={{ boxShadow: "0 0 10px rgba(59,130,246,0.4)" }}>
                    {blip.count}
                  </div>
                </div>
              </button>
            ) : (
              <Blip blip={blip} onUserClick={onUserClick} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Blip({ blip, onUserClick }) {
  const user = blip.user;
  const isAnonymous = user.visibility === "anonymous";
  const color = blip.color || DEFAULT_BLIP_COLOR;

  if (isAnonymous) {
    return (
      <button onClick={() => onUserClick(user)} className="active:scale-90 transition-transform">
        <div className="relative w-3 h-3 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: color, opacity: 0.2, animation: `ai-dot-pulse 2.5s ease-in-out ${blip.pulseDelay}s infinite` }}
          />
          <div className="relative w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
      </button>
    );
  }

  return (
    <button onClick={() => onUserClick(user)} className="active:scale-90 transition-transform">
      <div className="relative w-3 h-3 flex items-center justify-center">
        {/* Pulsing glow halo */}
        <div
          className="absolute inset-[-3px] rounded-full"
          style={{ background: color, opacity: 0.15, filter: "blur(4px)", animation: `ai-dot-pulse 2.8s ease-in-out ${blip.pulseDelay}s infinite` }}
        />
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: color, opacity: 0.3, filter: "blur(2px)" }}
        />
        {/* Core dot */}
        <div
          className="relative w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}, 0 0 4px ${color}` }}
        />
      </div>
    </button>
  );
}