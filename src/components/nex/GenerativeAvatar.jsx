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

/**
 * Generates a unique "digital fingerprint" — a whorling ridge pattern
 * deterministic from the seed string. Same seed = same fingerprint, always.
 * Each user gets a 1-of-1 monochromatic fingerprint with organic ridge
 * wobble, spiral twist, and minutiae detail points.
 */
export default function GenerativeAvatar({ seed = "default", className = "" }) {
  const pattern = useMemo(() => {
    const hash = hashString(seed);
    const rng = mulberry32(hash);
    const hueBase = Math.floor(rng() * 360);

    // Dark background — subtle tint of the ridge hue
    const bg = `hsl(${hueBase}, 20%, 5%)`;

    // Whorl core — slightly off-center for organic feel
    const centerX = 50 + (rng() - 0.5) * 6;
    const centerY = 50 + (rng() - 0.5) * 6;

    // Spiral twist parameters — how much ridges rotate as they expand
    const twistAmount = 0.6 + rng() * 1.2;
    const twistDir = rng() > 0.5 ? 1 : -1;

    // Global ridge wobble
    const wobbleAmp = 0.6 + rng() * 1.4;
    const wobbleFreq = 3 + Math.floor(rng() * 5);

    const numRidges = 11 + Math.floor(rng() * 5); // 11-15 ridges
    const maxR = 45;
    const minR = 3.5;

    const ridges = [];

    for (let i = 0; i < numRidges; i++) {
      const t = i / (numRidges - 1);
      const baseR = minR + t * (maxR - minR);

      // Spiral twist — outer ridges rotate more (whorl effect)
      const twist = twistDir * (twistAmount + t * 0.9) * t;

      // Per-ridge organic variation
      const ridgeWobble = wobbleAmp * (0.7 + rng() * 0.6);
      const ridgeFreq = wobbleFreq + Math.floor(rng() * 3);
      const ridgePhase = rng() * Math.PI * 2;

      // Monochromatic — vary lightness across ridges
      const lightness = 30 + t * 28 + rng() * 8;
      const sat = 45 + rng() * 25;
      const opacity = (0.35 + rng() * 0.3).toFixed(2);

      const steps = 96;
      const pts = [];
      for (let j = 0; j <= steps; j++) {
        const angle = (j / steps) * Math.PI * 2;
        const twistedAngle = angle + twist;
        const wobble = ridgeWobble * Math.sin(angle * ridgeFreq + ridgePhase);
        const wobble2 = ridgeWobble * 0.35 * Math.sin(angle * ridgeFreq * 1.6 + ridgePhase * 2.1);
        const r = baseR + wobble + wobble2;
        const x = centerX + r * Math.cos(twistedAngle);
        const y = centerY + r * Math.sin(twistedAngle);
        pts.push(`${j === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      pts.push("Z");

      ridges.push({
        d: pts.join(" "),
        stroke: `hsl(${hueBase}, ${sat}%, ${lightness}%)`,
        opacity,
        strokeWidth: "0.65",
      });
    }

    // Minutiae — ridge endings / bifurcation dots (fingerprint detail)
    const numMinutiae = 4 + Math.floor(rng() * 7);
    const minutiae = [];
    for (let i = 0; i < numMinutiae; i++) {
      const angle = rng() * Math.PI * 2;
      const r = 8 + rng() * 32;
      minutiae.push({
        cx: (centerX + r * Math.cos(angle)).toFixed(2),
        cy: (centerY + r * Math.sin(angle)).toFixed(2),
        r: (0.4 + rng() * 0.5).toFixed(2),
      });
    }

    return { hash, bg, ridges, minutiae, hueBase };
  }, [seed]);

  const cid = `fp-clip-${pattern.hash}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full block ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <clipPath id={cid}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <rect width="100" height="100" fill={pattern.bg} />
      <g clipPath={`url(#${cid})`}>
        {pattern.ridges.map((ridge, i) => (
          <path
            key={i}
            d={ridge.d}
            fill="none"
            stroke={ridge.stroke}
            strokeWidth={ridge.strokeWidth}
            opacity={ridge.opacity}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {pattern.minutiae.map((m, i) => (
          <circle
            key={i}
            cx={m.cx}
            cy={m.cy}
            r={m.r}
            fill={pattern.ridges[0].stroke}
            opacity="0.55"
          />
        ))}
      </g>
    </svg>
  );
}