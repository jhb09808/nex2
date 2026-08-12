import React, { useState } from "react";

// Blips sit at percentages of the disc, so they track it as it resizes.
// Each person keeps their own colour.
const BLIPS = [
  { name: "Maya", interest: "climbing", distance: "0.4mi", left: "22%", top: "27%", revealDelay: "0s", floatDur: "6s", floatDelay: "0s", color: "#4dffb0" },
  { name: "Devon", interest: "chess", distance: "0.9mi", left: "78%", top: "43%", revealDelay: "1.1s", floatDur: "7.4s", floatDelay: "0.5s", color: "#ffb454" },
  { name: "Sam", interest: "film", distance: "1.2mi", left: "26%", top: "59%", revealDelay: "2.2s", floatDur: "8.6s", floatDelay: "1s", color: "#a98cff" },
  { name: "Priya", interest: "running", distance: "1.6mi", left: "76%", top: "72%", revealDelay: "3.3s", floatDur: "9.4s", floatDelay: "1.5s", color: "#ff8fb0" },
];

// Relative to the viewport, not a fixed px box, so the radar is as big as the
// screen allows on every phone instead of being locked to one size.
const DISC = "min(88vw, 54vh)";

export default function LandingRadar() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(false);
    void document.body.offsetWidth;
    setScanning(true);
    setTimeout(() => setScanning(false), 1500);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Scan for people nearby"
      onClick={handleScan}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleScan(); } }}
      style={{
        position: "relative",
        zIndex: 1,
        flex: "none",
        minHeight: DISC,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 760,
        perspectiveOrigin: "50% 44%",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Disc box — the positioning context for every child */}
      <div style={{ position: "relative", width: DISC, height: DISC, maxWidth: "100%", flex: "none" }}>
        {/* Glow ellipse */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: "120%", height: "62%", transform: "translate(-50%, -50%)", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(45,130,255,0.34) 0%, rgba(6,20,40,0) 68%)", filter: "blur(2px)" }} />

        {/* Radar disk (3D-tilted) */}
        <div style={{ position: "absolute", inset: 0, transform: "rotateX(66deg)", transformStyle: "preserve-3d", animation: "nxtilt 16s ease-in-out infinite" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(130,210,255,0.55), rgba(130,210,255,0.10) 28%, rgba(130,210,255,0) 56%)", animation: "nxsweep 4.5s linear infinite" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(115,195,255,0.45)", boxShadow: "0 0 34px rgba(50,140,255,0.4), inset 0 0 48px rgba(40,120,220,0.24)" }} />
          <div style={{ position: "absolute", inset: "16%", borderRadius: "50%", border: "1px solid rgba(115,195,255,0.3)" }} />
          <div style={{ position: "absolute", inset: "33%", borderRadius: "50%", border: "1px solid rgba(115,195,255,0.22)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,0.5)", animation: "nxping 3.6s ease-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,0.4)", animation: "nxping 3.6s ease-out 1.8s infinite" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "linear-gradient(90deg, transparent, rgba(115,195,255,0.3), transparent)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "linear-gradient(180deg, transparent, rgba(115,195,255,0.3), transparent)" }} />
        </div>

        {/* Scan effect */}
        {scanning && (
          <>
            <div style={{ position: "absolute", inset: 0, transform: "rotateX(66deg)" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(170,230,255,0.9)", boxShadow: "0 0 34px rgba(120,200,255,0.7)", animation: "nxping 1.5s ease-out" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(170,230,255,0.6)", animation: "nxping 1.5s ease-out 0.35s" }} />
            </div>
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: "50%", background: "rgba(205,238,255,0.85)", filter: "blur(5px)", animation: "nxping 1.2s ease-out" }} />
            <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8fd0ff", whiteSpace: "nowrap" }}>Scanning…</div>
          </>
        )}

        {/* Vertical line + centre dot */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: "26%", marginLeft: -1, transform: "translateY(-100%)", background: "linear-gradient(180deg, rgba(180,232,255,0), rgba(180,232,255,0.95))", boxShadow: "0 0 28px rgba(120,200,255,0.9)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 14, height: 14, margin: "-7px 0 0 -7px", borderRadius: "50%", background: "#bfe6ff", boxShadow: "0 0 32px 8px rgba(120,200,255,0.9)" }} />

        {/* Person blips */}
        {BLIPS.map((blip) => (
          <div key={blip.name} style={{ position: "absolute", left: blip.left, top: blip.top, transform: "translateX(-50%)" }}>
            <div style={{ animation: `nxreveal 4.5s linear ${blip.revealDelay} infinite` }}>
              <div style={{ position: "relative", animation: `nxfloat ${blip.floatDur} ease-in-out ${blip.floatDelay} infinite` }}>
                <div style={{ position: "absolute", left: "50%", top: "100%", width: 1, height: 20, marginLeft: -0.5, background: "linear-gradient(180deg, rgba(150,220,255,0.85), rgba(150,220,255,0))" }} />
                <div style={{ position: "absolute", left: "50%", top: "calc(100% + 20px)", width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5, borderRadius: "50%", background: blip.color, boxShadow: `0 0 12px 3px ${blip.color}` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", border: "1px solid rgba(150,220,255,0.5)", background: "rgba(10,32,66,0.72)", backdropFilter: "blur(10px)", boxShadow: "0 0 18px rgba(70,150,255,0.35)", clipPath: "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)", whiteSpace: "nowrap" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: blip.color, boxShadow: `0 0 8px ${blip.color}` }} />
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11, lineHeight: 1, letterSpacing: "0.04em", color: "#e6f4ff" }}>{blip.name}</span>
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 10, lineHeight: 1, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8fd0ff" }}>{blip.interest}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, color: "#7fa9d4" }}>{blip.distance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
