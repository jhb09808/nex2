import React, { useMemo } from "react";
import { getCategoryForSubInterest } from "@/components/nex/radar/interestCategories";

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

// Holographic color palettes — seed selects one
const PALETTES = [
  { primary: "#00F2FF", secondary: "#A100FF", accent: "#22D3EE" }, // cyan/magenta
  { primary: "#3B82F6", secondary: "#A855F7", accent: "#60A5FA" }, // blue/violet
  { primary: "#10B981", secondary: "#06B6D4", accent: "#34D399" }, // emerald/cyan
  { primary: "#F59E0B", secondary: "#EF4444", accent: "#FBBF24" }, // amber/red
  { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F472B6" }, // pink/violet
  { primary: "#14B8A6", secondary: "#6366F1", accent: "#2DD4BF" }, // teal/indigo
];

// Shape encoding: plan → clip geometry for the hologram container
const PLAN_SHAPES = {
  free: 0,       // circle
  plus: 1,       // hexagon
  pro: 2,         // diamond
  platinum: 3,   // rounded square
};

// Refraction encoding: interest category → internal particle pattern
const CATEGORY_PATTERNS = {
  technology: "grid",
  business: "grid",
  education: "grid",
  fitness: "radial",
  sports: "radial",
  outdoors: "radial",
  "cars-motorsports": "radial",
  wellness: "radial",
  music: "wave",
  art: "wave",
  fashion: "wave",
  "movies-tv": "wave",
  nightlife: "scatter",
  food: "scatter",
  travel: "scatter",
  "social-activities": "scatter",
  pets: "scatter",
  gaming: "scatter",
  culture: "scatter",
  "dating-relationships": "scatter",
};

function getPatternType(interests) {
  if (!interests?.length) return "scatter";
  const top = interests[0];
  const cat = getCategoryForSubInterest(top);
  if (cat && CATEGORY_PATTERNS[cat.id]) return CATEGORY_PATTERNS[cat.id];
  return "scatter";
}

/**
 * DNA Hologram — 1-of-1 generative PFP
 * A double helix with glowing nucleotide nodes, holographic gradients,
 * and particle depth. Data-encoded:
 * - seed → helix twist, palette, node positions, phase
 * - plan → container shape (circle/hexagon/diamond/square)
 * - top interest → internal particle pattern (grid/radial/wave/scatter)
 * - isVerified → boosted neon glow intensity
 * Deterministic from seed; same seed = same avatar.
 */
export default function GenerativeAvatar({ seed = "default", plan, interests, isVerified, className = "" }) {
  const p = useMemo(() => {
    const hash = hashString(seed);
    const rng = mulberry32(hash);
    const palette = PALETTES[hash % PALETTES.length];

    const shape = PLAN_SHAPES[plan] ?? Math.floor(rng() * 4);
    const patternType = getPatternType(interests);
    const glowBoost = isVerified ? 1.6 : 1;

    // Helix parameters
    const helixCenterX = 50;
    const helixTopY = 12;
    const helixBottomY = 88;
    const helixHeight = helixBottomY - helixTopY;
    const helixAmplitude = 16 + rng() * 8; // horizontal spread
    const helixTwists = 2 + Math.floor(rng() * 2); // 2-3 full twists
    const helixPhase = rng() * Math.PI * 2;
    const rungCount = 7 + Math.floor(rng() * 4); // 7-10 rungs
    const nodeRadius = (1.8 + rng() * 1.2).toFixed(1);

    // Background orbs
    const orb1X = 10 + rng() * 25;
    const orb1Y = 8 + rng() * 25;
    const orb1R = 25 + rng() * 20;
    const orb2X = 55 + rng() * 30;
    const orb2Y = 50 + rng() * 30;
    const orb2R = 25 + rng() * 20;

    // Particle field
    const particles = [];
    const pRng = mulberry32(hash + 7777);
    for (let i = 0; i < 18; i++) {
      particles.push({
        x: 5 + pRng() * 90,
        y: 5 + pRng() * 90,
        r: (0.3 + pRng() * 0.8).toFixed(1),
        o: (0.08 + pRng() * 0.2).toFixed(2),
      });
    }

    // Scan line positions
    const scanLines = [];
    for (let i = 0; i < 4; i++) {
      scanLines.push(15 + i * 22 + rng() * 6);
    }

    return {
      hash,
      palette,
      shape,
      patternType,
      glowBoost,
      helixCenterX,
      helixTopY,
      helixBottomY,
      helixHeight,
      helixAmplitude,
      helixTwists,
      helixPhase,
      rungCount,
      nodeRadius,
      orb1X, orb1Y, orb1R,
      orb2X, orb2Y, orb2R,
      particles,
      scanLines,
      specX: 35 + rng() * 15,
      specY: 20 + rng() * 15,
      specR: (8 + rng() * 6).toFixed(1),
    };
  }, [seed, plan, interests, isVerified]);

  // Generate helix strand points
  const helix = useMemo(() => {
    const { helixCenterX: cx, helixTopY: topY, helixHeight: h, helixAmplitude: amp, helixTwists: twists, helixPhase: phase, rungCount } = p;
    const steps = 60;
    const strandA = [];
    const strandB = [];
    const rungs = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = topY + t * h;
      const angle = phase + t * Math.PI * 2 * twists;
      const xA = cx + Math.cos(angle) * amp;
      const xB = cx + Math.cos(angle + Math.PI) * amp;
      const depthA = Math.sin(angle); // -1 to 1, for z-ordering
      const depthB = Math.sin(angle + Math.PI);
      strandA.push({ x: xA, y, depth: depthA, t });
      strandB.push({ x: xB, y, depth: depthB, t });
    }

    // Rungs connect strandA and strandB at intervals
    for (let i = 0; i < rungCount; i++) {
      const t = (i + 0.5) / rungCount;
      const idx = Math.round(t * steps);
      const a = strandA[idx];
      const b = strandB[idx];
      rungs.push({ a, b, t });
    }

    return { strandA, strandB, rungs };
  }, [p]);

  // Generate internal pattern within the helix
  const internalPattern = useMemo(() => {
    const { helixCenterX: cx, helixTopY: topY, helixHeight: h, helixAmplitude: amp, patternType, hash } = p;
    const cy = topY + h / 2;
    const elements = [];

    if (patternType === "grid") {
      for (let i = -2; i <= 2; i++) {
        const off = i * amp * 0.4;
        elements.push({ type: "line", x1: cx - amp, y1: cy + off, x2: cx + amp, y2: cy + off, o: 0.1 });
        elements.push({ type: "line", x1: cx + off, y1: cy - amp, x2: cx + off, y2: cy + amp, o: 0.1 });
      }
    } else if (patternType === "radial") {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        elements.push({ type: "line", x1: cx, y1: cy, x2: cx + amp * Math.cos(a), y2: cy + amp * Math.sin(a), o: 0.1 });
      }
    } else if (patternType === "wave") {
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * amp * 0.4;
        const pts = [];
        for (let j = 0; j <= 16; j++) {
          const t = j / 16;
          const x = cx - amp + t * amp * 2;
          const y = cy + off + Math.sin(t * Math.PI * 3) * amp * 0.2;
          pts.push(`${j === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        elements.push({ type: "path", d: pts.join(" "), o: 0.12 });
      }
    } else {
      const rng2 = mulberry32(hash + 99);
      for (let i = 0; i < 8; i++) {
        const a1 = rng2() * Math.PI * 2;
        const rr = amp * (0.2 + rng2() * 0.7);
        const x = cx + rr * Math.cos(a1);
        const y = cy + rr * Math.sin(a1);
        elements.push({ type: "dot", x, y, r: (0.5 + rng2() * 1).toFixed(1), o: 0.15 });
      }
    }
    return elements;
  }, [p]);

  const gid = `dna-${p.hash}`;
  const cid = `dna-clip-${p.hash}`;
  const fid = `dna-blur-${p.hash}`;

  // Strand path strings
  const strandAPath = helix.strandA.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(" ");
  const strandBPath = helix.strandB.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(" ");

  // Render clip shape based on plan
  const renderClipShape = () => {
    if (p.shape === 0) return <circle cx="50" cy="50" r="50" />;
    if (p.shape === 1) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        pts.push(`${(50 + 50 * Math.cos(a)).toFixed(1)},${(50 + 50 * Math.sin(a)).toFixed(1)}`);
      }
      return <path d={`M${pts.join("L")}Z`} />;
    }
    if (p.shape === 2) {
      return <path d="M50,0 L100,50 L50,100 L0,50 Z" />;
    }
    return <rect x="0" y="0" width="100" height="100" rx="18" />;
  };

  const { primary, secondary, accent } = p.palette;

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full block ${className}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id={cid}>{renderClipShape()}</clipPath>

        {/* Strand gradients — vertical holographic */}
        <linearGradient id={`${gid}-strandA`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.9" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${gid}-strandB`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={secondary} stopOpacity="0.9" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.9" />
        </linearGradient>

        {/* Rung gradient */}
        <linearGradient id={`${gid}-rung`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.5" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.8" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.5" />
        </linearGradient>

        {/* Border gradient */}
        <linearGradient id={`${gid}-border`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>

        {/* Background radial orbs */}
        <radialGradient id={`${gid}-orb1`}>
          <stop offset="0%" stopColor={primary} stopOpacity={0.3 * p.glowBoost} />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-orb2`}>
          <stop offset="0%" stopColor={secondary} stopOpacity={0.25 * p.glowBoost} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>

        {/* Node glow */}
        <radialGradient id={`${gid}-node`}>
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`${fid}-strong`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="100" height="100" fill="#050810" />

      <g clipPath={`url(#${cid})`}>
        {/* Holographic background orbs */}
        <circle cx={p.orb1X} cy={p.orb1Y} r={p.orb1R} fill={`url(#${gid}-orb1)`} />
        <circle cx={p.orb2X} cy={p.orb2Y} r={p.orb2R} fill={`url(#${gid}-orb2)`} />

        {/* Particle field */}
        {p.particles.map((pt, i) => (
          <circle key={`p-${i}`} cx={pt.x} cy={pt.y} r={pt.r} fill={accent} opacity={pt.o} />
        ))}

        {/* Scan lines */}
        {p.scanLines.map((y, i) => (
          <line key={`s-${i}`} x1="0" y1={y} x2="100" y2={y} stroke={primary} strokeWidth="0.15" opacity="0.06" />
        ))}

        {/* Internal pattern (behind helix) */}
        <g opacity="0.6">
          {internalPattern.map((el, i) => {
            if (el.type === "line") return <line key={`ip-${i}`} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={accent} strokeWidth="0.2" opacity={el.o} />;
            if (el.type === "path") return <path key={`ip-${i}`} d={el.d} fill="none" stroke={accent} strokeWidth="0.2" opacity={el.o} />;
            return <circle key={`ip-${i}`} cx={el.x} cy={el.y} r={el.r} fill={accent} opacity={el.o} />;
          })}
        </g>

        {/* DNA Helix — back nodes (depth < 0) rendered first */}
        {helix.rungs.map((rung, i) => {
          const aBack = rung.a.depth < 0;
          const bBack = rung.b.depth < 0;
          return (
            <g key={`rung-back-${i}`}>
              {aBack && (
                <circle cx={rung.a.x} cy={rung.a.y} r={p.nodeRadius * 2.5} fill={`url(#${gid}-node)`} opacity="0.4" />
              )}
              {bBack && (
                <circle cx={rung.b.x} cy={rung.b.y} r={p.nodeRadius * 2.5} fill={`url(#${gid}-node)`} opacity="0.4" />
              )}
            </g>
          );
        })}

        {/* Rungs (connecting bars) — back ones first */}
        {helix.rungs.map((rung, i) => {
          const isBack = rung.a.depth < 0 && rung.b.depth < 0;
          return (
            <line
              key={`rung-${i}`}
              x1={rung.a.x} y1={rung.a.y}
              x2={rung.b.x} y2={rung.b.y}
              stroke={`url(#${gid}-rung)`}
              strokeWidth="0.6"
              opacity={isBack ? 0.25 : 0.5}
            />
          );
        })}

        {/* Strand B (rendered first if behind) */}
        <path d={strandBPath} fill="none" stroke={`url(#${gid}-strandB)`} strokeWidth="1.2" opacity="0.7" filter={`url(#${fid})`} />
        <path d={strandBPath} fill="none" stroke={`url(#${gid}-strandB)`} strokeWidth="0.8" opacity="0.9" />

        {/* Strand A */}
        <path d={strandAPath} fill="none" stroke={`url(#${gid}-strandA)`} strokeWidth="1.2" opacity="0.7" filter={`url(#${fid})`} />
        <path d={strandAPath} fill="none" stroke={`url(#${gid}-strandA)`} strokeWidth="0.8" opacity="0.95" />

        {/* Front nodes (depth >= 0) rendered last */}
        {helix.rungs.map((rung, i) => {
          const aFront = rung.a.depth >= 0;
          const bFront = rung.b.depth >= 0;
          return (
            <g key={`node-front-${i}`}>
              {aFront && (
                <>
                  <circle cx={rung.a.x} cy={rung.a.y} r={p.nodeRadius * 3} fill={`url(#${gid}-node)`} opacity="0.5" />
                  <circle cx={rung.a.x} cy={rung.a.y} r={p.nodeRadius} fill={accent} opacity="0.95" />
                  <circle cx={rung.a.x} cy={rung.a.y} r={p.nodeRadius * 0.5} fill="white" opacity="0.8" />
                </>
              )}
              {bFront && (
                <>
                  <circle cx={rung.b.x} cy={rung.b.y} r={p.nodeRadius * 3} fill={`url(#${gid}-node)`} opacity="0.5" />
                  <circle cx={rung.b.x} cy={rung.b.y} r={p.nodeRadius} fill={primary} opacity="0.95" />
                  <circle cx={rung.b.x} cy={rung.b.y} r={p.nodeRadius * 0.5} fill="white" opacity="0.8" />
                </>
              )}
            </g>
          );
        })}

        {/* Specular highlight */}
        <ellipse cx={p.specX} cy={p.specY} rx={p.specR} ry={p.specR * 0.5} fill="white" opacity="0.06" filter={`url(#${fid}-strong)`} />
      </g>

      {/* Neon border ring — shape-aware */}
      <g fill="none" stroke={`url(#${gid}-border)`} strokeWidth="0.8" opacity={0.4 * p.glowBoost}>
        {p.shape === 0 && <circle cx="50" cy="50" r="49" />}
        {p.shape === 1 && (
          <path d={(() => {
            const pts = [];
            for (let i = 0; i < 6; i++) {
              const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
              pts.push(`${(50 + 49 * Math.cos(a)).toFixed(1)},${(50 + 49 * Math.sin(a)).toFixed(1)}`);
            }
            return `M${pts.join("L")}Z`;
          })()} />
        )}
        {p.shape === 2 && <path d="M50,1 L99,50 L50,99 L1,50 Z" />}
        {p.shape === 3 && <rect x="0.5" y="0.5" width="99" height="99" rx="18" />}
      </g>
    </svg>
  );
}