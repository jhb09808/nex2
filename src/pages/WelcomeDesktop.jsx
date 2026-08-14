import React, { useState } from "react";
import DesktopFrame from "@/components/nex/desktop/DesktopFrame";
import DesktopLoginModal from "@/components/nex/desktop/DesktopLoginModal";

const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/37125597e_NEX2.png";

// Pins are placed as fractions of the disc so they track it at any size.
const PINS = [
  { name: "Maya", tag: "climbing", dist: "0.4mi", x: -0.28, y: -0.21, reveal: "0s", float: "6.5s", color: "#4dffb0" },
  { name: "Devon", tag: "chess", dist: "0.9mi", x: 0.2533, y: -0.0733, reveal: "1.25s", float: "7.8s", color: "#ffb454" },
  { name: "Sam", tag: "film", dist: "1.2mi", x: -0.22, y: 0.0867, reveal: "2.5s", float: "9s", color: "#a98cff" },
  { name: "Priya", tag: "running", dist: "1.6mi", x: 0.2433, y: 0.22, reveal: "3.75s", float: "10s", color: "#ff8fb0" },
];

const SCRIMS = [
  "linear-gradient(90deg, rgba(3,11,26,.58) 0%, rgba(3,11,26,.66) 34%, rgba(2,8,18,.56) 62%, rgba(2,8,18,.76) 100%)",
  "linear-gradient(180deg, rgba(3,11,26,.34) 0%, rgba(3,11,26,.30) 44%, rgba(2,8,18,.78) 100%)",
  "radial-gradient(70% 70% at 72% 50%, rgba(45,130,255,.24), rgba(2,7,16,0) 66%)",
];

export default function WelcomeDesktop({ zip, setZip, zipMsg, checkZip, counts, radiusMiles = 2, loggedOut, onGetStarted }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
    <DesktopFrame background="radial-gradient(85% 90% at 72% 50%, #0d2a58 0%, #061428 44%, #020710 100%)" scrims={SCRIMS}>
      {loggedOut && (
        <div style={{ position: "absolute", zIndex: 20, top: "clamp(24px,3vh,40px)", left: "50%", transform: "translateX(-50%)", padding: "10px 18px", background: "rgba(16,80,50,.55)", border: "1px solid rgba(80,220,140,.4)", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(12px)", boxShadow: "0 8px 28px rgba(1,6,14,.6)", pointerEvents: "none" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", flex: "none" }} />
          <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, color: "#bff5d6", letterSpacing: "0.04em" }}>You've been logged out.</span>
        </div>
      )}

      {/* Header */}
      <header style={{ position: "relative", flex: "none", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(22px,3.2vh,44px) var(--pad) 0" }}>
        <img src={LOGO_URL} alt="NEX2" style={{ display: "block", width: 124, height: 20, filter: "drop-shadow(0 0 10px rgba(90,180,255,.75))" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(125,205,255,.45)", borderRadius: 999, padding: "8px 15px", background: "rgba(18,54,108,.45)", backdropFilter: "blur(8px)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10.5, lineHeight: 1, letterSpacing: "0.18em", color: "#bfe2ff", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
            Early access · NYC
          </div>
          <button type="button" onClick={() => setShowLogin(true)} className="dk-ghost dk-notch-sm">Log in</button>
        </div>
      </header>

      {/* Left column */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 3, display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", width: "min(46vw, 640px)", padding: "clamp(10px,1.6vh,24px) 0 clamp(10px,1.6vh,24px) var(--pad)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.24em", textTransform: "uppercase", color: "#7fa9d4" }}>
          <span style={{ width: 44, height: 1, background: "linear-gradient(90deg, rgba(120,200,255,.7), rgba(120,200,255,.1))" }} />
          Proximity social discovery
        </div>

        <h1 style={{ margin: "clamp(12px,2vh,22px) 0 0", fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(38px, 5vw, 78px)", lineHeight: 0.96, letterSpacing: "0.01em", textTransform: "uppercase", textShadow: "0 0 40px rgba(90,180,255,.5)" }}>
          Discover<br />people nearby
        </h1>

        <p style={{ margin: "clamp(10px,1.8vh,26px) 0 0", maxWidth: 430, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: 1.6, letterSpacing: "0.01em", color: "#a6cbec" }}>
          Who share your interests. Not photos, not swiping — a live radar of people around you right now, matched on what you're actually into.
        </p>

        {/* ZIP + CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: "clamp(18px,3.2vh,38px)", width: "100%" }}>
          <div style={{ flex: "1 1 300px", minWidth: 280, display: "flex", alignItems: "center", gap: 10 }}>
            <div className="dk-notch" style={{ position: "relative", flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", gap: 10, height: "clamp(52px,6.4vh,60px)", padding: "0 clamp(13px,1.3vw,18px)", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.4)" }}>
              <div aria-hidden="true" style={{ width: 16, height: 16, borderRadius: "50% 50% 50% 0", border: "1.5px solid #6fb8ff", transform: "rotate(-45deg)", flex: "none" }} />
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") checkZip(); }}
                placeholder="Your ZIP code"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                aria-label="Your ZIP code"
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 16.5, lineHeight: 1 }}
              />
            </div>
            <button onClick={checkZip} className="dk-ghost dk-notch-sm" style={{ flex: "none", height: "clamp(52px,6.4vh,60px)", padding: "0 clamp(14px,1.5vw,24px)", fontSize: 12.5, letterSpacing: "0.16em" }}>
              Check
            </button>
          </div>

          <button
            onClick={onGetStarted}
            className="dk-notch dk-cta"
            style={{ position: "relative", overflow: "hidden", flex: "none", height: "clamp(52px,6.4vh,60px)", padding: "0 clamp(18px,2vw,34px)", border: "1.5px solid transparent", background: "linear-gradient(180deg,#0a1c3e,#071228) padding-box, linear-gradient(100deg,#3b6bff,#9b4dff 48%,#2fd4d4) border-box", color: "#fff", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 14, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "box-shadow .25s ease, transform .25s ease, filter .25s ease", boxShadow: "0 0 26px rgba(80,110,255,.45), inset 0 0 24px rgba(70,120,255,.26)" }}
          >
            <span aria-hidden="true" style={{ position: "absolute", top: -1, left: "50%", width: 86, height: 2, marginLeft: -43, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(200,225,255,.95), rgba(255,255,255,0))", filter: "blur(.5px)" }} />
            <span aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, width: 70, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.28), rgba(255,255,255,0))", animation: "nxsheen 4.5s ease-in-out infinite" }} />
            <span style={{ position: "relative" }}>Get started →</span>
          </button>
        </div>

        <div role="status" aria-live="polite" style={{ minHeight: 18, marginTop: 9, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 12, lineHeight: "20px", letterSpacing: "0.03em", color: "#8fb9e2" }}>
          {zipMsg}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "clamp(22px,3.2vw,52px)", marginTop: "clamp(20px,3.6vh,44px)", paddingTop: "clamp(16px,2.6vh,30px)", borderTop: "1px solid rgba(105,190,255,.16)" }}>
          <div className="dk-stat"><b style={{ textShadow: "0 0 18px rgba(90,180,255,.45)" }}>{counts.active_count}</b><span>Active members</span></div>
          <div className="dk-stat"><b style={{ textShadow: "0 0 18px rgba(180,140,255,.4)" }}>{counts.waitlist_count}</b><span>On the waitlist</span></div>
          <div className="dk-stat"><b>{radiusMiles} mi</b><span>Discovery radius</span></div>
        </div>
      </div>

      {/* Radar, right-hand side */}
      <div aria-hidden="true" style={{ position: "absolute", right: "calc(var(--disc) * -.07)", top: "50%", transform: "translateY(-50%)", zIndex: 2, pointerEvents: "none", width: "calc(var(--disc) * 1.1)", height: "calc(var(--disc) * 1.1)", display: "flex", alignItems: "center", justifyContent: "center", perspective: 1300, perspectiveOrigin: "50% 46%" }}>
        <div style={{ position: "absolute", width: "calc(var(--disc) * 1.17)", height: "calc(var(--disc) * .57)", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(45,130,255,.30) 0%, rgba(6,20,40,0) 68%)", filter: "blur(4px)" }} />

        <div style={{ position: "absolute", width: "var(--disc)", height: "var(--disc)", transform: "rotateX(66deg)", transformStyle: "preserve-3d", animation: "nxtilt 18s ease-in-out infinite" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(130,210,255,.50), rgba(130,210,255,.08) 26%, rgba(130,210,255,0) 54%)", animation: "nxsweep 5s linear infinite" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(115,195,255,.42)", boxShadow: "0 0 48px rgba(50,140,255,.32), inset 0 0 70px rgba(40,120,220,.2)" }} />
          <div style={{ position: "absolute", inset: "16.7%", borderRadius: "50%", border: "1px solid rgba(115,195,255,.28)" }} />
          <div style={{ position: "absolute", inset: "33.3%", borderRadius: "50%", border: "1px solid rgba(115,195,255,.2)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,.42)", animation: "nxping 4.2s ease-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,.32)", animation: "nxping 4.2s ease-out 2.1s infinite" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "linear-gradient(90deg, transparent, rgba(115,195,255,.26), transparent)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "linear-gradient(180deg, transparent, rgba(115,195,255,.26), transparent)" }} />
        </div>

        <div style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: "calc(var(--disc) * .25)", marginLeft: -1, marginTop: "calc(var(--disc) * -.25)", background: "linear-gradient(180deg, rgba(180,232,255,0), rgba(180,232,255,.95))", boxShadow: "0 0 34px rgba(120,200,255,.9)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, margin: "-9px 0 0 -9px", borderRadius: "50%", background: "#cdeaff", boxShadow: "0 0 46px 12px rgba(120,200,255,.85)" }} />

        {PINS.map((p) => (
          <div key={p.name} className="dk-pin" style={{ transform: `translate(calc(var(--disc) * ${p.x}), calc(var(--disc) * ${p.y})) translateX(-50%)` }}>
            <div style={{ animation: `nxreveal 5s linear ${p.reveal} infinite` }}>
              <div style={{ position: "relative", animation: `nxfloat ${p.float} ease-in-out infinite` }}>
                <div className="stem" />
                <div className="foot" style={{ background: p.color }} />
                <div className="pcard">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, boxShadow: `0 0 9px ${p.color}` }} />
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 12.5, lineHeight: 1, letterSpacing: "0.04em", color: "#e6f4ff" }}>{p.name}</span>
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8fd0ff" }}>{p.tag}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, lineHeight: 1, color: "#7fa9d4" }}>{p.dist}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ position: "relative", flex: "none", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "0 var(--pad) clamp(20px,3vh,44px)", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.08em", color: "#5f89b2" }}>
        <span>NEX2 works best in dense areas — starting in NYC, expanding city by city.</span>
        <span>© 2026 NEX2, Inc.</span>
      </footer>

    </DesktopFrame>

    {showLogin && <DesktopLoginModal activeCount={counts.active_count} onClose={() => setShowLogin(false)} />}
    </>
  );
}
