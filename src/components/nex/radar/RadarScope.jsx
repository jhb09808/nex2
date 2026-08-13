import React, { useRef } from "react";
import RadarScene from "@/components/nex/radar/RadarScene";

const PALETTE = ["#4dffb0", "#7fc8ff", "#ffb454", "#a98cff", "#ff8fb0"];

// Stable colour per person so a blip keeps its identity between renders.
const colorFor = (key) => {
  const s = String(key || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

const bearing = (lat1, lon1, lat2, lon2) => {
  // Screen angle: 0° points right, growing clockwise, which is what the blip
  // placement (cos/sin) and the sweep phase both assume.
  const dLat = lat2 - lat1;
  const dLon = (lon2 - lon1) * Math.cos((lat1 * Math.PI) / 180);
  return (Math.atan2(-dLat, dLon) * 180) / Math.PI;
};

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
}) {
  const pinchRef = useRef(null);

  const blips = markers
    .map((m, idx) => {
      if (m.type === "cluster") {
        const dist = distanceMiles(center.lat, center.lng, m.lat, m.lng);
        return {
          id: `cluster-${m.key}`,
          name: `${m.count} people`,
          distance: dist,
          angle: bearing(center.lat, center.lng, m.lat, m.lng),
          color: "#7fc8ff",
          cluster: m,
        };
      }
      const coords = getUserLatLng(m.user);
      if (!coords) return null;
      const dist = distanceMiles(center.lat, center.lng, coords[0], coords[1]);
      return {
        id: m.user.id ?? `u-${idx}`,
        name: m.user.username || "Nearby user",
        distance: dist,
        angle: bearing(center.lat, center.lng, coords[0], coords[1]),
        color: m.user.id === bestMatchId ? "#4dffb0" : colorFor(m.user.id ?? idx),
        user: m.user,
      };
    })
    .filter(Boolean);

  const handleSelect = (id) => {
    if (id == null) return;
    const b = blips.find((x) => x.id === id);
    if (!b) return;
    if (b.cluster) onClusterClick && onClusterClick(b.cluster.key);
    else onUserClick && onUserClick(b.user);
  };

  // Pinch to zoom, unchanged behaviour
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), zoom };
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current && onZoomChange) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      const next = pinchRef.current.zoom * (d / pinchRef.current.dist);
      onZoomChange(Math.round(Math.max(1, Math.min(5, next)) * 10) / 10);
    }
  };
  const onTouchEnd = () => { pinchRef.current = null; };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        perspective: 1100,
        perspectiveOrigin: "50% 45%",
        filter: blurred ? "blur(6px)" : "none",
        transition: "filter .3s ease",
      }}
    >
      <RadarScene blips={blips} zoom={zoom} selectedId={null} onSelect={handleSelect} />
      <span className="sr-only">{blips.length} people within {effectiveRadius} miles</span>
    </div>
  );
}
