import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nex_radar_sweep_color";

export const RADAR_SWEEP_COLORS = [
  { label: "Blue", value: "#3B82F6" },
  { label: "Cyan", value: "#22D3EE" },
  { label: "Green", value: "#2ECC71" },
  { label: "Purple", value: "#A78BFA" },
  { label: "Pink", value: "#EC4899" },
  { label: "Orange", value: "#F97316" },
  { label: "Red", value: "#EF4444" },
  { label: "White", value: "#FFFFFF" },
];

export function getRadarSweepColor() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "#3B82F6";
  } catch {
    return "#3B82F6";
  }
}

export function useRadarSweepColor() {
  const [color, setColor] = useState(getRadarSweepColor);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) setColor(e.newValue || "#3B82F6");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const changeColor = useCallback((newColor) => {
    try {
      localStorage.setItem(STORAGE_KEY, newColor);
    } catch {
      // ignore
    }
    setColor(newColor);
    window.dispatchEvent(new CustomEvent("nex-radar-color-change", { detail: newColor }));
  }, []);

  return { color, changeColor };
}