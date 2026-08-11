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

// Gender-encoded fingerprint palettes — core → mid → edge radial ramp.
const GENDER_PALETTES = {
  female: { core: "#FF6FB5", mid: "#FF3D8B", edge: "#C026D3" },
  male: { core: "#5BC8FF", mid: "#2D7DFF", edge: "#6D5BFF" },
  nonbinary: { core: "#7DE0B0", mid: "#2FD4D4", edge: "#A98CFF" },
  undisclosed: { core: "#CBD9E8", mid: "#8FB9E2", edge: "#5F89B2" },
};

const COLORED_KEYS = ["male", "female", "nonbinary"];

// Map the UserProfile.gender enum onto a palette. An explicit
// "prefer_not_to_say" is honored as the neutral (undisclosed) ramp; a
// missing/unknown gender falls back to a deterministic colored palette so
// avatars stay lively rather than all-neutral.
function paletteFor(gender, hash) {
  if (gender === "male" || gender === "female") return GENDER_PALETTES[gender];
  if (gender === "non-binary" || gender === "nonbinary") return GENDER_PALETTES.nonbinary;
  if (gender === "prefer_not_to_say") return GENDER_PALETTES.undisclosed;
  return GENDER_PALETTES[COLORED_KEYS[hash % COLORED_KEYS.length]];
}

/**
 * Fingerprint — 1-of-1 generative PFP.
 * Concentric ridge lines (some open, some closed loops) over a dark field,
 * tinted by a gender-encoded radial gradient. Deterministic from seed:
 * same seed = same fingerprint. `gender` selects the color ramp,
 * `isVerified` boosts the rim glow.
 */
export default function GenerativeAvatar({ seed = "default", gender, isVerified, className = "" }) {
  const p = useMemo(() => {
    const h = hashString(seed);
    const r = mulberry32(h);
    const pal = paletteFor(gender, h);
    const gid = "fp" + h;

    const cx = 50 + (r() - 0.5) * 9;
    const cy = 52 + (r() - 0.5) * 9;
    const tilt = (r() - 0.5) * 28;
    const squash = 0.76 + r() * 0.16;
    const count = 8 + Math.floor(r() * 3);
    const w1k = 2 + Math.floor(r() * 2);
    const w1p = r() * Math.PI * 2;
    const w1a = 0.1 + r() * 0.09;
    const w2k = 3 + Math.floor(r() * 3);
    const w2p = r() * Math.PI * 2;
    const w2a = 0.05 + r() * 0.07;

    const paths = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / count;
      const base = 3.6 + t * 40;
      const open = r() < 0.34;
      const gapAt = r() * Math.PI * 2;
      const gapSize = 0.5 + r() * 1.5;
      const jitter = (r() - 0.5) * 1.5;
      const from = open ? gapAt + gapSize / 2 : 0;
      const span = open ? Math.PI * 2 - gapSize : Math.PI * 2;
      let d = "";
      for (let s = 0; s <= 96; s++) {
        const th = from + (s / 96) * span;
        const rr =
          base * (1 + w1a * Math.sin(th * w1k + w1p) + w2a * Math.sin(th * w2k + w2p)) + jitter;
        d +=
          (s === 0 ? "M" : "L") +
          (cx + rr * Math.cos(th)).toFixed(2) +
          " " +
          (cy + rr * squash * Math.sin(th)).toFixed(2);
      }
      if (!open) d += "Z";
      paths.push({
        d,
        w: (1.25 + (1 - t) * 0.55).toFixed(2),
        o: (0.72 + (1 - t) * 0.28).toFixed(2),
      });
    }

    return { gid, pal, tilt, cx, cy, paths };
  }, [seed, gender]);

  const { gid, pal, tilt, paths } = p;
  const rimOpacity = isVerified ? 0.7 : 0.4;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="52%" r="52%">
          <stop offset="0%" stopColor={pal.core} />
          <stop offset="52%" stopColor={pal.mid} />
          <stop offset="100%" stopColor={pal.edge} />
        </radialGradient>
        <radialGradient id={gid + "h"} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={pal.mid} stopOpacity=".26" />
          <stop offset="100%" stopColor={pal.edge} stopOpacity="0" />
        </radialGradient>
        <clipPath id={gid + "c"}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${gid}c)`}>
        <rect width="100" height="100" fill="#050810" />
        <circle cx="50" cy="50" r="50" fill={`url(#${gid}h)`} />
        <g transform={`rotate(${tilt.toFixed(1)} 50 50)`}>
          {paths.map((pt, i) => (
            <path
              key={i}
              d={pt.d}
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth={pt.w}
              strokeLinecap="round"
              opacity={pt.o}
            />
          ))}
        </g>
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke={pal.mid} strokeWidth=".9" opacity={rimOpacity} />
    </svg>
  );
}
