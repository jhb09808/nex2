import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import VerifyEmailPanel from "@/components/nex/auth/VerifyEmailPanel";

const BG_IMAGE = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/6b451b6af_login_bg.png";
const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/37125597e_NEX2.png";

const CLIP_INPUT = "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)";
const CLIP_CTA = "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)";
const CLIP_GOOGLE = "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has("returnTo")) {
        url.searchParams.set("returnTo", "/map");
        window.history.replaceState({}, "", url.toString());
      }
      await base44.auth.loginViaEmailPassword(email, password);
    } catch (err) {
      const msg = err.message || "Invalid email or password";
      setError(msg);
      // Unverified account → surface the code entry right here instead of a dead end.
      if (/verif/i.test(msg)) setNeedsVerify(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/map");
  };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", width: "100%", display: "flex", justifyContent: "center", background: "#020710" }}>
      <main
        style={{
          position: "relative",
          minHeight: "100dvh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "calc(24px + env(safe-area-inset-top, 0px)) 22px calc(28px + env(safe-area-inset-bottom, 0px))",
          background: "radial-gradient(120% 55% at 50% 4%, #0d2a58 0%, #061428 42%, #020710 100%)",
        }}
      >
        {/* Background image + overlays */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src={BG_IMAGE} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(3,11,26,.52) 0%, rgba(3,11,26,.74) 28%, rgba(2,8,18,.90) 52%, rgba(2,7,16,.96) 74%, #020710 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 46% at 50% 6%, rgba(45,130,255,.22), rgba(2,7,16,0) 62%)" }} />
        </div>

        {/* Cyber frame border */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 10, border: "1px solid rgba(86,180,255,.16)", pointerEvents: "none" }} />
        {/* Corner brackets */}
        <div aria-hidden="true" style={{ position: "absolute", top: 10, left: 10, width: 26, height: 26, borderLeft: "2px solid rgba(125,205,255,.85)", borderTop: "2px solid rgba(125,205,255,.85)", boxShadow: "-1px -1px 12px rgba(80,170,255,.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRight: "2px solid rgba(125,205,255,.85)", borderTop: "2px solid rgba(125,205,255,.85)", boxShadow: "1px -1px 12px rgba(80,170,255,.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: 10, left: 10, width: 26, height: 26, borderLeft: "2px solid rgba(125,205,255,.85)", borderBottom: "2px solid rgba(125,205,255,.85)", boxShadow: "-1px 1px 12px rgba(80,170,255,.6)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: 10, right: 10, width: 26, height: 26, borderRight: "2px solid rgba(125,205,255,.85)", borderBottom: "2px solid rgba(125,205,255,.85)", boxShadow: "1px 1px 12px rgba(80,170,255,.6)", pointerEvents: "none" }} />
        {/* Scan line */}
        <div aria-hidden="true" style={{ position: "absolute", left: 10, right: 10, top: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(130,210,255,.55), transparent)", animation: "nxscan 9s linear infinite", pointerEvents: "none" }} />

        {/* Radar circles */}
        <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: -190, width: 420, height: 420, marginLeft: -210, borderRadius: "50%", border: "1px solid rgba(115,195,255,.16)", overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(130,210,255,.14), rgba(130,210,255,0) 46%)", animation: "nxsweep 7s linear infinite" }} />
        </div>
        <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: -130, width: 300, height: 300, marginLeft: -150, borderRadius: "50%", border: "1px solid rgba(115,195,255,.12)", pointerEvents: "none" }} />

        {/* Header */}
        <header style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/welcome">
            <img src={LOGO_URL} alt="NEX2" style={{ display: "block", width: 96, height: 15.5, filter: "drop-shadow(0 0 8px rgba(90,180,255,.75))" }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid rgba(125,205,255,.45)", borderRadius: 999, padding: "6px 12px", background: "rgba(18,54,108,.45)", backdropFilter: "blur(8px)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.16em", color: "#bfe2ff", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
            Early access
          </div>
        </header>

        {/* Back link */}
        <Link to="/welcome" style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 9, alignSelf: "flex-start", height: 44, marginTop: 12, color: "#8fb9e2", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
            <path d="M15 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1.04, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,.55)" }}>
              Welcome back
            </h1>
            <p style={{ margin: "12px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, lineHeight: 1.7, letterSpacing: "0.17em", textTransform: "uppercase", color: "#a6cbec" }}>
              Log in to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(120,20,20,.3)", border: "1px solid rgba(255,80,80,.3)", borderRadius: 8, color: "#ff8a80", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, textAlign: "center" }}>
              {error}
            </div>
          )}

          {needsVerify && (
            <VerifyEmailPanel
              email={email}
              onCancel={() => { setNeedsVerify(false); setError(""); }}
            />
          )}

          {/* Email */}
          <div style={{ marginTop: 26, display: needsVerify ? "none" : "block" }}>
            <label htmlFor="email" style={{ display: "block", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>Email</label>
            <div style={{ display: "flex", alignItems: "center", gap: 11, height: 52, marginTop: 9, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.4)", clipPath: CLIP_INPUT }}>
              <svg width="17" height="13" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                <rect x=".8" y=".8" width="16.4" height="12.4" stroke="#6fb8ff" strokeWidth="1.3" />
                <path d="M1.4 1.6 9 7.6l7.6-6" stroke="#6fb8ff" strokeWidth="1.3" />
              </svg>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 15 }}
              />
            </div>
          </div>

          {!needsVerify && (
          <>
          {/* Password */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <label htmlFor="pass" style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>Password</label>
              <Link to="/forgot-password" style={{ display: "flex", alignItems: "center", height: 44, margin: "-16px 0", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6f9dc8", textDecoration: "none" }}>
                Forgot?
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, height: 52, marginTop: 9, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.4)", clipPath: CLIP_INPUT }}>
              <svg width="15" height="17" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                <rect x=".8" y="7.2" width="14.4" height="10" stroke="#6fb8ff" strokeWidth="1.3" />
                <path d="M4 7.2V4.8a4 4 0 0 1 8 0v2.4" stroke="#6fb8ff" strokeWidth="1.3" />
              </svg>
              <input
                id="pass"
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 15, letterSpacing: "0.06em" }}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              height: 58,
              marginTop: 24,
              border: "1.5px solid transparent",
              borderRadius: 2,
              background: "linear-gradient(180deg, #0a1c3e, #071228) padding-box, linear-gradient(100deg, #3b6bff, #9b4dff 48%, #2fd4d4) border-box",
              color: "#fff",
              fontFamily: "var(--font-chakra)",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: loading || !email.trim() || !password.trim() ? "not-allowed" : "pointer",
              transition: "box-shadow .25s ease, transform .25s ease, filter .25s ease",
              boxShadow: "0 0 22px rgba(80,110,255,.45), inset 0 0 22px rgba(70,120,255,.28)",
              clipPath: CLIP_CTA,
              opacity: loading || !email.trim() || !password.trim() ? 0.4 : 1,
            }}
          >
            {!loading && (
              <>
                <span aria-hidden="true" style={{ position: "absolute", top: -1, left: "50%", width: 70, height: 2, marginLeft: -35, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(190,220,255,.95), rgba(255,255,255,0))", filter: "blur(.5px)" }} />
                <span aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, width: 60, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.30), rgba(255,255,255,0))", animation: "nxsheen 4.5s ease-in-out infinite" }} />
              </>
            )}
            <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log in →"}
            </span>
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(120,200,255,0), rgba(120,200,255,.28))" }} />
            <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "#6f9dc8" }}>or</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(120,200,255,.28), rgba(120,200,255,0))" }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 11,
              width: "100%",
              height: 52,
              marginTop: 20,
              border: "1px solid rgba(120,190,255,.32)",
              background: "rgba(10,30,60,.5)",
              backdropFilter: "blur(8px)",
              color: "#dceeff",
              fontFamily: "var(--font-chakra)",
              fontWeight: 600,
              fontSize: 12.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color .2s ease, background .2s ease",
              clipPath: CLIP_GOOGLE,
            }}
          >
            <GoogleIcon className="w-[17px] h-[17px]" />
            Continue with Google
          </button>

          {/* Sign up */}
          <div style={{ textAlign: "center", marginTop: 22, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8fb9e2" }}>
            New here?{" "}
            <Link to="/register" style={{ color: "#7fc8ff", textDecoration: "none", borderBottom: "1px solid rgba(127,200,255,.4)", paddingBottom: 2 }}>
              Create an account
            </Link>
          </div>
          </>
          )}
        </form>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(105,190,255,.14)", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9, letterSpacing: "0.12em", color: "#5f89b2" }}>
          © 2026 NEX2, Inc. All rights reserved.
        </div>
      </main>
    </div>
  );
}