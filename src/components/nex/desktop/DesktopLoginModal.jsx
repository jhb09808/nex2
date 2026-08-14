import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import VerifyEmailPanel from "@/components/nex/auth/VerifyEmailPanel";

/**
 * The desktop landing logs in through this panel rather than routing to
 * /login — the phone build still uses the full page.
 */
export default function DesktopLoginModal({ activeCount, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const firstField = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    firstField.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
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
      if (/verif/i.test(msg)) setNeedsVerify(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dkm" role="dialog" aria-modal="true" aria-labelledby="dkmLoginTitle">
      <button type="button" className="dkm-scrim" aria-label="Close" onClick={onClose} />

      <form onSubmit={submit} className="dkm-panel dk">
        <button type="button" className="dkm-x" aria-label="Close" onClick={onClose}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="dkm-eyebrow"><i />Log in</div>
        <h2 id="dkmLoginTitle">Welcome back</h2>
        {activeCount > 0 && <p className="dkm-lede">{activeCount} active users near you.</p>}
        <p className="dkm-hint" style={{ marginTop: 12 }}>
          Access is approved manually. If you requested access and haven't heard back, sign in to check your status.
        </p>

        {needsVerify && (
          <div style={{ marginTop: 18 }}>
            <VerifyEmailPanel email={email} onCancel={() => { setNeedsVerify(false); setError(""); }} />
          </div>
        )}

        {error && !needsVerify && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(120,20,20,.3)", border: "1px solid rgba(255,80,80,.3)", color: "#ff8a80", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, textAlign: "center" }}>
            {error}
          </div>
        )}

        <div className="dkm-group">
          <div className="dkm-label"><label htmlFor="dkmEmail">Email</label></div>
          <div className="dkm-box dk-notch">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
              <rect x=".8" y=".8" width="16.4" height="12.4" stroke="#6fb8ff" strokeWidth="1.3" />
              <path d="M1.4 1.6 9 7.6l7.6-6" stroke="#6fb8ff" strokeWidth="1.3" />
            </svg>
            <input ref={firstField} id="dkmEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </div>
        </div>

        <div className="dkm-group">
          <div className="dkm-label">
            <label htmlFor="dkmPass">Password</label>
            <Link to="/forgot-password" className="dkm-toggle">Forgot?</Link>
          </div>
          <div className="dkm-box dk-notch">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true" style={{ flex: "none" }}>
              <rect x=".8" y="7.2" width="14.4" height="10" stroke="#6fb8ff" strokeWidth="1.3" />
              <path d="M4 7.2V4.8a4 4 0 0 1 8 0v2.4" stroke="#6fb8ff" strokeWidth="1.3" />
            </svg>
            <input id="dkmPass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required />
          </div>
        </div>

        <button type="submit" className="dkm-btn" disabled={loading}>
          <span aria-hidden="true" className="dkm-btn-top" />
          <span aria-hidden="true" className="dkm-btn-sheen" />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Logging in" : "Log in →"}
          </span>
        </button>

        <div className="dkm-rule"><i />or<i /></div>

        <button type="button" className="dkm-google" onClick={() => base44.auth.loginWithProvider("google", "/map")}>
          <GoogleIcon className="w-[18px] h-[18px]" />
          Continue with Google
        </button>
      </form>
    </div>
  );
}
