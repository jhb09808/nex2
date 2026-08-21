import React from "react";
import { useNavigate } from "react-router-dom";
import pageBg from "@/assets/radar-map.webp";

const SCRIM = "linear-gradient(180deg, rgba(3,12,26,.68) 0%, rgba(2,9,20,.92) 20%, rgba(1,6,14,.97) 42%, #01050c 66%)";

/**
 * The phone chrome the profile, settings and premium screens share: the
 * city-lights background under its scrim, the HUD frame, and a header that
 * clears NavMenu's floating hamburger.
 */
export default function PhoneShell({ title, back = false, badge, children, footer }) {
  const navigate = useNavigate();

  return (
    <div className="mob relative overflow-hidden h-full flex flex-col" style={{ background: "radial-gradient(110% 34% at 50% 0%, #0a2545 0%, #04101f 42%, #01050c 100%)" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={pageBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
      </div>

      {/* HUD frame */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 8, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />

      {/* Header — paddingRight clears the hamburger fixed at right:16 */}
      <header style={{ position: "relative", flex: "none", zIndex: 3, display: "flex", alignItems: "center", gap: badge ? 10 : 12, padding: "calc(14px + env(safe-area-inset-top, 0px)) 72px 0 16px" }}>
        {back && (
          <button className="circ" aria-label="Back" onClick={() => navigate(-1)}>
            <svg width="15" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
              <path d="M15 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <h1 style={{ margin: 0, flex: badge ? "none" : 1, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: back ? 23 : 25, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 18px rgba(90,180,255,.5)" }}>
          {title}
        </h1>
        {badge}
      </header>

      {children}
      {footer}
    </div>
  );
}
