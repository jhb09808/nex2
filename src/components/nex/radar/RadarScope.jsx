import React, { useMemo } from "react";

const TIER_COLORS = {
  free: { bg: "rgba(255,255,255,0.15)", ring: "rgba(255,255,255,0.25)", glow: "rgba(255,255,255,0.08)" },
  plus: { bg: "#3B82F6", ring: "rgba(96,165,250,0.5)", glow: "rgba(59,130,246,0.2)" },
  pro: { bg: "#F59E0B", ring: "rgba(251,191,36,0.5)", glow: "rgba(245,158,11,0.2)" },
  platinum: { bg: "#22D3EE", ring: "rgba(34,211,238,0.5)", glow: "rgba(34,211,238,0.2)" },
};

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
        const fraction = Math.min(dist / radius, 0.95);
        const r = fraction * 44;
        return { ...m, x: 50 + Math.sin(angle) * r, y: 50 - Math.cos(angle) * r };
      }
      const [uLat, uLng] = getUserLatLng(m.user);
      const dist = distanceMiles(center.lat, center.lng, uLat, uLng);
      const angle = Math.atan2(uLng - center.lng, uLat - center.lat);
      const fraction = Math.min(dist / radius, 0.95);
      const r = fraction * 44;
      // Privacy: deterministic jitter so exact position is obscured
      const hash = hashStr(m.user.id || "x");
      const jx = ((hash % 100) / 100 - 0.5) * 5;
      const jy = (((hash * 31) % 100) / 100 - 0.5) * 5;
      return {
        ...m,
        x: Math.max(6, Math.min(94, 50 + Math.sin(angle) * r + jx)),
        y: Math.max(6, Math.min(94, 50 - Math.cos(angle) * r + jy)),
      };
    });
  }, [markers, center, radius, getUserLatLng, distanceMiles]);

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div
      className="absolute inset-0 z-0 flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at center, hsl(220,30%,6%) 0%, hsl(0,0%,2%) 80%)",
        filter: blurred ? "blur(16px) brightness(0.35)" : "none",
        transition: "filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="relative w-full h-full max-w-[560px] max-h-[560px] aspect-square">
        {/* Faint grid */}
        <div
          className="absolute inset-0 rounded-full opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Range rings */}
        {rings.map((s, i) => (
          <div key={i} className="absolute rounded-full border border-blue-500/[0.06]" style={{ inset: `${(1 - s) * 50}%` }} />
        ))}

        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/[0.05]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/[0.05]" />

        {/* Diagonal crosshairs */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100" y2="100" stroke="rgb(59,130,246)" strokeWidth="0.2" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="rgb(59,130,246)" strokeWidth="0.2" />
        </svg>

        {/* Rotating sweep */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.06) 30deg, rgba(59,130,246,0.12) 55deg, transparent 90deg)",
            animation: "radar-sweep 4s linear infinite",
          }}
        />

        {/* Cardinal markers */}
        {["N", "E", "S", "W"].map((dir, i) => {
          const angle = i * 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + Math.sin(rad) * 48;
          const y = 50 - Math.cos(rad) * 48;
          return (
            <span key={dir} className="absolute text-[9px] font-mono text-blue-500/25 font-bold" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
              {dir}
            </span>
          );
        })}

        {/* Range labels */}
        {rings.map((s, i) => {
          if (i === 0) return null;
          const inset = (1 - s) * 50;
          const dist = (radius * s).toFixed(radius < 1 ? 2 : 1);
          return (
            <span key={i} className="absolute left-1/2 -translate-x-1/2 text-[8px] font-mono text-blue-500/20" style={{ top: `${inset}%`, marginTop: "-5px" }}>
              {dist}mi
            </span>
          );
        })}

        {/* Center (you) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-[-12px] rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-[-6px] rounded-full bg-blue-500/20" />
            <div className="relative w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" style={{ boxShadow: "0 0 16px rgba(59,130,246,0.7)" }} />
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
  const plan = user.plan || "free";
  const tier = TIER_COLORS[plan] || TIER_COLORS.free;
  const isOnline = user.is_online;
  const isVerified = user.is_verified;
  const isPlatinum = plan === "platinum";
  const showPhoto = isPlatinum && user.show_profile_photo && user.profile_photo;
  const initial = (user.username || "?").charAt(0).toUpperCase();

  return (
    <button onClick={() => onUserClick(user)} className="active:scale-90 transition-transform">
      {isAnonymous ? (
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-1.5 rounded-full border border-blue-400/20" />
          <div className="relative w-1.5 h-1.5 rounded-full bg-blue-400/50" />
        </div>
      ) : (
        <div className="relative">
          {isVerified && <div className="absolute inset-[-4px] rounded-full bg-amber-400/20 blur-md" />}
          {isOnline && !isVerified && <div className="absolute inset-[-4px] rounded-full bg-blue-500/15 blur-md animate-pulse" />}
          <div
            className="relative w-7 h-7 rounded-full flex items-center justify-center overflow-hidden border-2"
            style={{
              borderColor: isVerified ? "rgba(250,204,21,0.6)" : tier.ring,
              background: showPhoto ? undefined : tier.bg,
              boxShadow: `0 0 8px ${tier.glow}`,
            }}
          >
            {showPhoto ? (
              <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : user.visibility === "first_name" ? (
              <span className="text-[11px] font-bold text-white/90">{initial}</span>
            ) : null}
          </div>
          {user.is_premium && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 border border-black/80" />
          )}
        </div>
      )}
    </button>
  );
}