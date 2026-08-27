import React, { useRef, useState } from "react";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import shellBg from "@/assets/network-bg.webp";
import wordmark from "@/assets/wordmark.webp";
import {
  STEP_COUNT, STEP_NAMES, BIO_MAX, DOCS, VISIBILITY, VERIFICATION_LIVE,
  NOTCH, NOTCH_LG, ARROW_BACK, verifyCopy, summaryRows,
  ICON_SHIELD_CHECK, ICON_CLOCK, ICON_CHECK_RING, ICON_SEARCH, ICON_SHIELD, ICON_TICK_SMALL,
  LocationDial, EnterDisc,
} from "@/components/nex/onboardingCommon";
import { MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";

const MAX_FILE_MB = 10;

function Trail({ step }) {
  return (
    <div className="ob-trail" style={{ flex: 1, maxWidth: 860 }}>
      {STEP_NAMES.map((name, i) => {
        const idx = i + 1;
        const flag = idx < step ? { "data-done": "" } : idx === step ? { "data-now": "" } : {};
        return (
          <React.Fragment key={name}>
            <span className="ob-tstep" {...flag}>
              <span className="ob-tdot">{idx < step ? ICON_TICK_SMALL : idx}</span>
              <span className="ob-tlabel">{name}</span>
            </span>
            {i < STEP_NAMES.length - 1 && <span className="ob-tbar" {...(idx < step ? { "data-done": "" } : {})} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Nav({ step, onBack, onNext, label, disabled }) {
  return (
    <div className="ob-nav">
      {step > 1 && <button className="ob-back" style={{ clipPath: NOTCH }} aria-label="Back" onClick={onBack}>{ARROW_BACK}</button>}
      <button className="ob-next" style={{ clipPath: NOTCH }} onClick={onNext} disabled={disabled}>
        {!disabled && <span className="sheen" aria-hidden="true" />}
        <span style={{ position: "relative" }}>{label}</span>
      </button>
    </div>
  );
}

export default function OnboardingDesktop({ ob }) {
  const {
    step, back, next, canProceed,
    username, setUsername, nameState, age, setAge, bio, setBio,
    interests, toggleInterest, atMax, cats, query, setQuery, openCat, setOpenCat,
    doc, setDoc, scanned, starting, startStripeVerification, runIdCheck,
    visibility, setVisibility, firstName,
    requestLocation, handleComplete, saving, error,
  } = ob;

  const fileInput = useRef(null);
  const [over, setOver] = useState(false);
  const [picked, setPicked] = useState(null);
  const [fileError, setFileError] = useState("");
  const copy = verifyCopy("document");

  const take = (file) => {
    setFileError("");
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1048576) {
      setFileError(`That file is ${(file.size / 1048576).toFixed(1)} MB — the limit is ${MAX_FILE_MB} MB.`);
      return;
    }
    setPicked(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer?.files?.[0]);
  };

  return (
    <div
      className="obd"
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", padding: 20, boxSizing: "border-box", background: "radial-gradient(80% 70% at 50% 42%, #08203f 0%, #04101f 46%, #01050c 100%)", color: "#dceeff", fontFamily: "var(--font-chakra)" }}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={shellBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(1,6,14,.62) 0%, rgba(1,6,14,.78) 55%, rgba(1,6,14,.86) 100%)" }} />
      </div>

      {/* HUD frame */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 20, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 8 }} />
      {[
        { top: 20, left: 20, borderLeft: 1, borderTop: 1 },
        { top: 20, right: 20, borderRight: 1, borderTop: 1 },
        { bottom: 20, left: 20, borderLeft: 1, borderBottom: 1 },
        { bottom: 20, right: 20, borderRight: 1, borderBottom: 1 },
      ].map((c, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute", width: 30, height: 30, pointerEvents: "none", zIndex: 8,
            top: c.top, left: c.left, right: c.right, bottom: c.bottom,
            borderLeft: c.borderLeft ? "2px solid rgba(125,205,255,.6)" : undefined,
            borderRight: c.borderRight ? "2px solid rgba(125,205,255,.6)" : undefined,
            borderTop: c.borderTop ? "2px solid rgba(125,205,255,.6)" : undefined,
            borderBottom: c.borderBottom ? "2px solid rgba(125,205,255,.6)" : undefined,
          }}
        />
      ))}

      <header style={{ position: "relative", zIndex: 6, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, padding: "14px 22px 0" }}>
        <img src={wordmark} alt="NEX2" style={{ display: "block", width: 110, height: 17.7, filter: "drop-shadow(0 0 10px rgba(90,180,255,.7))" }} />
        <Trail step={step} />
        <span style={{ flex: "none", font: "600 10.5px/1 var(--font-chakra)", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5f89b2" }}>
          Step {step} of {STEP_COUNT}
        </span>
      </header>

      <div style={{ position: "relative", zIndex: 5, flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0 8px" }}>
        <div className="ob-card" style={{ clipPath: NOTCH_LG }}>

          {/* Step 1 — profile */}
          {step === 1 && (
            <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="ob-pad">
                <div style={{ marginTop: 22 }}>
                  <h1 className="ob-h1">Create your profile</h1>
                  <p className="ob-sub">Your username is what people see. Everything else stays private until you say otherwise.</p>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <label className="ob-lbl" htmlFor="obUserD">Username</label>
                    <span className="ob-mono" style={{ color: nameState === "Taken" ? "#ff8a80" : nameState === "Available" ? "#7de0b0" : "#5f89b2" }}>{nameState}</span>
                  </div>
                  <input id="obUserD" className="ob-fld" style={{ clipPath: NOTCH }} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a unique username" autoComplete="off" />
                </div>

                <div style={{ marginTop: 18 }}>
                  <label className="ob-lbl" htmlFor="obAgeD" style={{ display: "block" }}>Age</label>
                  <input id="obAgeD" className="ob-fld" style={{ clipPath: NOTCH }} value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Must be 18+" inputMode="numeric" />
                  {age && parseInt(age, 10) < 18 && (
                    <p style={{ margin: "8px 0 0", font: "400 11px/1.5 var(--font-chakra)", color: "#ff8a80" }}>You must be 18 or older to use NEX2.</p>
                  )}
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <label className="ob-lbl" htmlFor="obBioD">Bio</label>
                    <span className="ob-mono" style={{ color: bio.length > 125 ? "#ffb454" : "#5f89b2" }}>{bio.length}/{BIO_MAX}</span>
                  </div>
                  <textarea id="obBioD" className="ob-fld" style={{ clipPath: NOTCH }} maxLength={BIO_MAX} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short intro — what you are into, what you would say yes to." />
                </div>

                <p style={{ margin: "18px 0 0", font: "400 11px/1.5 var(--font-chakra)", color: "#5f89b2" }}>You can change any of this later in Settings.</p>
                {error && <p style={{ margin: "14px 0 0", font: "400 12px/1.5 var(--font-chakra)", color: "#ff8a80" }}>{error}</p>}
              </div>
              <Nav step={1} onNext={next} label="Continue →" disabled={!canProceed()} />
            </section>
          )}

          {/* Step 2 — interests */}
          {step === 2 && (
            <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div style={{ marginTop: 22 }}>
                <h1 className="ob-h1">Pick your interests</h1>
                <p className="ob-sub">These are what the radar matches on. Pick at least {MIN_INTEREST_SELECTIONS}.</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flex: "none" }}>
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.28)", clipPath: NOTCH }}>
                  {ICON_SEARCH}
                  <input aria-label="Search interests" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search interests" style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", font: "500 14px/1 var(--font-chakra)" }} />
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
                <p style={{ margin: "12px 0 0", font: "400 11px/1.5 var(--font-chakra)", color: "#ffb454", flex: "none" }}>
                  {MAX_INTEREST_SELECTIONS} is the maximum — deselect one to swap.
                </p>
              )}
              <Nav step={2} onBack={back} onNext={next} label="Continue →" disabled={!canProceed()} />
            </section>
          )}

          {/* Step 3 — ID. Desktop takes a file; there is rarely a usable camera. */}
          {step === 3 && (
            <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="ob-pad">
                <div style={{ marginTop: 22 }}>
                  <h1 className="ob-h1">Verify your ID</h1>
                  <p className="ob-sub">{copy.sub}</p>
                </div>

                <div style={{ marginTop: 20, padding: 16, background: "rgba(6,20,42,.55)", border: "1px solid rgba(105,190,255,.2)", clipPath: NOTCH_LG }}>
                  <div
                    className="ob-drop"
                    role="button"
                    tabIndex={0}
                    {...(over ? { "data-over": "" } : {})}
                    {...(picked ? { "data-has": "" } : {})}
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.current?.click(); } }}
                    onDragEnter={(e) => { e.preventDefault(); setOver(true); }}
                    onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                    onDragLeave={() => setOver(false)}
                    onDrop={onDrop}
                  >
                    <svg width="46" height="42" viewBox="0 0 46 42" fill="none" aria-hidden="true">
                      <rect x="1.3" y="9.3" width="43.4" height="31.4" rx="3" stroke="#5f9dd4" strokeWidth="1.7" />
                      <path d="M23 30V2M15 10l8-8 8 8" stroke="#7fc8ff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ marginTop: 14, font: "600 13px/1 var(--font-chakra)", letterSpacing: "0.04em", color: "#dceeff" }}>
                      Drop your {doc.toLowerCase()} here
                    </span>
                    <span style={{ marginTop: 9, font: "500 10px/1 var(--font-jetbrains)", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6f9dc8" }}>
                      or click to browse — JPG, PNG or PDF, max {MAX_FILE_MB} MB
                    </span>
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,application/pdf" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
                  </div>

                  {picked && (
                    <div className="ob-picked">
                      <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                        <circle cx="10" cy="10" r="8.4" stroke="#4dffb0" strokeWidth="1.6" />
                        <path d="M6 10.2l2.7 2.7 5.3-5.7" stroke="#4dffb0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", font: "600 13px/1 var(--font-chakra)", color: "#eaf6ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{picked.name}</span>
                        <span style={{ display: "block", marginTop: 6, font: "500 10px/1 var(--font-jetbrains)", color: "#7de0b0" }}>
                          {(picked.size / 1048576).toFixed(1)} MB · ready to verify
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={(e) => { e.stopPropagation(); setPicked(null); setFileError(""); }}
                        style={{ flex: "none", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#7fa9d4", cursor: "pointer" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                    {DOCS.map((d) => (
                      <button key={d} className="ob-doc" style={{ clipPath: NOTCH }} {...(doc === d ? { "data-on": "" } : {})} onClick={() => setDoc(d)}>{d}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
                  <span className="ob-note">{ICON_SHIELD_CHECK}{copy.privacy}</span>
                  <span className="ob-note">{ICON_CLOCK}{copy.kept}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, padding: "13px 15px", background: "rgba(20,54,104,.5)", border: "1px solid rgba(105,190,255,.3)", clipPath: NOTCH }}>
                  {ICON_CHECK_RING}
                  <span style={{ flex: 1, font: "400 12px/1.45 var(--font-chakra)", color: "#c3d8ee" }}>{copy.callout}</span>
                </div>

                {(fileError || error) && (
                  <p style={{ margin: "14px 0 0", font: "400 12px/1.5 var(--font-chakra)", color: "#ff8a80" }}>{fileError || error}</p>
                )}
              </div>

              <Nav
                step={3}
                onBack={back}
                onNext={VERIFICATION_LIVE ? startStripeVerification : () => runIdCheck(picked)}
                label={starting ? <>Opening…</> : <>Verify {doc.toLowerCase()} →</>}
                disabled={starting || (!VERIFICATION_LIVE && !picked)}
              />
              <button className="ob-skip" onClick={next}>Skip — browse unverified</button>
            </section>
          )}

          {/* Step 4 — visibility */}
          {step === 4 && (
            <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="ob-pad">
                <div style={{ marginTop: 22 }}>
                  <h1 className="ob-h1">Choose your visibility</h1>
                  <p className="ob-sub">How much of you shows on someone else&rsquo;s radar. Change it any time.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 20 }}>
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
              <div className="ob-pad" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
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
              </div>
              <Nav step={5} onBack={back} onNext={requestLocation} label="Enable &amp; continue →" />
            </section>
          )}

          {/* Step 6 — done */}
          {step === 6 && (
            <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="ob-pad" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
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
        </div>
      </div>
    </div>
  );
}
