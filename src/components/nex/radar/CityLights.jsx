import React, { useMemo } from "react";

// Warm sodium streetlights with a few cool office-tower whites — the mix is
// what makes an aerial night view read as a city rather than as stars.
const LIGHT_COLORS = [
  "rgba(255,196,120,",
  "rgba(255,168,90,",
  "rgba(255,226,178,",
  "rgba(150,205,255,",
  "rgba(120,235,255,",
];

/**
 * City lights — a soft field of glowing, flickering points behind the radar,
 * grouped into loose clusters so it looks like blocks and avenues seen from
 * the air. Purely decorative.
 */
export default function CityLights({ count = 90 }) {
  const lights = useMemo(() => {
    // Loose neighbourhood centres; lights gather around them.
    const clusters = Array.from({ length: 7 }, () => ({
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      spread: 8 + Math.random() * 16,
    }));

    return Array.from({ length: count }, (_, i) => {
      const c = clusters[i % clusters.length];
      const scatter = Math.random() < 0.22; // a few strays between the blocks
      const x = scatter ? Math.random() * 100 : c.x + (Math.random() - 0.5) * c.spread * 2;
      const y = scatter ? Math.random() * 100 : c.y + (Math.random() - 0.5) * c.spread * 2;
      const color = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
      const size = 0.9 + Math.random() * 2.1;
      return {
        id: i,
        x: Math.max(1, Math.min(99, x)),
        y: Math.max(1, Math.min(99, y)),
        size,
        color,
        peak: 0.3 + Math.random() * 0.5,
        duration: 3.5 + Math.random() * 7,
        delay: Math.random() * 9,
      };
    });
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    >
      {lights.map((l) => (
        <span
          key={l.id}
          style={{
            position: "absolute",
            left: `${l.x}%`,
            top: `${l.y}%`,
            width: `${l.size}px`,
            height: `${l.size}px`,
            marginLeft: `${-l.size / 2}px`,
            marginTop: `${-l.size / 2}px`,
            borderRadius: "50%",
            background: `${l.color}0.95)`,
            boxShadow: `0 0 ${(l.size * 2.4).toFixed(1)}px ${(l.size * 0.8).toFixed(1)}px ${l.color}0.55), 0 0 ${(l.size * 6).toFixed(1)}px ${l.color}0.22)`,
            "--peak": l.peak,
            animation: `nex-city-flicker ${l.duration.toFixed(2)}s ease-in-out ${l.delay.toFixed(2)}s infinite`,
          }}
        />
      ))}
    </div>
  );
}