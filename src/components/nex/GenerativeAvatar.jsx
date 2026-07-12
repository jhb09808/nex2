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
 * Generates a unique "digital thumbprint" — an abstract SVG pattern
 * deterministic from the seed string. Same seed = same avatar, always.
 * No two seeds produce the same pattern.
 */
export default function GenerativeAvatar({ seed = "default", className = "" }) {
  const pattern = useMemo(() => {
    const hash = hashString(seed);
    const rng = mulberry32(hash);
    const hueBase = Math.floor(rng() * 360);

    // Background gradient
    const bg2 = `hsl(${hueBase}, ${40 + rng() * 25}%, ${12 + rng() * 8}%)`;
    const bg1 = `hsl(${(hueBase + 25 + rng() * 50) % 360}, ${35 + rng() * 25}%, ${5 + rng() * 6}%)`;

    // Fingerprint rings — organic concentric wavering paths
    const numRings = 5 + Math.floor(rng() * 4); // 5-8
    const rings = [];
    const maxR = 43;
    const minR = 11;

    for (let i = 0; i < numRings; i++) {
      const t = i / (numRings - 1);
      const baseR = minR + t * (maxR - minR);
      const amplitude = 1.5 + rng() * 5;
      const frequency = 2 + Math.floor(rng() * 7);
      const phase = rng() * Math.PI * 2;
      const ringHue = (hueBase + (rng() - 0.5) * 90 + 360) % 360;
      const ringSat = 55 + rng() * 35;
      const ringLight = 50 + rng() * 25;
      const opacity = 0.35 + rng() * 0.45;
      const strokeWidth = 1.1 + rng() * 1.3;

      const steps = 72;
      const pts = [];
      for (let j = 0; j <= steps; j++) {
        const angle = (j / steps) * Math.PI * 2;
        const wobble = amplitude * Math.sin(angle * frequency + phase);
        const wobble2 = amplitude * 0.3 * Math.sin(angle * frequency * 2 + phase * 1.7);
        const r = baseR + wobble + wobble2;
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        pts.push(`${j === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      pts.push("Z");

      rings.push({
        d: pts.join(" "),
        stroke: `hsl(${ringHue}, ${ringSat}%, ${ringLight}%)`,
        opacity: opacity.toFixed(2),
        strokeWidth: strokeWidth.toFixed(2),
      });
    }

    // Accent dots for extra uniqueness
    const numDots = 2 + Math.floor(rng() * 5);
    const dots = [];
    for (let i = 0; i < numDots; i++) {
      const angle = rng() * Math.PI * 2;
      const r = 8 + rng() * 32;
      dots.push({
        cx: (50 + r * Math.cos(angle)).toFixed(2),
        cy: (50 + r * Math.sin(angle)).toFixed(2),
        r: (0.8 + rng() * 2).toFixed(2),
        fill: `hsl(${(hueBase + rng() * 90) % 360}, 65%, 60%)`,
        opacity: (0.3 + rng() * 0.4).toFixed(2),
      });
    }

    return { hash, bg1, bg2, rings, dots };
  }, [seed]);

  const gid = `ga-bg-${pattern.hash}`;
  const cid = `ga-clip-${pattern.hash}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full block ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={pattern.bg2} />
          <stop offset="100%" stopColor={pattern.bg1} />
        </radialGradient>
        <clipPath id={cid}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <g clipPath={`url(#${cid})`}>
        {pattern.rings.map((ring, i) => (
          <path
            key={i}
            d={ring.d}
            fill="none"
            stroke={ring.stroke}
            strokeWidth={ring.strokeWidth}
            opacity={ring.opacity}
            strokeLinejoin="round"
          />
        ))}
        {pattern.dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={dot.fill}
            opacity={dot.opacity}
          />
        ))}
      </g>
    </svg>
  );
}