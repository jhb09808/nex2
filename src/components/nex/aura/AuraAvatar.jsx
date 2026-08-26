import React, { useMemo } from "react";
import { buildAura, profileToAuraInput } from "@/components/nex/aura/auraGeneration";

/**
 * NEX2 Aura — the signature 1-of-1 profile picture.
 *
 * A glowing energy field: layered gradient blobs, soft light streaks, orbit
 * rings and sparks, all seeded from the account so a person's Aura never
 * changes on its own. Pure SVG, so it is razor sharp at 32px and at 400px.
 *
 * Pass either a `profile` (preferred — reads interests, badges, connections,
 * activity) or a raw `aura` object from buildAura.
 */
export default function AuraAvatar({
  profile,
  aura: auraProp,
  variant,
  animated = true,
  className = "",
}) {
  const aura = useMemo(() => {
    if (auraProp) return auraProp;
    const input = profileToAuraInput(profile || {});
    return buildAura(variant == null ? input : { ...input, variant });
  }, [auraProp, profile, variant]);

  const { id, primary, secondary, tilt, coreX, coreY, glow, blobs, rings, streaks, particles, spin } = aura;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Deep field behind everything */}
        <radialGradient id={`${id}f`} cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor={primary.c} stopOpacity=".95" />
          <stop offset="100%" stopColor="#04060E" />
        </radialGradient>

        {/* The luminous core */}
        <radialGradient id={`${id}k`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5 + glow * 0.4} />
          <stop offset="34%" stopColor={primary.accent} stopOpacity={0.45 * glow} />
          <stop offset="100%" stopColor={primary.b} stopOpacity="0" />
        </radialGradient>

        {/* Rim light — reads as depth at small sizes */}
        <radialGradient id={`${id}r`} cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor={primary.b} stopOpacity="0" />
          <stop offset="100%" stopColor={secondary.b} stopOpacity={0.3 * glow} />
        </radialGradient>

        <linearGradient id={`${id}s`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary.accent} stopOpacity="0" />
          <stop offset="50%" stopColor={primary.accent} />
          <stop offset="100%" stopColor={secondary.b} stopOpacity="0" />
        </linearGradient>

        <filter id={`${id}b`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7.5" />
        </filter>
        <filter id={`${id}bs`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id={`${id}bp`} x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="1" />
        </filter>

        <clipPath id={`${id}c`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}c)`}>
        <rect width="100" height="100" fill={`url(#${id}f)`} />

        {/* Layered gradient blobs — slow drift gives the orb life */}
        <g filter={`url(#${id}b)`} opacity={0.55 + glow * 0.45}>
          <g transform={`rotate(${tilt.toFixed(1)} 50 50)`}>
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${tilt.toFixed(1)} 50 50`}
                to={`${(tilt + 360).toFixed(1)} 50 50`}
                dur={`${(spin * 1.6).toFixed(0)}s`}
                repeatCount="indefinite"
              />
            )}
            {blobs.map((b, i) => (
              <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.color} opacity={b.opacity} />
            ))}
          </g>
        </g>

        {/* Light streaks */}
        <g filter={`url(#${id}bs)`}>
          {streaks.map((s, i) => (
            <g key={i} transform={`rotate(${s.rot.toFixed(1)} 50 50)`}>
              {animated && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`${s.rot.toFixed(1)} 50 50`}
                  to={`${(s.rot + (i % 2 === 0 ? 360 : -360)).toFixed(1)} 50 50`}
                  dur={`${(spin + i * 9).toFixed(0)}s`}
                  repeatCount="indefinite"
                />
              )}
              <path
                d={s.d}
                fill="none"
                stroke={`url(#${id}s)`}
                strokeWidth={s.width}
                strokeLinecap="round"
                opacity={s.opacity}
              />
            </g>
          ))}
        </g>

        {/* Orbit rings — one band per tier of connections */}
        <g>
          {rings.map((r, i) => (
            <g key={i} transform={`rotate(${r.rot.toFixed(1)} 50 50)`}>
              {animated && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`${r.rot.toFixed(1)} 50 50`}
                  to={`${(r.rot + (i % 2 === 0 ? -360 : 360)).toFixed(1)} 50 50`}
                  dur={`${(spin * 1.3 + i * 11).toFixed(0)}s`}
                  repeatCount="indefinite"
                />
              )}
              <ellipse
                cx="50"
                cy="50"
                rx={r.rx}
                ry={r.ry}
                fill="none"
                stroke={i % 2 === 0 ? primary.accent : secondary.accent}
                strokeWidth={r.width}
                opacity={r.opacity * (0.55 + glow * 0.45)}
                {...(r.dash ? { strokeDasharray: r.dash } : {})}
              />
            </g>
          ))}
        </g>

        {/* Core */}
        <circle cx={coreX} cy={coreY} r={30 + glow * 8} fill={`url(#${id}k)`}>
          {animated && (
            <animate
              attributeName="opacity"
              values={`${(0.78 + glow * 0.2).toFixed(2)};1;${(0.78 + glow * 0.2).toFixed(2)}`}
              dur="6s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Sparks — one pair per badge */}
        <g filter={`url(#${id}bp)`}>
          {particles.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.color} opacity=".9">
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.25;0.95;0.25"
                  dur={`${(3 + (i % 5) * 0.9).toFixed(1)}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}
        </g>

        <circle cx="50" cy="50" r="50" fill={`url(#${id}r)`} />
      </g>

      <circle
        cx="50"
        cy="50"
        r="49.2"
        fill="none"
        stroke={primary.b}
        strokeWidth=".9"
        opacity={0.28 + glow * 0.34}
      />
    </svg>
  );
}