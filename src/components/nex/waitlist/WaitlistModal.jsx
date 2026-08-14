import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import Portal from "@/components/nex/Portal";

const CLIP = "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)";

const label = { display: "block", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" };
const field = { display: "flex", alignItems: "center", height: 50, marginTop: 8, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.4)", clipPath: CLIP };
const input = { flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 15 };

export default function WaitlistModal({ onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [intl, setIntl] = useState(false);
  const [where, setWhere] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { status, has_account, already }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const join = await base44.functions.invoke("joinWaitlist", {
        email,
        ...(intl ? { is_international: true, international_location: where } : { zip_code: zip }),
      });
      if (!join.data.success) {
        setError(join.data.error || "Something went wrong.");
        return;
      }
      const check = await base44.functions.invoke("checkWaitlistApproval", { email });
      setResult({
        status: check.data.approved ? "approved" : check.data.status,
        has_account: check.data.has_account,
        already: join.data.already_registered === true,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const view = (() => {
    if (!result) return null;
    if (result.status === "approved") {
      return result.has_account
        ? { Icon: CheckCircle2, tone: "#4dffb0", title: "You're approved", body: "You already have an account — just log in to jump onto the radar.", cta: "Log in", onCta: () => navigate("/login") }
        : { Icon: CheckCircle2, tone: "#4dffb0", title: "You're approved", body: "Create your account and you're straight onto the radar.", cta: "Create account", onCta: () => navigate("/register") };
    }
    if (result.status === "rejected") {
      return { Icon: XCircle, tone: "#ff7a7a", title: "Not approved", body: "This email wasn't approved for access." };
    }
    return {
      Icon: Clock,
      tone: "#ffb454",
      title: result.already ? "Already on the waitlist" : "You're on the waitlist",
      body: "You haven't been approved yet. We'll email you the moment you're in.",
    };
  })();

  return (
    <Portal>
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(1,5,12,.82)", backdropFilter: "blur(10px)", overflowY: "auto" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 380, padding: 22, background: "linear-gradient(165deg, rgba(14,40,80,.92), rgba(6,18,38,.96))", border: "1px solid rgba(105,190,255,.4)", boxShadow: "0 0 40px rgba(40,120,220,.28)", clipPath: "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#8fb9e2", cursor: "pointer" }}>
            <X style={{ width: 17, height: 17 }} />
          </button>

          {view ? (
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <div style={{ width: 54, height: 54, margin: "0 auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${view.tone}1f`, border: `1px solid ${view.tone}59` }}>
                <view.Icon style={{ width: 24, height: 24, color: view.tone }} />
              </div>
              <h2 style={{ margin: "16px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 22, letterSpacing: "0.02em", textTransform: "uppercase", color: "#fff" }}>{view.title}</h2>
              <p style={{ margin: "10px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, lineHeight: 1.7, color: "#a6cbec" }}>{view.body}</p>
              {view.cta && (
                <button onClick={view.onCta} style={{ width: "100%", height: 52, marginTop: 20, border: 0, background: "linear-gradient(100deg, #1b5fe0, #3f9dff)", color: "#fff", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 18px rgba(60,150,255,.5)", clipPath: CLIP }}>
                  {view.cta} →
                </button>
              )}
              <button onClick={onClose} style={{ width: "100%", height: 44, marginTop: 8, border: 0, background: "transparent", color: "rgba(139,185,226,.75)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 style={{ margin: "6px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 24, letterSpacing: "0.02em", textTransform: "uppercase", color: "#fff", textShadow: "0 0 18px rgba(90,180,255,.5)" }}>Join the<br />waitlist</h2>
              <p style={{ margin: "10px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 10.5, lineHeight: 1.7, letterSpacing: "0.16em", textTransform: "uppercase", color: "#a6cbec" }}>
                Already on it? Enter your email to see your status.
              </p>

              {error && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(120,20,20,.3)", border: "1px solid rgba(255,80,80,.3)", color: "#ff8a80", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, textAlign: "center" }}>{error}</div>
              )}

              <div style={{ marginTop: 18 }}>
                <label htmlFor="wl-email" style={label}>Email</label>
                <div style={field}>
                  <input id="wl-email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" style={input} />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label htmlFor="wl-loc" style={label}>{intl ? "City / country" : "ZIP code"}</label>
                <div style={field}>
                  {intl ? (
                    <input id="wl-loc" required value={where} onChange={(e) => setWhere(e.target.value)} placeholder="London, UK" style={input} />
                  ) : (
                    <input id="wl-loc" required inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} placeholder="10001" autoComplete="postal-code" style={input} />
                  )}
                </div>
                <button type="button" onClick={() => { setIntl((s) => !s); setError(""); }} style={{ height: 36, marginTop: 4, border: 0, background: "transparent", color: "#7fc8ff", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}>
                  {intl ? "I'm in the US" : "I'm outside the US"}
                </button>
              </div>

              <button type="submit" disabled={loading} style={{ width: "100%", height: 56, marginTop: 14, border: "1.5px solid transparent", background: "linear-gradient(180deg, #0a1c3e, #071228) padding-box, linear-gradient(100deg, #3b6bff, #9b4dff 48%, #2fd4d4) border-box", color: "#fff", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 0 22px rgba(80,110,255,.45), inset 0 0 22px rgba(70,120,255,.28)", clipPath: CLIP, opacity: loading ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : "Continue →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </Portal>
  );
}