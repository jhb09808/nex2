import React from "react";
import desktopBg from "@/assets/desktop-bg.webp";

const INSET = "clamp(12px, 1.4vw, 20px)";
const BRACKET = 34;

/**
 * The shell both desktop screens share: full-bleed photo background under its
 * scrims, then the HUD frame and its four corner brackets. Fixed and never
 * scrolls — the designs are laid out to fit the window.
 */
export default function DesktopFrame({ children, background, scrims }) {
  return (
    <div className="dk" style={{ position: "fixed", inset: 0, overflow: "hidden", display: "flex", flexDirection: "column", background }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={desktopBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {scrims.map((s, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, background: s }} />
        ))}
      </div>

      <div aria-hidden="true" style={{ position: "absolute", inset: INSET, border: "1px solid rgba(86,180,255,.12)", pointerEvents: "none", zIndex: 4 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: INSET, left: INSET, width: BRACKET, height: BRACKET, borderLeft: "2px solid rgba(125,205,255,.7)", borderTop: "2px solid rgba(125,205,255,.7)", pointerEvents: "none", zIndex: 4 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: INSET, right: INSET, width: BRACKET, height: BRACKET, borderRight: "2px solid rgba(125,205,255,.7)", borderTop: "2px solid rgba(125,205,255,.7)", pointerEvents: "none", zIndex: 4 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: INSET, left: INSET, width: BRACKET, height: BRACKET, borderLeft: "2px solid rgba(125,205,255,.7)", borderBottom: "2px solid rgba(125,205,255,.7)", pointerEvents: "none", zIndex: 4 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: INSET, right: INSET, width: BRACKET, height: BRACKET, borderRight: "2px solid rgba(125,205,255,.7)", borderBottom: "2px solid rgba(125,205,255,.7)", pointerEvents: "none", zIndex: 4 }} />

      {children}
    </div>
  );
}
