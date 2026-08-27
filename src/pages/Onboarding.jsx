import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { INTEREST_CATEGORIES } from "@/components/nex/radar/interestCategories";
import { MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";
import wordmark from "@/assets/wordmark.webp";
import OnboardingDesktop from "@/pages/OnboardingDesktop";
import useIsDesktop from "@/hooks/useIsDesktop";
import {
  STEP_COUNT, BIO_MAX, DOCS, VISIBILITY, VERIFICATION_LIVE, NOTCH, NOTCH_LG,
  ARROW_BACK, readDraft, writeDraft, clearDraft, verifyCopy, summaryRows,
  ICON_SHIELD_CHECK, ICON_CLOCK, ICON_CHECK_RING, ICON_SEARCH, ICON_SHIELD,
  LocationDial, EnterDisc,
} from "@/components/nex/onboardingCommon";

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
  const isDesktop = useIsDesktop(1200);
  // Coming back from the hosted flow, the draft is the source of truth.
  const returning = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("verify") === "return";
  const draft = returning ? readDraft() : null;

  const [step, setStep] = useState(draft ? 4 : 1);

  const [username, setUsername] = useState(draft?.username || "");
  const [age, setAge] = useState(draft?.age || "");
  const [bio, setBio] = useState(draft?.bio || "");
  const [nameState, setNameState] = useState("");

  const [interests, setInterests] = useState(draft?.interests || []);
  const [query, setQuery] = useState("");
  const [openCat, setOpenCat] = useState(null);

  const [doc, setDoc] = useState(draft?.doc || DOCS[0]);
  const [scanned, setScanned] = useState(!!draft?.sessionId);
  // Set once, when the draft comes back from the hosted flow.
  const verifySessionId = draft?.sessionId || null;
  const [starting, setStarting] = useState(false);
  // "live" puts the camera in the frame; the file input is only a fallback for
  // when there is no camera or permission was refused.
  const [cam, setCam] = useState("idle");
  const scanInput = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [visibility, setVisibility] = useState(draft?.visibility || "full_profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The draft has been consumed; drop it so a later visit starts clean.
  useEffect(() => {
    if (!returning) return;
    clearDraft();
    window.history.replaceState({}, "", window.location.pathname);
  }, [returning]);

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
        // Only ever self_attested from the client. confirmIdVerification is
        // the one thing that may raise this to id_verified, and it does so
        // server-side after reading the verdict from Stripe.
        verification_method: "self_attested",
      });

      if (verifySessionId) {
        try {
          const res = await base44.functions.invoke("confirmIdVerification", { session_id: verifySessionId });
          if (res.data?.under_age) {
            setError("That document shows you are under 18, so we cannot let you in.");
            return;
          }
        } catch (err) {
          // A failed confirmation leaves the account self-attested, which is
          // the same place skipping lands. Not worth blocking entry over.
          console.error("Verification confirm failed:", err);
        }
      }

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
    // With the hosted flow live, Stripe does the capture — no local camera.
    if (step !== 3 || VERIFICATION_LIVE) { stopCamera(); return undefined; }
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

  /**
   * Hands off to Stripe's hosted flow. The document is captured there and goes
   * straight to Stripe — it never reaches this app or its backend.
   */
  const startStripeVerification = async () => {
    setStarting(true);
    setError("");
    try {
      const draftOut = { username, age, bio, interests, visibility, doc };
      writeDraft(draftOut);

      const res = await base44.functions.invoke("createVerificationSession", {
        origin: window.location.origin,
        return_to: "/onboarding",
      });
      if (res.data?.url) {
        // Keep the id alongside the draft so the verdict can be confirmed on
        // the way back.
        writeDraft({ ...draftOut, sessionId: res.data.session_id });
        stopCamera();
        window.location.assign(res.data.url);
        return;
      }
      setError(res.data?.error || "Could not start verification.");
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Could not start verification.");
    } finally {
      setStarting(false);
    }
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

  const copy = verifyCopy("scan");
  const back = () => setStep((s) => Math.max(1, s - 1));
  const next = () => setStep((s) => Math.min(STEP_COUNT, s + 1));

  if (isDesktop) {
    return (
      <OnboardingDesktop
        ob={{
          step, back, next, canProceed,
          username, setUsername, nameState, age, setAge, bio, setBio,
          interests, toggleInterest, atMax, cats, query, setQuery, openCat, setOpenCat,
          doc, setDoc, scanned, starting, startStripeVerification, runIdCheck,
          visibility, setVisibility, firstName,
          requestLocation, handleComplete, saving, error,
        }}
      />
    );
  }

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
              {ICON_SEARCH}
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
              {copy.sub}
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
                {ICON_SHIELD_CHECK}
                {copy.privacy}
              </span>
              <span className="ob-note">
                {ICON_CLOCK}
                {copy.kept}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, padding: "13px 15px", background: "rgba(20,54,104,.5)", border: "1px solid rgba(105,190,255,.3)", clipPath: NOTCH }}>
              {ICON_CHECK_RING}
              <span style={{ flex: 1, font: "400 12px/1.45 var(--font-chakra)", color: "#c3d8ee" }}>
                {copy.callout}
              </span>
            </div>

            {error && <p style={{ margin: "14px 0 0", font: "400 12px/1.5 var(--font-chakra)", color: "#ff8a80" }}>{error}</p>}
          </div>

          <input
            ref={scanInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => { runIdCheck(e.target.files?.[0]); e.target.value = ""; }}
          />
          {VERIFICATION_LIVE ? (
            <Nav
              step={3}
              onBack={back}
              onNext={startStripeVerification}
              label={starting ? <>Opening…</> : <>Scan {doc.toLowerCase()} →</>}
              disabled={starting}
            />
          ) : (
            <Nav
              step={3}
              onBack={back}
              onNext={cam === "live" ? captureFrame : () => scanInput.current?.click()}
              label={cam === "live" ? <>Scan {doc.toLowerCase()} →</> : cam === "starting" ? <>Starting camera…</> : <>Photograph {doc.toLowerCase()} →</>}
              disabled={cam === "starting"}
            />
          )}
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
            <LocationDial />

            <h1 className="ob-h1" style={{ marginTop: 36, textAlign: "center" }}>Enable location</h1>
            <p className="ob-sub" style={{ maxWidth: 290, textAlign: "center" }}>
              NEX2 shows people within about two miles. Your exact position is never shared — only an approximate distance.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, padding: "11px 14px", background: "rgba(6,20,42,.6)", border: "1px solid rgba(105,190,255,.2)", clipPath: NOTCH }}>
              {ICON_SHIELD}
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
            <EnterDisc onClick={handleComplete} saving={saving} />

            <h1 className="ob-h1" style={{ marginTop: 34, textAlign: "center" }}>You are all set</h1>
            <p className="ob-sub" style={{ textAlign: "center" }}>Your radar is live. Tap NEX2 to discover people nearby.</p>
            {error && <p style={{ margin: "12px 0 0", font: "400 12px/1.5 var(--font-chakra)", color: "#ff8a80", textAlign: "center" }}>{error}</p>}

            <div style={{ width: "100%", marginTop: 26, borderTop: "1px solid rgba(105,190,255,.14)" }}>
              {summaryRows({ username, interests, scanned, doc, visibility }).map(([k, v]) => (
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
