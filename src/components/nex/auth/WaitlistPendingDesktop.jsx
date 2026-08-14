import React from "react";
import DesktopFrame from "@/components/nex/desktop/DesktopFrame";

const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/37125597e_NEX2.png";

const SCRIMS = [
  "linear-gradient(180deg, rgba(2,8,18,.72) 0%, rgba(2,8,18,.86) 46%, rgba(2,7,16,.94) 100%)",
  "radial-gradient(58% 52% at 50% 36%, rgba(45,130,255,.20), rgba(2,7,16,0) 70%)",
];

const CLOCK_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10.2" stroke="#ffb454" strokeWidth="2" />
    <path d="M12 6.6V12l4 2.6" stroke="#ffb454" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const CHECK_ICON = (
  <svg width="15" height="13" viewBox="0 0 26 20" fill="none" aria-hidden="true">
    <path d="M2 10.5l7.5 7.5L24 2" stroke="#4dffb0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const INFO_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10.2" stroke="#8fd0ff" strokeWidth="2" />
    <path d="M12 7.4v.01M12 11v5.6" stroke="#8fd0ff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Result tones, keyed the same way the mobile screen keys its status copy.
const TONES = {
  pending: { bg: "rgba(64,44,12,.42)", border: "rgba(255,180,84,.34)", color: "#ffd9a0", icon: CLOCK_ICON, msg: "Still in review — we'll email you as soon as your area opens." },
  waitlisted: { bg: "rgba(64,44,12,.42)", border: "rgba(255,180,84,.34)", color: "#ffd9a0", icon: CLOCK_ICON, msg: "You're on the waitlist. You'll get an email the moment you're approved." },
  approved: { bg: "rgba(20,72,52,.42)", border: "rgba(77,255,176,.36)", color: "#a8f0cd", icon: CHECK_ICON, msg: "You're approved. Log out and sign back in to enter NEX2." },
  active: { bg: "rgba(20,72,52,.42)", border: "rgba(77,255,176,.36)", color: "#a8f0cd", icon: CHECK_ICON, msg: "You're approved. Log out and sign back in to enter NEX2." },
  rejected: { bg: "rgba(20,54,104,.42)", border: "rgba(120,200,255,.3)", color: "#bcd9f5", icon: INFO_ICON, msg: "This email wasn't approved for access." },
  not_found: { bg: "rgba(20,54,104,.42)", border: "rgba(120,200,255,.3)", color: "#bcd9f5", icon: INFO_ICON, msg: "No request found for that email. Check the spelling, or request access from the landing page." },
  invalid: { bg: "rgba(20,54,104,.42)", border: "rgba(120,200,255,.3)", color: "#bcd9f5", icon: INFO_ICON, msg: "Enter a valid email address." },
};

const STATUS_LABEL = {
  pending: "Pending review",
  waitlisted: "On the waitlist",
  approved: "Approved",
  active: "Approved",
  rejected: "Not approved",
  not_found: "No request found",
};

const LABEL_TONE = { approved: "#4dffb0", active: "#4dffb0", rejected: "#ff9a9a" };

function Row({ label, children }) {
  return (
    <>
      <dt className="dk-dt">{label}</dt>
      <dd className="dk-dd">{children}</dd>
    </>
  );
}

export default function WaitlistPendingDesktop({ email, message, checkEmail, setCheckEmail, status, checking, onCheck, onLogout, details }) {
  const tone = status ? TONES[status] || TONES.not_found : null;
  const statusLabel = STATUS_LABEL[status] || "Pending review";

  return (
    <DesktopFrame background="radial-gradient(80% 80% at 50% 34%, #0d2a58 0%, #061428 46%, #020710 100%)" scrims={SCRIMS}>
      {/* Header */}
      <header style={{ position: "relative", flex: "none", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(22px,3.2vh,44px) var(--pad) 0" }}>
        <img src={LOGO_URL} alt="NEX2" style={{ display: "block", width: 124, height: 20, filter: "drop-shadow(0 0 10px rgba(90,180,255,.75))" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.04em", color: "#7fa9d4" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb454", boxShadow: "0 0 8px #ffb454", animation: "nxglow 2.4s ease-in-out infinite" }} />
            Signed in as <span style={{ color: "#bfe2ff" }}>{email}</span>
          </div>
          <button type="button" onClick={onLogout} className="dk-ghost dk-notch-sm">Sign out</button>
        </div>
      </header>

      <main style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vh,28px) var(--pad)", overflow: "hidden" }}>
        <div style={{ width: "min(560px, 100%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", animation: "nxrise .4s cubic-bezier(.16,1,.3,1)" }}>
          {/* Badge */}
          <div className="dk-notch-lg" style={{ position: "relative", flex: "none", width: "clamp(76px,7vw,92px)", height: "clamp(76px,7vw,92px)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,54,104,.5)", border: "1px solid rgba(120,200,255,.4)", boxShadow: "0 0 32px rgba(60,150,255,.26)" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "1px solid rgba(150,220,255,.4)", animation: "nxping 3.6s ease-out infinite" }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "1px solid rgba(150,220,255,.3)", animation: "nxping 3.6s ease-out 1.8s infinite" }} />
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10.2" stroke="#8fd0ff" strokeWidth="1.8" />
              <path d="M12 6.4V12l4.2 2.8" stroke="#8fd0ff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "clamp(18px,2.6vh,30px)", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, lineHeight: 1, letterSpacing: "0.24em", textTransform: "uppercase", color: "#7fa9d4" }}>
            <span style={{ width: 32, height: 1, background: "linear-gradient(90deg, rgba(120,200,255,.1), rgba(120,200,255,.7))" }} />
            Waitlist
            <span style={{ width: 32, height: 1, background: "linear-gradient(90deg, rgba(120,200,255,.7), rgba(120,200,255,.1))" }} />
          </div>

          <h1 style={{ margin: "clamp(10px,1.6vh,18px) 0 0", fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(32px,3.6vw,52px)", lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 34px rgba(90,180,255,.5)" }}>
            Access pending
          </h1>

          <p style={{ margin: "clamp(12px,1.8vh,20px) 0 0", maxWidth: 452, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: "clamp(13.5px,1vw,15.5px)", lineHeight: 1.65, letterSpacing: "0.01em", color: "#a6cbec" }}>
            {message || "Your request is in review. We approve accounts as density builds in each area, so a city with more members opens sooner. You'll get an email the moment you're in — nothing else is needed from you."}
          </p>

          {/* Request summary */}
          <div className="dk-notch-lg" style={{ width: "100%", marginTop: "clamp(20px,3vh,34px)", padding: "clamp(16px,2vh,22px) clamp(18px,2vw,26px)", background: "rgba(6,20,42,.78)", border: "1px solid rgba(105,190,255,.24)", textAlign: "left" }}>
            <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>Your request</div>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "11px 20px", margin: "14px 0 0" }}>
              <Row label="Email">{email}</Row>
              {details?.location && <Row label="Location">{details.location}</Row>}
              {details?.requested && <Row label="Requested">{details.requested}</Row>}
              <dt className="dk-dt">Status</dt>
              <dd style={{ margin: 0, textAlign: "right", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11.5, lineHeight: 1.5, letterSpacing: "0.14em", textTransform: "uppercase", color: LABEL_TONE[status] || "#ffc46b" }}>
                {statusLabel}
              </dd>
            </dl>
          </div>

          {/* Check by email */}
          <div style={{ width: "100%", marginTop: "clamp(18px,2.6vh,28px)", paddingTop: "clamp(16px,2.2vh,24px)", borderTop: "1px solid rgba(105,190,255,.16)", textAlign: "left" }}>
            <label htmlFor="statusEmail" style={{ display: "block", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>
              Check status by email
            </label>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <div className="dk-notch" style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 11, height: 52, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.4)" }}>
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                  <rect x=".8" y=".8" width="16.4" height="12.4" stroke="#6fb8ff" strokeWidth="1.3" />
                  <path d="M1.4 1.6 9 7.6l7.6-6" stroke="#6fb8ff" strokeWidth="1.3" />
                </svg>
                <input
                  id="statusEmail"
                  type="email"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onCheck(); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 15, lineHeight: 1 }}
                />
              </div>
              <button
                type="button"
                onClick={onCheck}
                disabled={checking || !checkEmail.trim()}
                className="dk-ghost dk-notch-sm"
                style={{ flex: "none", height: 52, padding: "0 clamp(16px,1.6vw,26px)", fontSize: 12, letterSpacing: "0.16em", opacity: checking || !checkEmail.trim() ? 0.4 : 1 }}
              >
                {checking ? "Checking" : "Check"}
              </button>
            </div>

            {tone && (
              <div className="dk-notch-sm" style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 12, padding: "13px 15px", background: tone.bg, border: `1px solid ${tone.border}`, animation: "nxfade .22s ease" }}>
                <span style={{ flex: "none", marginTop: 1, display: "flex" }}>{tone.icon}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.5, letterSpacing: "0.02em", color: tone.color }}>{tone.msg}</span>
              </div>
            )}
          </div>

          <button type="button" onClick={onLogout} className="dk-ghost dk-notch-sm dk-signout2" style={{ alignSelf: "center", height: 48, marginTop: "clamp(18px,2.6vh,30px)", padding: "0 26px", border: "1px solid rgba(120,190,255,.24)", background: "transparent", backdropFilter: "none", color: "#8fb9e2", letterSpacing: "0.18em" }}>
            Sign out
          </button>
        </div>
      </main>

      <footer style={{ position: "relative", flex: "none", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "0 var(--pad) clamp(20px,3vh,44px)", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.08em", color: "#5f89b2" }}>
        <span>
          Questions about your request?{" "}
          <a href="mailto:hello@nex2.app" style={{ textDecoration: "none", borderBottom: "1px solid rgba(127,200,255,.35)", paddingBottom: 2 }}>hello@nex2.app</a>
        </span>
        <span>© 2026 NEX2, Inc.</span>
      </footer>
    </DesktopFrame>
  );
}
