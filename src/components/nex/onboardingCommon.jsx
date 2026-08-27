import React from "react";

// Everything the phone and desktop onboarding screens both need, so the copy
// and the step vocabulary can only be changed in one place.

export const STEP_COUNT = 6;
export const BIO_MAX = 140;
export const DOCS = ["Driver licence", "Passport", "State ID"];
export const STEP_NAMES = ["Profile", "Interests", "Verify", "Visibility", "Location", "Done"];

/**
 * Flip to true once Stripe Identity is enabled on the account and
 * STRIPE_SECRET_KEY is set. It switches step 3 from the local placeholder
 * capture to the real hosted flow, and switches the copy with it — while
 * false the step must not claim a check took place.
 */
export const VERIFICATION_LIVE = false;

export const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
export const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";
export const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";

// The hosted flow leaves the app, so the half-filled profile has to survive
// the round trip.
export const DRAFT_KEY = "nex2_onboarding_draft";

export function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft) {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* private mode */ }
}

export function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* private mode */ }
}

export const VISIBILITY = [
  { value: "anonymous", label: "Anonymous", glyph: "◍", desc: "A fingerprint and a distance. No name, no photo, nothing traceable." },
  { value: "first_name", label: "First name only", glyph: "◑", desc: null },
  { value: "full_profile", label: "Full profile", glyph: "●", desc: "Username, age and bio are visible to anyone on your radar." },
];

// Step 3's wording depends on whether anything actually checks the document.
// `noun` differs by surface: the phone scans, the desktop uploads a file.
export const verifyCopy = (noun) => ({
  sub: VERIFICATION_LIVE
    ? `One ${noun} confirms you are a real person over 18. It is how NEX2 keeps the radar free of fakes.`
    : "NEX2 is 18+. Document checks are not switched on yet — skip this step and carry on.",
  privacy: VERIFICATION_LIVE
    ? "Your ID goes straight to our verification partner. NEX2 never receives or stores the image."
    : `Nothing you ${noun === "document" ? "choose" : "capture"} here is uploaded or stored anywhere.`,
  kept: VERIFICATION_LIVE
    ? "We keep only your verified age — never your name, address or document number."
    : "Skipping changes nothing today. You can verify from Settings once checks are on.",
  // The radar has no verified-only filter yet, so that half of the design's
  // promise is left out until it exists.
  callout: "Verified accounts get the blue check that shows next to your name.",
});

export const ARROW_BACK = (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
    <path d="M15 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ICON_SHIELD_CHECK = (
  <svg width="16" height="17" viewBox="0 0 17 18" fill="none" aria-hidden="true">
    <path d="M8.5 1.2l6.4 2.6v5.4c0 4-2.7 6.6-6.4 7.6-3.7-1-6.4-3.6-6.4-7.6V3.8l6.4-2.6z" stroke="#4dffb0" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5.8 9.2l2 2 3.6-3.9" stroke="#4dffb0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ICON_CLOCK = (
  <svg width="16" height="17" viewBox="0 0 17 18" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="7.3" stroke="#7fc8ff" strokeWidth="1.4" />
    <path d="M8.5 4.6v4.6l3 1.8" stroke="#7fc8ff" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const ICON_CHECK_RING = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <circle cx="10" cy="10" r="8.4" stroke="#4da6ff" strokeWidth="1.5" />
    <path d="M6 10.2l2.7 2.7 5.3-5.7" stroke="#4da6ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ICON_SEARCH = (
  <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="7.8" cy="7.8" r="6" stroke="#6fb8ff" strokeWidth="1.4" />
    <path d="M12.2 12.2l4 4" stroke="#6fb8ff" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const ICON_SHIELD = (
  <svg width="15" height="16" viewBox="0 0 17 18" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M8.5 1.2l6.4 2.6v5.4c0 4-2.7 6.6-6.4 7.6-3.7-1-6.4-3.6-6.4-7.6V3.8l6.4-2.6z" stroke="#4dffb0" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

export const ICON_TICK_SMALL = (
  <svg width="13" height="10" viewBox="0 0 16 13" fill="none" aria-hidden="true">
    <path d="M1 6.6l4.4 4.4L15 1.4" stroke="#bfe2ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The radar dial on step 5 and its sweep, shared by both layouts. */
export function LocationDial() {
  return (
    <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(50,135,255,.22) 0%, rgba(4,16,31,0) 70%)" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(115,195,255,.28)" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 38, borderRadius: "50%", border: "1px solid rgba(115,195,255,.2)" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(130,210,255,.3), rgba(130,210,255,0) 56%)", animation: "nxsweep 5s linear infinite" }} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,.42)", animation: "ob-ping 4s ease-out infinite" }} />
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" aria-hidden="true" style={{ position: "relative" }}>
        <path d="M17 40S32 25.5 32 16A15 15 0 0 0 2 16c0 9.5 15 24 15 24z" stroke="#7fc8ff" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="17" cy="15.6" r="5.4" fill="#7fc8ff" />
      </svg>
      {/* 78px, not the design's 76 — the label needs 77px once the 0.08em
          tracking is counted, so at 76 it wraps to two lines. */}
      <div style={{ position: "absolute", bottom: -6, left: "50%", marginLeft: -39, width: 78, textAlign: "center", whiteSpace: "nowrap", padding: "5px 0", background: "rgba(8,26,54,.9)", border: "1px solid rgba(105,190,255,.4)", font: "500 10px/1 var(--font-jetbrains)", letterSpacing: "0.08em", color: "#8fd0ff" }}>
        2 mi radius
      </div>
    </div>
  );
}

/** The tap-to-enter disc on step 6. */
export function EnterDisc({ onClick, saving }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      aria-label="Enter NEX2"
      style={{ position: "relative", width: 212, height: 212, padding: 0, border: 0, background: "transparent", cursor: saving ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}
    >
      <span aria-hidden="true" style={{ position: "absolute", inset: -26, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,150,255,.26) 0%, rgba(4,16,31,0) 70%)" }} />
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,.4)", animation: "ob-ping 3.4s ease-out infinite" }} />
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(150,220,255,.3)", animation: "ob-ping 3.4s ease-out 1.7s infinite" }} />
      <span aria-hidden="true" style={{ position: "absolute", inset: 14, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(160deg,#1f7bff,#0a3f9e)", boxShadow: "0 0 44px rgba(60,150,255,.6), inset 0 0 40px rgba(140,215,255,.28)" }}>
        <span style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(200,240,255,.34), rgba(200,240,255,0) 52%)", animation: "nxsweep 3.4s linear infinite" }} />
      </span>
      <span style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width="30" height="38" viewBox="0 0 26 34" fill="none" aria-hidden="true">
          <path d="M15.4 1L3 18.6h7.2L9.4 33 23 14.4h-7.8L15.4 1z" fill="#fff" />
        </svg>
        <span style={{ marginTop: 9, font: "700 21px/1 var(--font-chakra)", letterSpacing: "0.16em", color: "#fff" }}>NEX2</span>
        <span style={{ marginTop: 8, font: "600 9px/1 var(--font-chakra)", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,.72)" }}>
          {saving ? "Setting up…" : "Tap to enter"}
        </span>
      </span>
    </button>
  );
}

/** Username / Interests / Verified / Visibility, as shown on the last step. */
export function summaryRows({ username, interests, scanned, doc, visibility }) {
  return [
    ["Username", username.trim() || "Not set"],
    ["Interests", `${interests.length} picked`],
    ["Verified", VERIFICATION_LIVE && scanned ? doc : "Not verified"],
    ["Visibility", VISIBILITY.find((v) => v.value === visibility)?.label],
  ];
}
