import React, { useMemo } from "react";

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CYAN = "#00F2FF";
const MAGENTA = "#A100FF";

// Shape encoding: plan → glass geometry
const PLAN_SHAPES = {
  free: 0, // circle
  plus: 1, // hexagon
  pro: 2, // diamond
  platinum: 3, // rounded square
};

// Refraction encoding: interest category → internal line pattern
const INTEREST_PATTERNS = {
  grid: ["Technology", "Business", "Crypto", "Startups", "Science", "Design"],
  radial: ["Fitness", "Sports", "Hiking", "Yoga", "Cars"],
  wave: ["Music", "Art", "Photography", "Movies", "Fashion", "Reading"],
  scatter: ["Food", "Cooking", "Travel", "Nightlife", "Pets", "Creators", "Gaming"],
};

function getPatternType(interests) {
  if (!interests?.length) return "scatter";
  const top = interests[0];
  for (const [pattern, list] of Object.entries(INTEREST_PATTERNS)) {
    if (list.includes(top)) return pattern;
  }
  return "scatter";
}

/**
 * Cybernetic glassmorphism avatar — data-encoded:
 * - plan → glass shape (circle/hexagon/diamond/square)
 * - top interest → internal refraction pattern (grid/radial/wave/scatter)
 * - isVerified → boosted neon glow intensity
 * Deterministic from seed; same seed = same avatar.
 */
export default function GenerativeAvatar({ seed = "default", plan, interests, isVerified, className = "" }) {
  const p = useMemo(() => {
    const hash = hashString(seed);
    const rng = mulberry32(hash);

    const shape = PLAN_SHAPES[plan] ?? Math.floor(rng() * 4);
    const patternType = getPatternType(interests);
    const glowBoost = isVerified ? 1.5 : 1;

    return {
      hash,
      shape,
      patternType,
      glowBoost,
      cyanX: 12 + rng() * 30,
      cyanY: 10 + rng() * 30,
      cyanR: 28 + rng() * 28,
      cyanO: ((0.2 + rng() * 0.35) * glowBoost).toFixed(2),
      magX: 55 + rng() * 32,
      magY: 52 + rng() * 30,
      magR: 28 + rng() * 28,
      magO: ((0.2 + rng() * 0.35) * glowBoost).toFixed(2),
      glassCx: 42 + rng() * 16,
      glassCy: 42 + rng() * 16,
      glassR: 16 + rng() * 12,
      spec1X: 36 + rng() * 10,
      spec1Y: 30 + rng() * 10,
      spec1R: (2.5 + rng() * 4).toFixed(1),
      spec2X: 54 + rng() * 8,
      spec2Y: 40 + rng() * 8,
      spec2R: (1.2 + rng() * 2).toFixed(1),
    };
  }, [seed, plan, interests, isVerified]);

  const gid = `cg-${p.hash}`;
  const cid = `cg-clip-${p.hash}`;
  const fid = `cg-blur-${p.hash}`;

  const renderGlassShape = (keySuffix) => {
    const { glassCx: cx, glassCy: cy, glassR: r, shape } = p;
    const key = `shape-${keySuffix}`;
    if (shape === 0) return <circle key={key} cx={cx} cy={cy} r={r} />;
    if (shape === 1) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
      }
      return <path key={key} d={`M${pts.join("L")}Z`} />;
    }
    if (shape === 2) {
      return <path key={key} d={`M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy}Z`} />;
    }
    return <rect key={key} x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r * 0.25} />;
  };

  // Refraction lines — encoded by top interest
  const refractionLines = useMemo(() => {
    const { glassCx: cx, glassCy: cy, glassR: r, patternType } = p;
    const lines = [];

    if (patternType === "grid") {
      // Straight intersecting lines
      for (let i = -2; i <= 2; i++) {
        const off = i * r * 0.35;
        lines.push({ x1: cx - r, y1: cy + off, x2: cx + r, y2: cy + off, o: 0.15 });
        lines.push({ x1: cx + off, y1: cy - r, x2: cx + off, y2: cy + r, o: 0.15 });
      }
    } else if (patternType === "radial") {
      // Lines radiating from center
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        lines.push({
          x1: cx, y1: cy,
          x2: cx + r * Math.cos(a), y2: cy + r * Math.sin(a),
          o: 0.12,
        });
      }
    } else if (patternType === "wave") {
      // Curved wavy lines
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * r * 0.4;
        const pts = [];
        for (let j = 0; j <= 20; j++) {
          const t = j / 20;
          const x = cx - r + t * r * 2;
          const y = cy + off + Math.sin(t * Math.PI * 3) * r * 0.2;
          pts.push(`${j === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        lines.push({ d: pts.join(" "), o: 0.15 });
      }
    } else {
      // Scatter — short random segments
      const rng2 = mulberry32(p.hash + 99);
      for (let i = 0; i < 6; i++) {
        const a1 = rng2() * Math.PI * 2;
        const a2 = a1 + 0.3 + rng2() * 0.5;
        const rr = r * (0.3 + rng2() * 0.6);
        lines.push({
          x1: cx + rr * Math.cos(a1), y1: cy + rr * Math.sin(a1),
          x2: cx + rr * Math.cos(a2), y2: cy + rr * Math.sin(a2),
          o: 0.12,
        });
      }
    }
    return lines;
  }, [p]);

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full block ${className}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id={cid}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <radialGradient id={`${gid}-cyan`}>
          <stop offset="0%" stopColor={CYAN} stopOpacity={p.cyanO} />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-mag`}>
          <stop offset="0%" stopColor={MAGENTA} stopOpacity={p.magO} />
          <stop offset="100%" stopColor={MAGENTA} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-border`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="100%" stopColor={MAGENTA} />
        </linearGradient>
        <clipPath id={`${cid}-glass`}>
          {renderGlassShape("clip")}
        </clipPath>
        <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      <rect width="100" height="100" fill="#0B0D16" />

      <g clipPath={`url(#${cid})`}>
        {/* Neon glow orbs */}
        <circle cx={p.cyanX} cy={p.cyanY} r={p.cyanR} fill={`url(#${gid}-cyan)`} />
        <circle cx={p.magX} cy={p.magY} r={p.magR} fill={`url(#${gid}-mag)`} />

        {/* Frosted glass glow — blurred */}
        <g filter={`url(#${fid})`} fill={CYAN} opacity="0.12">
          {renderGlassShape("glow")}
        </g>

        {/* Frosted glass fill */}
        <g fill="white" opacity="0.04">
          {renderGlassShape("fill")}
        </g>

        {/* Refraction lines — clipped to glass shape */}
        <g clipPath={`url(#${gid}-glass)`} stroke="white" strokeWidth="0.3">
          {refractionLines.map((l, i) =>
            l.d ? (
              <path key={i} d={l.d} fill="none" opacity={l.o} />
            ) : (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} opacity={l.o} />
            )
          )}
        </g>

        {/* Glass border — neon gradient */}
        <g fill="none" stroke={`url(#${gid}-border)`} strokeWidth="0.9" opacity={0.55 * p.glowBoost}>
          {renderGlassShape("stroke")}
        </g>

        {/* Inner edge highlight */}
        <g fill="none" stroke="white" strokeWidth="0.3" opacity="0.15">
          {renderGlassShape("inner")}
        </g>

        {/* Specular highlights */}
        <ellipse cx={p.spec1X} cy={p.spec1Y} rx={p.spec1R} ry={p.spec1R * 0.6} fill="white" opacity="0.18" filter={`url(#${fid})`} />
        <ellipse cx={p.spec2X} cy={p.spec2Y} rx={p.spec2R} ry={p.spec2R * 0.6} fill="white" opacity="0.12" filter={`url(#${fid})`} />
      </g>

      {/* Neon border ring */}
      <circle cx="50" cy="50" r="49" fill="none" stroke={`url(#${gid}-border)`} strokeWidth="0.8" opacity={0.35 * p.glowBoost} />
    </svg>
  );
}