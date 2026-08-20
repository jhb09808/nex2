import React, { useMemo, useRef, useEffect, useState } from "react";
import { getRadarSweepColor, RADAR_SWEEP_COLORS } from "@/hooks/useRadarSweepColor";
import { getCategoryForSubInterest } from "@/components/nex/radar/interestCategories";
import radarMap from "@/assets/radar-map.webp";
import useIsDesktop from "@/hooks/useIsDesktop";

const PALETTE = {
  bg: "#000000",
  grid: "rgba(110, 190, 255, 0.13)",
  gridBright: "rgba(110, 190, 255, 0.22)",
  green: "#39FF6A",
  blue: "#60A5FA",
  orange: "#FF9A2E",
  purple: "#B463FF",
  white: "#ffffff",
  cyan: "#3B82F6",
};

const CATEGORY_COLORS = {
  food: PALETTE.orange,
  fitness: PALETTE.orange,
  music: PALETTE.purple,
  nightlife: PALETTE.purple,
  sports: PALETTE.green,
  art: PALETTE.purple,
  fashion: PALETTE.orange,
  "movies-tv": PALETTE.purple,
  gaming: PALETTE.green,
  technology: PALETTE.blue,
  business: PALETTE.blue,
  travel: PALETTE.blue,
  outdoors: PALETTE.green,
  wellness: PALETTE.green,
  education: PALETTE.blue,
  culture: PALETTE.purple,
  "social-activities": PALETTE.blue,
  pets: PALETTE.green,
  "cars-motorsports": PALETTE.orange,
  "dating-relationships": PALETTE.purple,
};

const DEFAULT_BLIP_COLOR = PALETTE.blue;

const BLIP_PALETTE = RADAR_SWEEP_COLORS.map((c) => c.value);

function getBlipColor(user) {
  const interests = user.interests || [];
  for (const interest of interests) {
    const cat = getCategoryForSubInterest(interest);
    if (cat && CATEGORY_COLORS[cat.id]) return CATEGORY_COLORS[cat.id];
  }
  return DEFAULT_BLIP_COLOR;
}

function getBlipColorByHash(user) {
  const id = user.id || user.created_by_id || "x";
  return BLIP_PALETTE[hashStr(id) % BLIP_PALETTE.length];
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
  bestMatchId,
  // Desktop composes its own full-shell background, so it asks for the scope
  // without the built-in photo/scrims and sizes the disc itself. Both default
  // to the phone behaviour.
  bare = false,
  discSize,
}) {
  const isDesktop = useIsDesktop();
  // A caller can size the disc itself (the desktop radar does); otherwise the
  // phone default, widened on large screens.
  const disc = discSize || (isDesktop ? "min(70vw, 76dvh)" : "min(340px, 78vw)");
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
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
        const scanDelay = (angleDeg / 360) * 5;
        const fraction = Math.min(dist / visibleRadius, 0.92);
        const r = fraction * 44;
        raw.push({ ...m, scanDelay, x: 50 + Math.sin(angle) * r, y: 50 - Math.cos(angle) * r });
      } else {
        const [uLat, uLng] = getUserLatLng(m.user);
        const dist = distanceMiles(center.lat, center.lng, uLat, uLng);
        if (dist > visibleRadius) continue;
        const angle = Math.atan2(uLng - center.lng, uLat - center.lat);
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
        const scanDelay = (angleDeg / 360) * 5;
        const fraction = Math.min(dist / visibleRadius, 0.92);
        const r = fraction * 44;
        const hash = hashStr(m.user.id || "x");
        const jx = ((hash % 100) / 100 - 0.5) * 4;
        const jy = (((hash * 31) % 100) / 100 - 0.5) * 4;
        const pulseDelay = (hash % 40) / 10;
        raw.push({
          ...m,
          pulseDelay,
          scanDelay,
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
    // Assign varied colors by index — each blip cycles through the sweep palette
    raw.forEach((b, i) => {
      if (b.type !== "cluster") {
        b.color = BLIP_PALETTE[i % BLIP_PALETTE.length];
      }
    });
    return raw;
  }, [markers, center, visibleRadius, getUserLatLng, distanceMiles]);

  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 1 + Math.random() * 1.5,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 18,
      dx: (Math.random() - 0.5) * 40,
      dy: -20 - Math.random() * 40,
    }));
  }, []);

  const rings = [0.25, 0.5, 0.75, 1];
  const spokes = Array.from({ length: 8 }, (_, i) => i * 45);

  const scopeRef = useRef(null);
  const pinchRef = useRef(null);

  // Tilt. Only the tilt wrapper below is transformed — never the background
  // or the corner lights.
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [needsPerm, setNeedsPerm] = useState(
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  );
  // Tilt is a phone-only effect: it follows the device's gyroscope, and there
  // is no desktop equivalent worth faking.
  const tiltEnabled = !isDesktop;

  // iOS 13+ fires nothing until this runs, and it must come from a real
  // gesture — never from mount or an effect.
  const enableTilt = async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === "granted") setNeedsPerm(false);
    } catch (e) { /* denied or unsupported */ }
  };

  useEffect(() => {
    if (needsPerm || !tiltEnabled) return;
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const onOrient = (e) => {
      // gamma = left/right tilt, beta = front/back tilt
      setTilt({
        x: clamp((e.gamma || 0) / 35),
        y: clamp(((e.beta || 0) - 40) / 35),
      });
    };
    window.addEventListener("deviceorientation", onOrient, true);
    return () => window.removeEventListener("deviceorientation", onOrient, true);
  }, [needsPerm, tiltEnabled]);

  const lightOpacity = (sx, sy) =>
    (0.10 + Math.max(0, sx * tilt.x) * 0.46 + Math.max(0, sy * tilt.y) * 0.46).toFixed(3);

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
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        background: bare ? "transparent" : "radial-gradient(circle at center, #01060e 0%, #000000 80%)",
        filter: blurred ? "blur(16px) brightness(0.35)" : "none",
        transition: "filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        touchAction: "none",
        perspective: "1100px",
      }}
    >
      {/* ── Layer 0: background. Never transformed. ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        {/* City map from the design, with its two scrims */}
        {!bare && (
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <img src={radarMap} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(62% 34% at 50% 47%, rgba(1,6,14,.96) 0%, rgba(1,6,14,.80) 52%, rgba(1,6,14,.34) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(1,6,14,.86) 0%, rgba(1,6,14,.42) 24%, rgba(1,6,14,.46) 70%, rgba(1,5,12,.94) 100%)" }} />
          </div>
        )}
      {/* Atmospheric ambient haze */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${sweepColor}0A 0%, transparent 60%)`,
          animation: "nex-ambient-breathe 8s ease-in-out infinite",
        }}
      />

      {/* Center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${sweepColor}0D 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "rgba(59,130,246,0.4)",
            boxShadow: "0 0 4px rgba(59,130,246,0.3)",
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            animation: `nex-particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      </div>

      {/* ── Layer 1: corner lights. Never transformed. Part of the tilt rig —
           without tilt they just sit at their base opacity, so they go too. ── */}
      {tiltEnabled && (
      <div aria-hidden="true" className="pointer-events-none" style={{ position: "absolute", inset: "-12%", zIndex: 1, mixBlendMode: "screen" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 8% 4%, rgba(90,190,255,.85), rgba(90,190,255,0) 70%)", opacity: lightOpacity(-1, -1), transition: "opacity .16s ease-out" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 92% 4%, rgba(169,140,255,.85), rgba(169,140,255,0) 70%)", opacity: lightOpacity(1, -1), transition: "opacity .16s ease-out" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 8% 96%, rgba(77,255,176,.75), rgba(77,255,176,0) 70%)", opacity: lightOpacity(-1, 1), transition: "opacity .16s ease-out" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 92% 96%, rgba(255,180,84,.72), rgba(255,180,84,0) 70%)", opacity: lightOpacity(1, 1), transition: "opacity .16s ease-out" }} />
      </div>
      )}

      {/* ── Layer 2: the ONLY element that receives the tilt transform ── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          zIndex: 2,
          transform: tiltEnabled
            ? `rotateX(${(-tilt.y * 9).toFixed(2)}deg) rotateY(${(tilt.x * 9).toFixed(2)}deg)`
            : "none",
          transformStyle: "preserve-3d",
          transition: "transform .12s linear",
        }}
      >
        {/* HUD frame — tilts with the radar */}
        {!bare && (
          <>
          <div aria-hidden="true" className="pointer-events-none" style={{ position: "absolute", inset: 8, border: "1px solid rgba(86,180,255,.10)", zIndex: 5 }} />
          <div aria-hidden="true" className="pointer-events-none" style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
          <div aria-hidden="true" className="pointer-events-none" style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
          <div aria-hidden="true" className="pointer-events-none" style={{ position: "absolute", bottom: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
          <div aria-hidden="true" className="pointer-events-none" style={{ position: "absolute", bottom: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
          </>
        )}

      {/* Radar scope circle — 15% larger, shifted up */}
      <div className="relative aspect-square" style={{ transform: bare ? "none" : "translateY(-3%)", width: disc, margin: "auto", maxHeight: "100%" }}>
        {/* Scope background with glass depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center, rgba(2,8,18,0.9) 0%, #000000 100%)`,
            boxShadow: `inset 0 0 60px ${sweepColor}08, inset 0 0 120px rgba(0,0,0,0.5)`,
          }}
        />

        {/* Glass inner sheen */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.015) 0%, transparent 50%)`,
          }}
        />

        {/* Concentric range rings */}
        {rings.map((s, i) => {
          // innermost → outermost, the outer edge reads strongest
          const alpha = [0.14, 0.16, 0.19, 0.26][i] ?? 0.14;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                inset: `${(1 - s) * 50}%`,
                border: `1px solid rgba(110, 190, 255, ${alpha})`,
                boxShadow: i === rings.length - 1 ? "0 0 18px rgba(60,150,255,.14)" : "none",
              }}
            />
          );
        })}

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
                strokeWidth="0.12"
                opacity="0.6"
              />
            );
          })}
        </svg>

        {/* Radar trail — smooth ease-out fade, most brightness compressed near leading edge */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg,
              ${sweepColor}00 0deg,
              ${sweepColor}00 280deg,
              ${sweepColor}02 310deg,
              ${sweepColor}06 332deg,
              ${sweepColor}10 345deg,
              ${sweepColor}22 354deg,
              ${sweepColor}44 358deg,
              ${sweepColor}88 360deg
            )`,
            animation: "nex-sweep-rotate 5s linear infinite",
            maskImage: "radial-gradient(circle, white 99%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle, white 99%, transparent 100%)",
          }}
        />

        {/* Glowing beam — real light bloom at the leading edge */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
          style={{
            animation: "nex-sweep-rotate 5s linear infinite",
            maskImage: "radial-gradient(circle, white 99%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle, white 99%, transparent 100%)",
          }}
        >
          {/* Soft wide glow */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: '50%',
              width: '10px',
              height: '50%',
              marginLeft: '-5px',
              background: `linear-gradient(to top, ${sweepColor}00 0%, ${sweepColor}22 40%, ${sweepColor}44 100%)`,
              filter: 'blur(6px)',
            }}
          />
          {/* Bright core beam */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: '50%',
              width: '2px',
              height: '50%',
              marginLeft: '-1px',
              background: `linear-gradient(to top, ${sweepColor}44 0%, ${sweepColor}FF 60%, ${sweepColor}DD 100%)`,
              boxShadow: `0 0 6px ${sweepColor}, 0 0 14px ${sweepColor}AA, 0 0 28px ${sweepColor}55`,
              borderRadius: '1px',
            }}
          />
        </div>

        {/* Center marker — sharp core with pulsing ring, adapts to sweep color */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-6 h-6 rounded-full border" style={{ borderColor: `${sweepColor}40`, animation: "nex-center-pulse 2.5s ease-out infinite" }} />
            <div className="absolute w-6 h-6 rounded-full border" style={{ borderColor: `${sweepColor}40`, animation: "nex-center-pulse 2.5s ease-out 1.25s infinite" }} />
            <div className="absolute w-4 h-4 rounded-full blur-md" style={{ background: `${sweepColor}26` }} />
            <div className="relative w-1.5 h-1.5 rounded-full" style={{ background: sweepColor, boxShadow: `0 0 6px ${sweepColor}, 0 0 14px ${sweepColor}, 0 0 24px ${sweepColor}40` }} />
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
              <button
                onClick={() => onClusterClick(blip.key)}
                aria-label={`Expand ${blip.count} nearby people`}
                className="active:scale-90 transition-transform"
                style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: PALETTE.blue, opacity: 0.1 }} />
                  <div className="relative w-6 h-6 rounded-full border border-blue-400/20 flex items-center justify-center text-white text-[10px] font-cyber font-bold" style={{ background: `${PALETTE.blue}22`, boxShadow: `0 0 8px ${PALETTE.blue}44` }}>
                    {blip.count}
                  </div>
                </div>
              </button>
            ) : (
              <Blip blip={blip} onUserClick={onUserClick} isBestMatch={blip.user.id === bestMatchId} />
            )}
          </div>
        ))}
      </div>
      </div>

      {needsPerm && tiltEnabled && (
        <button
          onClick={enableTilt}
          style={{ position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 3, height: 38, padding: "0 14px", border: "1px solid rgba(105,190,255,.4)", borderRadius: 999, background: "rgba(8,26,54,.8)", backdropFilter: "blur(10px)", color: "#bfe2ff", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Enable tilt
        </button>
      )}
    </div>
  );
}

function Blip({ blip, onUserClick, isBestMatch }) {
  const color = blip.color || DEFAULT_BLIP_COLOR;

  return (
    <button
      onClick={() => onUserClick(blip.user, color)}
      aria-label="View profile"
      className="active:scale-90 transition-transform"
      style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Best match pulsing ring — always visible */}
        {isBestMatch && (
          <div className="absolute w-5 h-5 rounded-full border border-blue-300/30" style={{ animation: "nex-best-pulse 2s ease-in-out infinite" }} />
        )}
        {/* Scan-synced blip — dims between sweeps, flashes when beam passes */}
        <div
          className="relative flex items-center justify-center"
          style={{
            animation: "nex-blip-scan 5s linear infinite",
            animationDelay: `${blip.scanDelay - 5}s`,
          }}
        >
          {/* Glow halo */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: isBestMatch ? "12px" : "9px",
              height: isBestMatch ? "12px" : "9px",
              background: color,
              filter: `blur(${isBestMatch ? "3px" : "2.5px"})`,
            }}
          />
          {/* Core dot */}
          <div
            className="relative rounded-full"
            style={{
              width: isBestMatch ? "6px" : "5px",
              height: isBestMatch ? "6px" : "5px",
              background: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        </div>
      </div>
    </button>
  );
}