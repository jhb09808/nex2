import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/nex/Logo";
import LandingRadar from "@/components/nex/LandingRadar";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ScaleToFit from "@/components/nex/ScaleToFit";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [zip, setZip] = useState("");
  const [zipMsg, setZipMsg] = useState("");
  const [counts, setCounts] = useState({ active_count: 38, waitlist_count: 34 });
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logged_out") === "1") {
      setLoggedOut(true);
      window.history.replaceState({}, "", "/");
      setTimeout(() => setLoggedOut(false), 5000);
    }
    base44.functions.invoke("getGlobalCounts", {})
      .then((res) => setCounts(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/map", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const checkZip = async () => {
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) {
      setZipMsg("Enter a 5-digit ZIP code.");
      return;
    }
    setZipMsg("Checking…");
    try {
      const res = await base44.functions.invoke("getAreaCounts", { zip_code: z });
      const data = res.data;
      if (data.waitlist_count > 0) {
        setZipMsg(`${data.waitlist_count} ${data.waitlist_count === 1 ? "person is" : "people are"} on the waitlist in your area.`);
      } else {
        setZipMsg("No one's on the waitlist here yet — you'd be the first.");
      }
    } catch (e) {
      setZipMsg("Couldn't check that ZIP — try again.");
    }
  };

  return (
    <ScaleToFit>
    <div
      style={{
        position: "relative",
        height: 874,
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        background: "#020710",
      }}
    >
      <main
        style={{
          position: "relative",
          overflow: "hidden",
          height: 874,
          width: 402,
          display: "flex",
          flexDirection: "column",
          padding: "20px 20px 24px",
          background: "radial-gradient(120% 78% at 50% 16%, #0d2a58 0%, #061428 46%, #020710 100%)",
        }}
      >
        {loggedOut && (
          <div style={{ position: "absolute", zIndex: 20, top: 18, left: 20, right: 20, padding: "10px 16px", background: "rgba(16, 80, 50, 0.55)", border: "1px solid rgba(80, 220, 140, 0.4)", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(12px)", boxShadow: "0 8px 28px rgba(1,6,14,0.6)", pointerEvents: "none" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", flex: "none" }} />
            <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, color: "#bff5d6", letterSpacing: "0.04em" }}>You've been logged out.</span>
          </div>
        )}
        {/* Background image with gradient overlay */}
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 440, zIndex: 0, maskImage: "linear-gradient(180deg, #000 0%, #000 58%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 58%, rgba(0,0,0,0) 100%)" }}>
          <img
            src="https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/1ec3114e9_C8F69EA0-D379-44E6-A041-34FA6084E404.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,14,30,0.60) 0%, rgba(4,14,30,0.74) 42%, rgba(2,8,18,0.94) 82%, #020710 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 78% at 50% 18%, rgba(45,130,255,0.30), rgba(2,7,16,0) 64%)" }} />
        </div>

        {/* Cyber frame corners */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 10, border: "1px solid rgba(86,180,255,0.16)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", top: 10, left: 10, width: 26, height: 26, borderLeft: "2px solid rgba(125,205,255,0.85)", borderTop: "2px solid rgba(125,205,255,0.85)", boxShadow: "-1px -1px 12px rgba(80,170,255,0.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRight: "2px solid rgba(125,205,255,0.85)", borderTop: "2px solid rgba(125,205,255,0.85)", boxShadow: "1px -1px 12px rgba(80,170,255,0.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: 10, left: 10, width: 26, height: 26, borderLeft: "2px solid rgba(125,205,255,0.85)", borderBottom: "2px solid rgba(125,205,255,0.85)", boxShadow: "-1px 1px 12px rgba(80,170,255,0.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: 10, right: 10, width: 26, height: 26, borderRight: "2px solid rgba(125,205,255,0.85)", borderBottom: "2px solid rgba(125,205,255,0.85)", boxShadow: "1px 1px 12px rgba(80,170,255,0.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", left: 10, right: 10, top: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(130,210,255,0.55), transparent)", animation: "nxscan 9s linear infinite", pointerEvents: "none" }} />

        {/* Header */}
        <header style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
          <Logo size="sm" />
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid rgba(125,205,255,0.45)", borderRadius: 999, padding: "6px 12px", background: "rgba(18,54,108,0.45)", backdropFilter: "blur(8px)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.16em", color: "#bfe2ff", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
            Early access
          </div>
        </header>

        {/* Radar */}
        <LandingRadar />

        {/* Heading */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", flex: "none" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1.06, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,0.6)" }}>
            Discover people
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 2 }}>
            <div style={{ width: 44, height: 1, background: "linear-gradient(90deg, transparent, rgba(120,200,255,0.6))" }} />
            <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1.06, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,0.6)" }}>
              Nearby
            </div>
            <div style={{ width: 44, height: 1, background: "linear-gradient(90deg, rgba(120,200,255,0.6), transparent)" }} />
          </div>
          <p style={{ margin: "12px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, lineHeight: 1.75, letterSpacing: "0.19em", textTransform: "uppercase", color: "#a6cbec" }}>
            Who share your interests.<br />No followers. No pressure.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, marginTop: 16, flex: "none" }}>
          <div style={{ flex: 1, position: "relative", padding: "12px 0 11px", textAlign: "center", background: "linear-gradient(160deg, rgba(36,96,180,0.42), rgba(9,28,58,0.55))", border: "1px solid rgba(105,190,255,0.45)", boxShadow: "0 0 18px rgba(40,120,220,0.25)", clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)" }}>
            <div style={{ width: 36, height: 36, margin: "0 auto", borderRadius: "50%", background: "conic-gradient(#5cb2ff 0turn 0.68turn, rgba(150,200,255,0.14) 0.68turn 1turn)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a1e3a", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7fc8ff" }} />
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#7fc8ff", opacity: 0.7 }} />
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 27, lineHeight: 1, textShadow: "0 0 14px rgba(90,180,255,0.5)" }}>{counts.active_count}</div>
            <div style={{ marginTop: 5, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9, lineHeight: 1, letterSpacing: "0.17em", textTransform: "uppercase", color: "#a6cbec" }}>Active members</div>
          </div>
          <div style={{ flex: 1, position: "relative", padding: "12px 0 11px", textAlign: "center", background: "linear-gradient(160deg, rgba(120,70,180,0.34), rgba(9,28,58,0.55))", border: "1px solid rgba(180,140,255,0.45)", boxShadow: "0 0 18px rgba(120,80,220,0.22)", clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)" }}>
            <div style={{ width: 36, height: 36, margin: "0 auto", borderRadius: "50%", background: "conic-gradient(#ff9a3c 0turn 0.42turn, rgba(200,180,255,0.14) 0.42turn 1turn)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#160f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 9, height: 9, background: "#ffb35c", borderRadius: "2px 9px 2px 9px" }} />
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 27, lineHeight: 1, textShadow: "0 0 14px rgba(180,140,255,0.5)" }}>{counts.waitlist_count}</div>
            <div style={{ marginTop: 5, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9, lineHeight: 1, letterSpacing: "0.17em", textTransform: "uppercase", color: "#c4b3e8" }}>On the waitlist</div>
          </div>
        </div>

        {/* ZIP code checker */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "5px 5px 5px 14px", background: "rgba(8,26,54,0.72)", border: "1px solid rgba(105,190,255,0.4)", clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)", flex: "none" }}>
          <div aria-hidden="true" style={{ width: 15, height: 15, borderRadius: "50% 50% 50% 0", border: "1.5px solid #6fb8ff", transform: "rotate(-45deg)", flex: "none" }} />
          <input
            value={zip}
            onChange={(e) => { setZip(e.target.value); setZipMsg(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") checkZip(); }}
            placeholder="Your ZIP code"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 15, lineHeight: 1 }}
          />
          <button
            onClick={checkZip}
            style={{ flex: "none", height: 44, padding: "0 18px", border: 0, background: "linear-gradient(100deg, #1b5fe0, #3f9dff)", color: "#fff", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 12.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 18px rgba(60,150,255,0.55)", clipPath: "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)" }}
          >
            Check →
          </button>
        </div>
        <div role="status" aria-live="polite" style={{ position: "relative", zIndex: 1, minHeight: 16, marginTop: 6, textAlign: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, lineHeight: "16px", letterSpacing: "0.04em", color: "#8fb9e2", flex: "none" }}>
          {zipMsg}
        </div>

        {/* Location note */}
        <p style={{ position: "relative", zIndex: 1, margin: "4px 0 0", textAlign: "center", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9.5, lineHeight: 1.7, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8fb9e2", flex: "none" }}>
          NEX2 works best in dense areas —<br />we're starting in <span style={{ color: "#cfe8ff", background: "rgba(60,140,255,0.3)", border: "1px solid rgba(120,200,255,0.5)", padding: "1px 5px" }}>NYC</span> and expanding city by city.
        </p>

        {/* CTA buttons */}
        <button
          onClick={() => navigate("/register")}
          style={{ position: "relative", zIndex: 1, overflow: "hidden", width: "100%", height: 58, marginTop: 12, border: "1.5px solid transparent", borderRadius: 2, background: "linear-gradient(180deg, #0a1c3e, #071228) padding-box, linear-gradient(100deg, #3b6bff, #9b4dff 48%, #2fd4d4) border-box", color: "#fff", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 15.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "box-shadow 0.25s ease, transform 0.25s ease, filter 0.25s ease", boxShadow: "0 0 22px rgba(80,110,255,0.45), inset 0 0 22px rgba(70,120,255,0.28)", clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)", flex: "none" }}
        >
          <span aria-hidden="true" style={{ position: "absolute", top: -1, left: "50%", width: 70, height: 2, marginLeft: -35, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(190,220,255,0.95), rgba(255,255,255,0))", filter: "blur(0.5px)" }} />
          <span aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, width: 60, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.30), rgba(255,255,255,0))", animation: "nxsheen 4.5s ease-in-out infinite" }} />
          <span style={{ position: "relative" }}>Get started →</span>
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 44, marginTop: 10, background: "rgba(10,30,60,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(120,190,255,0.32)", color: "#bcd9f5", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11.5, lineHeight: 1, letterSpacing: "0.17em", textTransform: "uppercase", cursor: "pointer", clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)", flex: "none" }}
        >
          I already have an account ›
        </button>
      </main>
    </div>
    </ScaleToFit>
  );
}
