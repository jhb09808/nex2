import React, { useMemo, useRef, useEffect, useState } from "react";
import { getRadarSweepColor } from "@/hooks/useRadarSweepColor";

// Exact palette from the design spec
const PALETTE = {
  bg: "#05080a",
  grid: "#0b2024",
  green: "#2ecc71",
  blue: "#3498db",
  orange: "#e67e22",
  purple: "#9b59b6",
  white: "#ffffff",
};

const INTEREST_COLORS = {
  Technology: PALETTE.blue,
  Fitness: PALETTE.orange,
  Business: PALETTE.blue,
  Cars: PALETTE.orange,
  Nightlife: PALETTE.purple,
  Photography: PALETTE.purple,
  Travel: PALETTE.blue,
  Food: PALETTE.orange,
  Creators: PALETTE.purple,
  Startups: PALETTE.blue,
  Sports: PALETTE.green,
  Music: PALETTE.purple,
  Art: PALETTE.purple,
  Gaming: PALETTE.green,
  Fashion: PALETTE.orange,
  Movies: PALETTE.purple,
  Reading: PALETTE.green,
  Hiking: PALETTE.green,
  Yoga: PALETTE.green,
  Cooking: PALETTE.orange,
  Design: PALETTE.purple,
  Crypto: PALETTE.blue,
  Science: PALETTE.blue,
  Pets: PALETTE.green,
};

const DEFAULT_BLIP_COLOR = PALETTE.blue;

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
  zoom = 1,
  onZoomChange,
}) {
  const baseRadius = effectiveRadius || 1;
  const visibleRadius = baseRadius / zoom;
  const [sweepColor, setSweepColor] = useState(getRadarSweepColor);

  useEffect(() => {
    const handler = (e) => setSweepColor(e.detail || getRadarSweepColor());
    window.addEventListener("nex-radar-color-change", handler);
    return () => window.removeEventListener("nex-radar-color-change", handler);
  }, []);

  const blips = useMemo(() => {
    const raw = [];
    for (const m of markers) {
      if (m.type === "cluster") {
        const dist = distanceMiles(center.lat, center.lng, m.lat, m.lng);
        if (dist > visibleRadius) continue;
        const angle = Math.atan2(m.lng - center.lng, m.lat - center.lat);
        const fraction = Math.min(dist / visibleRadius, 0.92);
        const r = fraction * 44;
        raw.push({ ...m, x: 50 + Math.sin(angle) * r, y: 50 - Math.cos(angle) * r });
      } else {
        const [uLat, uLng] = getUserLatLng(m.user);
        const dist = distanceMiles(center.lat, center.lng, uLat, uLng);
        if (dist > visibleRadius) continue;
        const angle = Math.atan2(uLng - center.lng, uLat - center.lat);
        const fraction = Math.min(dist / visibleRadius, 0.92);
        const r = fraction * 44;
        const hash = hashStr(m.user.id || "x");
        const jx = ((hash % 100) / 100 - 0.5) * 4;
        const jy = (((hash * 31) % 100) / 100 - 0.5) * 4;
        const color = getBlipColor(m.user);
        const pulseDelay = (hash % 40) / 10;
        raw.push({
          ...m,
          color,
          pulseDelay,
          x: Math.max(8, Math.min(92, 50 + Math.sin(angle) * r + jx)),
          y: Math.max(8, Math.min(92, 50 - Math.cos(angle) * r + jy)),
        });
      }
    }

    const MIN_DIST = 5;
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 0; i < raw.length; i++) {
        for (let j = i + 1; j < raw.length; j++) {
          const dx = raw[j].x - raw[i].x;
          const dy = raw[j].y - raw[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MIN_DIST && d > 0.01) {
            const push = (MIN_DIST - d) / 2;
            const ux = dx / d;
            const uy = dy / d;
            raw[i].x = Math.max(6, Math.min(94, raw[i].x - ux * push));
            raw[i].y = Math.max(6, Math.min(94, raw[i].y - uy * push));
            raw[j].x = Math.max(6, Math.min(94, raw[j].x + ux * push));
            raw[j].y = Math.max(6, Math.min(94, raw[j].y + uy * push));
          }
        }
      }
    }
    return raw;
  }, [markers, center, visibleRadius, getUserLatLng, distanceMiles]);

  const rings = [0.25, 0.5, 0.75, 1];
  const spokes = Array.from({ length: 8 }, (_, i) => i * 45);

  const scopeRef = useRef(null);
  const pinchRef = useRef(null);

  const onScopeTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { startDist: Math.hypot(dx, dy), startZoom: zoom };
    }
  };

  const onScopeTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current && onZoomChange) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchRef.current.startDist;
      const newZoom = Math.max(1, Math.min(5, pinchRef.current.startZoom * ratio));
      onZoomChange(Math.round(newZoom * 10) / 10);
    }
  };

  const onScopeTouchEnd = (e) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  const onWheel = (e) => {
    if (!onZoomChange) return;
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    onZoomChange((z) => Math.max(1, Math.min(5, Math.round((z + delta) * 10) / 10)));
  };

  useEffect(() => {
    const el = scopeRef.current;
    if (!el) return;
    el.addEventListener("touchmove", onScopeTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onScopeTouchMove);
  });

  return (
    <div
      ref={scopeRef}
      onTouchStart={onScopeTouchStart}
      onTouchEnd={onScopeTouchEnd}
      onWheel={onWheel}
      className="absolute inset-0 z-0 flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at center, ${PALETTE.bg} 0%, #020405 75%)`,
        filter: blurred ? "blur(16px) brightness(0.35)" : "none",
        transition: "filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        touchAction: "none",
      }}
    >
      {/* Radar scope circle */}
      <div className="relative w-full h-full max-w-[560px] max-h-[560px] aspect-square">
        {/* Scope background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle at center, #060a0c 0%, #020405 100%)` }}
        />

        {/* Concentric range rings */}
        {rings.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ inset: `${(1 - s) * 50}%`, border: `1px solid ${PALETTE.grid}` }}
          />
        ))}

        {/* Radial spokes */}
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
                stroke={PALETTE.grid}
                strokeWidth="0.15"
                opacity="0.8"
              />
            );
          })}
        </svg>

        {/* Sweep wedge — user-selected glowing color */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${sweepColor}00 270deg, ${sweepColor}0D 310deg, ${sweepColor}33 340deg, ${sweepColor}66 356deg, ${sweepColor}FF 360deg, transparent 360deg)`,
            animation: "radar-sweep 5s linear infinite",
            maskImage: "radial-gradient(circle, white 49%, transparent 50%)",
            WebkitMaskImage: "radial-gradient(circle, white 49%, transparent 50%)",
          }}
        />

        {/* Center marker — white dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-4 h-4 rounded-full border border-white/20" />
            <div className="absolute w-4 h-4 rounded-full bg-white/5 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative w-1.5 h-1.5 rounded-full" style={{ background: PALETTE.white, boxShadow: `0 0 8px ${PALETTE.white}` }} />
          </div>
        </div>

        {/* Blips */}
        {blips.map((blip, idx) => (
          <div
            key={blip.type === "cluster" ? `cluster-${blip.key}-${idx}` : blip.user.id}
            className="absolute z-10"
            style={{ left: `${blip.x}%`, top: `${blip.y}%`, transform: "translate(-50%, -50%)" }}
          >
            {blip.type === "cluster" ? (
              <button onClick={() => onClusterClick(blip.key)} className="active:scale-90 transition-transform">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: PALETTE.blue, opacity: 0.12 }} />
                  <div className="relative w-6 h-6 rounded-full border border-white/15 flex items-center justify-center text-white text-[10px] font-bold" style={{ background: `${PALETTE.blue}33`, boxShadow: `0 0 8px ${PALETTE.blue}66` }}>
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

  return (
    <button onClick={() => onUserClick(user)} className="active:scale-90 transition-transform">
      <div className="relative w-2.5 h-2.5 flex items-center justify-center">
        {/* Glow halo */}
        <div
          className="absolute inset-[-2px] rounded-full"
          style={{ background: color, opacity: 0.15, filter: "blur(3px)", animation: `ai-dot-pulse 2.8s ease-in-out ${blip.pulseDelay}s infinite` }}
        />
        {/* Core dot */}
        <div
          className="relative w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}, 0 0 3px ${color}` }}
        />
      </div>
    </button>
  );
}