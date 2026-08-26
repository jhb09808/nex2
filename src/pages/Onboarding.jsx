import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { INTEREST_CATEGORIES } from "@/components/nex/radar/interestCategories";
import { MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";
import wordmark from "@/assets/wordmark.webp";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";

const STEP_COUNT = 6;
const BIO_MAX = 140;
const DOCS = ["Driver licence", "Passport", "State ID"];

/**
 * Flip to true when the verification provider's webhook is live and actually
 * writes verification_method: "id_verified". Until then step 3 captures a
 * frame that nothing inspects, so it must not claim a check took place.
 */
const VERIFICATION_LIVE = false;

const VISIBILITY = [
  { value: "anonymous", label: "Anonymous", glyph: "◍", desc: "A fingerprint and a distance. No name, no photo, nothing traceable." },
  { value: "first_name", label: "First name only", glyph: "◑", desc: null },
  { value: "full_profile", label: "Full profile", glyph: "●", desc: "Username, age and bio are visible to anyone on your radar." },
];

const ARROW_BACK = (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
    <path d="M15 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Wordmark = () => <img src={wordmark} alt="NEX2" style={{ display: "block", width: 64, height: 10.3, opacity: 0.65 }} />;

function Frame() {
  const corner = (pos) => ({ position: "absolute", width: 20, height: 20, pointerEvents: "none", zIndex: 5, ...pos });
  const C = "1.5px solid rgba(125,205,255,.55)";
  return (
    <>
      <div aria-hidden="true" style={{ position: "absolute", inset: 8, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={corner({ top: 8, left: 8, borderLeft: C, borderTop: C })} />
      <div aria-hidden="true" style={corner({ top: 8, right: 8, borderRight: C, borderTop: C })} />
      <div aria-hidden="true" style={corner({ bottom: 8, left: 8, borderLeft: C, borderBottom: C })} />
      <div aria-hidden="true" style={corner({ bottom: 8, right: 8, borderRight: C, borderBottom: C })} />
    </>
  );
}

function Header({ step }) {
  return (
    <>
      <div className="ob-rail">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <i key={i} {...(i + 1 < step ? { "data-done": "" } : {})} {...(i + 1 === step ? { "data-now": "" } : {})} />
        ))}
      </div>
      <div className="ob-meta">
        <span className="ob-step-n">Step {step} of {STEP_COUNT}</span>
        <Wordmark />
      </div>
    </>
  );
}

function Nav({ step, onBack, onNext, label, disabled }) {
  return (
    <div className="ob-nav">
      {step > 1 && (
        <button className="ob-back" style={{ clipPath: NOTCH }} aria-label="Back" onClick={onBack}>{ARROW_BACK}</button>
      )}
      <button className="ob-next" style={{ clipPath: NOTCH }} onClick={onNext} disabled={disabled}>
        {!disabled && <span className="sheen" aria-hidden="true" />}
        <span style={{ position: "relative" }}>{label}</span>
      </button>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [nameState, setNameState] = useState("");

  const [interests, setInterests] = useState([]);
  const [query, setQuery] = useState("");
  const [openCat, setOpenCat] = useState(null);

  const [doc, setDoc] = useState(DOCS[0]);
  const [scanned, setScanned] = useState(false);
  // "live" puts the camera in the frame; the file input is only a fallback for
  // when there is no camera or permission was refused.
  const [cam, setCam] = useState("idle");
  const scanInput = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [visibility, setVisibility] = useState("full_profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Availability is a real lookup, debounced — the design only checks length.
  useEffect(() => {
    const value = username.trim();
    if (!value) { setNameState(""); return; }
    if (value.length < 3) { setNameState("Too short"); return; }
    setNameState("Checking…");
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const existing = await base44.entities.UserProfile.filter({ username: value });
        if (!cancelled) setNameState(existing.length > 0 ? "Taken" : "Available");
      } catch {
        if (!cancelled) setNameState("");
      }
    }, 450);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username]);

  const firstName = (username.trim() || "Alex").split(" ")[0];
  const atMax = interests.length >= MAX_INTEREST_SELECTIONS;

  const toggleInterest = (id) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_INTEREST_SELECTIONS ? [...prev, id] : prev));
  };

  // Categories keep their grouping while searching; a category with matches opens.
  const cats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEREST_CATEGORIES.map((c) => {
      const shown = q
        ? c.subInterests.filter((s) => s.name.toLowerCase().includes(q) || (s.aliases || []).some((a) => a.toLowerCase().includes(q)))
        : c.subInterests;
      return {
        ...c,
        shown,
        mine: c.subInterests.filter((s) => interests.includes(s.id)).length,
        open: q ? shown.length > 0 : openCat === c.id,
      };
    });
  }, [query, interests, openCat]);

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      const existing = await base44.entities.UserProfile.filter({ username: username.trim() });
      if (existing.length > 0) {
        setError("Username taken — try another");
        setStep(1);
        return;
      }
      const allUsers = await base44.entities.UserProfile.list("created_date", 500);
      const realUserCount = allUsers.filter((u) => !String(u.created_by_id).startsWith("service_")).length;
      await base44.entities.UserProfile.create({
        username: username.trim(),
        user_number: realUserCount + 1,
        age: parseInt(age, 10),
        bio,
        interests,
        visibility,
        onboarding_complete: true,
        radar_onboarding_complete: true,
        radar_filter_interests: interests,
        is_online: true,
        badges: [],
        blocked_users: [],
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
        // Stays self_attested until a verification provider is wired into
        // runIdCheck below — nothing has actually inspected a document.
        verification_method: "self_attested",
      });
      navigate("/map");
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not finish setting up. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // The frame is a live viewfinder while step 3 is on screen. Leaving the step
  // — forward, back or by unmounting — releases the camera immediately.
  useEffect(() => {
    if (step !== 3) { stopCamera(); return undefined; }
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setCam("unsupported"); return; }
      setCam("starting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCam("live");
      } catch {
        if (!cancelled) setCam("denied");
      }
    })();
    return () => { cancelled = true; stopCamera(); };
  }, [step]);

  /**
   * Grabs the current viewfinder frame. The image lives only as a canvas blob
   * for the length of this call — it is never uploaded, stored or attached to
   * the profile.
   *
   * TODO: hand `image` to the verification provider here and use its verdict to
   * set verification_method. Until then no document is inspected, so nothing
   * about the user's age or identity is confirmed by this step.
   */
  const runIdCheck = async (image) => {
    if (!image) return;
    setScanned(true);
    stopCamera();
    setStep((s) => s + 1);
  };

  const captureFrame = async () => {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    await runIdCheck(blob);
  };

  const canProceed = () => {
    if (step === 1) return username.trim().length >= 3 && parseInt(age, 10) >= 18 && nameState !== "Taken";
    if (step === 2) return interests.length >= MIN_INTEREST_SELECTIONS;
    return true;
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      // Advance either way — a denial must not dead-end onboarding.
      navigator.geolocation.getCurrentPosition(() => setStep(6), () => setStep(6), { timeout: 8000 });
    } else {
      setStep(6);
    }
  };

  const back = () => setStep((s) => Math.max(1, s - 1));
  const next = () => setStep((s) => Math.min(STEP_COUNT, s + 1));

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "calc(14px + env(safe-area-inset-top, 0px)) 20px calc(16px + env(safe-area-inset-bottom, 0px))",
        boxSizing: "border-box",
        background: "radial-gradient(120% 42% at 50% 0%, #0b2650 0%, #051426 44%, #01060e 100%)",
        color: "#dceeff",
        fontFamily: "var(--font-chakra)",
      }}
    >
      <Frame />

      {/* Step 1 — profile */}
      {step === 1 && (
        <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Header step={1} />
          <div style={{ position: "relative", zIndex: 2, marginTop: 22 }}>
            <h1 className="ob-h1">Create your profile</h1>
            <p className="ob-sub">Your username is what people see. Everything else stays private until you say otherwise.</p>
          </div>

          <div className="ob-pad" style={{ marginTop: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <label className="ob-lbl" htmlFor="obUser">Username</label>
                <span className="ob-mono" style={{ color: nameState === "Taken" ? "#ff8a80" : nameState === "Available" ? "#7de0b0" : "#5f89b2" }}>{nameState}</span>
              </div>
              <input id="obUser" className="ob-fld" style={{ clipPath: NOTCH }} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a unique username" autoComplete="off" />
            </div>

            <div style={{ marginTop: 18 }}>
              <label className="ob-lbl" htmlFor="obAge" style={{ display: "block" }}>Age</label>
              <input id="obAge" className="ob-fld" style={{ clipPath: NOTCH }} value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Must be 18+" inputMode="numeric" />
              {age && parseInt(age, 10) < 18 && (
                <p style={{ margin: "8px 0 0", font: "400 11px/1.5 var(--font-chakra)", color: "#ff8a80" }}>You must be 18 or older to use NEX2.</p>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <label className="ob-lbl" htmlFor="obBio">Bio</label>
                <span className="ob-mono" style={{ color: bio.length > 125 ? "#ffb454" : "#5f89b2" }}>{bio.length}/{BIO_MAX}</span>
              </div>
              <textarea id="obBio" className="ob-fld" style={{ clipPath: NOTCH }} maxLength={BIO_MAX} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short intro — what you are into, what you would say yes to." />
            </div>

            {error && <p style={{ margin: "14px 0 0", font: "400 12px/1.5 var(--font-chakra)", color: "#ff8a80" }}>{error}</p>}
          </div>

          <p style={{ position: "relative", zIndex: 2, margin: "14px 0 0", font: "400 11px/1.5 var(--font-chakra)", color: "#5f89b2" }}>
            You can change any of this later in Settings.
          </p>
          <Nav step={1} onNext={next} label="Continue →" disabled={!canProceed()} />
        </section>
      )}

      {/* Step 2 — interests */}
      {step === 2 && (
        <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Header step={2} />
          <div style={{ position: "relative", zIndex: 2, marginTop: 22 }}>
            <h1 className="ob-h1">Pick your interests</h1>
            <p className="ob-sub">These are what the radar matches on. Pick at least {MIN_INTEREST_SELECTIONS}.</p>
          </div>

          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.28)", clipPath: NOTCH }}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="7.8" cy="7.8" r="6" stroke="#6fb8ff" strokeWidth="1.4" />
                <path d="M12.2 12.2l4 4" stroke="#6fb8ff" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                id="obQuery"
                aria-label="Search interests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search interests"
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", font: "500 14px/1 var(--font-chakra)" }}
              />
            </div>
            <div
              style={{
                flex: "none", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 46, height: 46, padding: "0 14px",
                font: "700 14px/1 var(--font-chakra)", clipPath: NOTCH,
                background: canProceed() ? "rgba(45,115,215,.55)" : "rgba(8,26,54,.72)",
                border: `1px solid ${canProceed() ? "rgba(90,175,255,.7)" : "rgba(105,190,255,.28)"}`,
                color: canProceed() ? "#eaf6ff" : "#7fa9d4",
              }}
            >
              {interests.length}
            </div>
          </div>

          <div className="ob-pad" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {cats.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.id} className="ob-cat" style={{ clipPath: NOTCH }} {...(c.mine ? { "data-has": "" } : {})}>
                  <button className="ob-cat-hd" onClick={() => setOpenCat(openCat === c.id ? null : c.id)} aria-expanded={c.open}>
                    <span className="ob-cat-ico">{Icon ? <Icon className="w-[16px] h-[16px]" strokeWidth={1.5} /> : null}</span>
                    <span style={{ flex: 1, font: "600 14.5px/1 var(--font-chakra)", letterSpacing: "0.02em", color: "#dceeff" }}>{c.name}</span>
                    {c.mine > 0 && <span style={{ flex: "none", font: "600 11px/1 var(--font-jetbrains)", color: "#4dffb0" }}>{c.mine}</span>}
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true" style={{ flex: "none", transform: `rotate(${c.open ? 180 : 0}deg)`, transition: "transform .2s ease" }}>
                      <path d="M1 1.4L6 6.4l5-5" stroke="#7fa9d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {c.open && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 14px 14px" }}>
                      {c.shown.map((s) => {
                        const on = interests.includes(s.id);
                        return (
                          <button key={s.id} className="ob-tag" {...(on ? { "data-on": "" } : {})} disabled={!on && atMax} onClick={() => toggleInterest(s.id)}>
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {atMax && (
            <p style={{ position: "relative", zIndex: 2, margin: "12px 0 0", font: "400 11px/1.5 var(--font-chakra)", color: "#ffb454" }}>
              {MAX_INTEREST_SELECTIONS} is the maximum — deselect one to swap.
            </p>
          )}
          <Nav step={2} onBack={back} onNext={next} label="Continue →" disabled={!canProceed()} />
        </section>
      )}

      {/* Step 3 — ID */}
      {step === 3 && (
        <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Header step={3} />
          <div style={{ position: "relative", zIndex: 2, marginTop: 22 }}>
            <h1 className="ob-h1">Verify your ID</h1>
            <p className="ob-sub">
              {VERIFICATION_LIVE
                ? "One scan confirms you are a real person over 18. It is how NEX2 keeps the radar free of fakes."
                : "NEX2 is 18+. Document checks are not switched on yet — skip this step and carry on."}
            </p>
          </div>

          <div className="ob-pad" style={{ marginTop: 20 }}>
            <div style={{ padding: 16, background: "rgba(6,20,42,.55)", border: "1px solid rgba(105,190,255,.2)", clipPath: NOTCH_LG }}>
              <div style={{ position: "relative", height: 150, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "rgba(3,12,26,.7)", border: "1px dashed rgba(105,190,255,.28)" }}>
                {[{ left: 14, top: 14, bl: 1, bt: 1 }, { right: 14, top: 14, br: 1, bt: 1 }, { left: 14, bottom: 14, bl: 1, bb: 1 }, { right: 14, bottom: 14, br: 1, bb: 1 }].map((c, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    style={{
                      position: "absolute", width: 22, height: 22, zIndex: 1,
                      left: c.left, right: c.right, top: c.top, bottom: c.bottom,
                      borderLeft: c.bl ? "2px solid #7fc8ff" : undefined,
                      borderRight: c.br ? "2px solid #7fc8ff" : undefined,
                      borderTop: c.bt ? "2px solid #7fc8ff" : undefined,
                      borderBottom: c.bb ? "2px solid #7fc8ff" : undefined,
                    }}
                  />
                ))}
                {/* The live viewfinder sits under the brackets and scan line. */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  aria-label="Camera viewfinder"
                  style={{ position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%", objectFit: "cover", opacity: cam === "live" ? 1 : 0, transition: "opacity .3s ease" }}
                />
                <div aria-hidden="true" style={{ position: "absolute", left: 14, right: 14, top: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(140,215,255,.9), transparent)", boxShadow: "0 0 14px rgba(120,200,255,.8)", animation: "ob-scan 3.4s linear infinite" }} />

                {cam === "live" ? (
                  <span style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", font: "500 10px/1 var(--font-jetbrains)", letterSpacing: "0.18em", textTransform: "uppercase", color: "#cfe9ff", textShadow: "0 1px 6px rgba(1,6,14,.9)" }}>
                    Align your ID in frame
                  </span>
                ) : (
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <svg width="52" height="38" viewBox="0 0 52 38" fill="none" aria-hidden="true">
                      <rect x="1.2" y="1.2" width="49.6" height="35.6" rx="3" stroke="#5f9dd4" strokeWidth="1.6" />
                      <circle cx="15" cy="15" r="6" stroke="#5f9dd4" strokeWidth="1.6" />
                      <path d="M6 30c0-4.4 4-6.6 9-6.6s9 2.2 9 6.6" stroke="#5f9dd4" strokeWidth="1.6" />
                      <path d="M31 12h15M31 19h15M31 26h9" stroke="#5f9dd4" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <span style={{ marginTop: 12, font: "500 10px/1 var(--font-jetbrains)", letterSpacing: "0.18em", textTransform: "uppercase", color: "#6f9dc8", textAlign: "center", padding: "0 16px" }}>
                      {cam === "starting" ? "Starting camera" : cam === "denied" ? "Camera blocked — use a photo" : cam === "unsupported" ? "No camera — use a photo" : "Align your ID in frame"}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                {DOCS.map((d) => (
                  <button key={d} className="ob-doc" style={{ clipPath: NOTCH }} {...(doc === d ? { "data-on": "" } : {})} onClick={() => setDoc(d)}>{d}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
              <span className="ob-note">
                <svg width="16" height="17" viewBox="0 0 17 18" fill="none" aria-hidden="true">
                  <path d="M8.5 1.2l6.4 2.6v5.4c0 4-2.7 6.6-6.4 7.6-3.7-1-6.4-3.6-6.4-7.6V3.8l6.4-2.6z" stroke="#4dffb0" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M5.8 9.2l2 2 3.6-3.9" stroke="#4dffb0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {VERIFICATION_LIVE
                  ? "Your ID goes straight to our verification partner. NEX2 never receives or stores the image."
                  : "Nothing you capture here leaves your phone — it is not uploaded or stored anywhere."}
              </span>
              <span className="ob-note">
                <svg width="16" height="17" viewBox="0 0 17 18" fill="none" aria-hidden="true">
                  <circle cx="8.5" cy="8.5" r="7.3" stroke="#7fc8ff" strokeWidth="1.4" />
                  <path d="M8.5 4.6v4.6l3 1.8" stroke="#7fc8ff" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {VERIFICATION_LIVE
                  ? "We keep only your verified age — never your name, address or document number."
                  : "Skipping changes nothing today. You can verify from Settings once checks are on."}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, padding: "13px 15px", background: "rgba(20,54,104,.5)", border: "1px solid rgba(105,190,255,.3)", clipPath: NOTCH }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                <circle cx="10" cy="10" r="8.4" stroke="#4da6ff" strokeWidth="1.5" />
                <path d="M6 10.2l2.7 2.7 5.3-5.7" stroke="#4da6ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ flex: 1, font: "400 12px/1.45 var(--font-chakra)", color: "#c3d8ee" }}>
                {/* The radar has no verified-only filter yet, so that half of
                    the design's promise is left out until it exists. */}
                Verified accounts get the blue check that shows next to your name.
              </span>
            </div>
          </div>

          <input
            ref={scanInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => { runIdCheck(e.target.files?.[0]); e.target.value = ""; }}
          />
          <Nav
            step={3}
            onBack={back}
            onNext={cam === "live" ? captureFrame : () => scanInput.current?.click()}
            label={cam === "live" ? <>Scan {doc.toLowerCase()} →</> : cam === "starting" ? <>Starting camera…</> : <>Photograph {doc.toLowerCase()} →</>}
            disabled={cam === "starting"}
          />
          <button className="ob-skip" onClick={next}>Skip — browse unverified</button>
        </section>
      )}

      {/* Step 4 — visibility */}
      {step === 4 && (
        <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Header step={4} />
          <div style={{ position: "relative", zIndex: 2, marginTop: 22 }}>
            <h1 className="ob-h1">Choose your visibility</h1>
            <p className="ob-sub">How much of you shows on someone else&rsquo;s radar. Change it any time.</p>
          </div>

          <div className="ob-pad" style={{ marginTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {VISIBILITY.map((v) => {
                const on = visibility === v.value;
                return (
                  <button key={v.value} className="ob-vis" style={{ clipPath: NOTCH }} {...(on ? { "data-on": "" } : {})} onClick={() => setVisibility(v.value)}>
                    <span className="ob-vis-ico">{v.glyph}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", font: "600 15px/1 var(--font-chakra)", letterSpacing: "0.02em", color: on ? "#eaf6ff" : "#c3d8ee" }}>{v.label}</span>
                      <span style={{ display: "block", marginTop: 7, font: "400 12.5px/1.45 var(--font-chakra)", color: "#8fb9e2" }}>
                        {v.desc || `They see “${firstName}” and your shared interests. Nothing else.`}
                      </span>
                    </span>
                    {on && (
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flex: "none", marginTop: 2 }}>
                        <circle cx="9" cy="9" r="8.2" fill="#3f9dff" />
                        <path d="M5.2 9.3l2.5 2.5 5.1-5.4" stroke="#031024" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 20, padding: 15, background: "rgba(6,20,42,.6)", border: "1px solid rgba(105,190,255,.18)", clipPath: NOTCH }}>
              <div style={{ font: "600 9px/1 var(--font-chakra)", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5f89b2" }}>They will see</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 13 }}>
                <div style={{ flex: "none", width: 44, height: 44, border: "2px solid rgba(255,255,255,.2)", borderRadius: "50%", overflow: "hidden", boxSizing: "border-box" }}>
                  <GenerativeAvatar seed={username.trim() || "Alex"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 15px/1 var(--font-chakra)", color: "#eaf6ff" }}>
                    {visibility === "anonymous" ? "Anonymous" : visibility === "first_name" ? firstName : username.trim() || "Alex"}
                  </div>
                  <div style={{ marginTop: 6, font: "500 11px/1 var(--font-jetbrains)", color: "#7fa9d4" }}>
                    Nearby · {visibility === "full_profile" && age ? `${age} · ${interests.length} shared` : `${interests.length} shared interests`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Nav step={4} onBack={back} onNext={next} label="Continue →" />
        </section>
      )}

      {/* Step 5 — location */}
      {step === 5 && (
        <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Header step={5} />
          <div style={{ position: "relative", zIndex: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              {/* 78px, not the design's 76 — the label needs 77px once the
                  0.08em tracking is counted, so at 76 it wraps to two lines. */}
              <div style={{ position: "absolute", bottom: -6, left: "50%", marginLeft: -39, width: 78, textAlign: "center", whiteSpace: "nowrap", padding: "5px 0", background: "rgba(8,26,54,.9)", border: "1px solid rgba(105,190,255,.4)", font: "500 10px/1 var(--font-jetbrains)", letterSpacing: "0.08em", color: "#8fd0ff" }}>
                2 mi radius
              </div>
            </div>

            <h1 className="ob-h1" style={{ marginTop: 36, textAlign: "center" }}>Enable location</h1>
            <p className="ob-sub" style={{ maxWidth: 290, textAlign: "center" }}>
              NEX2 shows people within about two miles. Your exact position is never shared — only an approximate distance.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, padding: "11px 14px", background: "rgba(6,20,42,.6)", border: "1px solid rgba(105,190,255,.2)", clipPath: NOTCH }}>
              <svg width="15" height="16" viewBox="0 0 17 18" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                <path d="M8.5 1.2l6.4 2.6v5.4c0 4-2.7 6.6-6.4 7.6-3.7-1-6.4-3.6-6.4-7.6V3.8l6.4-2.6z" stroke="#4dffb0" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <span style={{ font: "400 11.5px/1.4 var(--font-chakra)", color: "#a6cbec" }}>Turn the radar off any time — you go invisible instantly.</span>
            </div>
          </div>

          <Nav step={5} onBack={back} onNext={requestLocation} label="Enable &amp; continue →" />
        </section>
      )}

      {/* Step 6 — done */}
      {step === 6 && (
        <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Header step={6} />
          <div className="ob-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <button
              onClick={handleComplete}
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

            <h1 className="ob-h1" style={{ marginTop: 34, textAlign: "center" }}>You are all set</h1>
            <p className="ob-sub" style={{ textAlign: "center" }}>Your radar is live. Tap NEX2 to discover people nearby.</p>
            {error && <p style={{ margin: "12px 0 0", font: "400 12px/1.5 var(--font-chakra)", color: "#ff8a80", textAlign: "center" }}>{error}</p>}

            <div style={{ width: "100%", marginTop: 26, borderTop: "1px solid rgba(105,190,255,.14)" }}>
              {[
                ["Username", username.trim() || "Not set"],
                ["Interests", `${interests.length} picked`],
                ["Verified", VERIFICATION_LIVE && scanned ? doc : "Not verified"],
                ["Visibility", VISIBILITY.find((v) => v.value === visibility)?.label],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 2px", borderBottom: "1px solid rgba(105,190,255,.1)" }}>
                  <span style={{ font: "500 10px/1 var(--font-chakra)", letterSpacing: "0.18em", textTransform: "uppercase", color: "#5f89b2" }}>{k}</span>
                  <span style={{ font: "600 13px/1 var(--font-chakra)", color: "#c3d8ee" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ob-nav">
            <button className="ob-back" style={{ clipPath: NOTCH }} aria-label="Back" onClick={back}>{ARROW_BACK}</button>
            <button
              onClick={handleComplete}
              disabled={saving}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 54, border: "1px solid rgba(120,190,255,.32)", background: "rgba(10,30,60,.5)", color: "#dceeff", font: "600 12.5px/1 var(--font-chakra)", letterSpacing: "0.18em", textTransform: "uppercase", cursor: saving ? "default" : "pointer", clipPath: NOTCH }}
            >
              {saving ? "Opening…" : "Open the radar"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
