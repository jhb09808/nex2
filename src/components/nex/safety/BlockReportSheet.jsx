import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Portal from "@/components/nex/Portal";

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "stalking", label: "Stalking" },
  { value: "underage_suspicion", label: "Underage Suspicion" },
  { value: "threat", label: "Threat / Violence" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "other", label: "Other" },
];

const FONT = "var(--font-chakra)";
const clip = (n) =>
  `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`;

// Angular flag icon (matches the redesigned thread mockup)
const FlagIcon = () => (
  <svg width="17" height="18" viewBox="0 0 18 19" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M2.4 17.6V1.4M2.4 2.2h11.4l-2 3.4 2 3.4H2.4" stroke="#ffb454" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const BlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <circle cx="9.5" cy="9.5" r="8.2" stroke="#ff8080" strokeWidth="1.4" />
    <path d="M3.7 3.7l11.6 11.6" stroke="#ff8080" strokeWidth="1.4" />
  </svg>
);

export default function BlockReportSheet({ user, open, onClose, onBlocked, conversationId }) {
  const [mode, setMode] = useState(null); // null | 'report' | 'block'
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [error, setError] = useState("");

  const targetId = user?.created_by_id || user?.id;

  const reset = () => {
    setMode(null);
    setReason("");
    setDescription("");
    setStatus("idle");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBlock = async () => {
    setStatus("submitting");
    setError("");
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length === 0) throw new Error("Profile not found");
      const p = profiles[0];
      const blocked = p.blocked_users || [];
      if (!blocked.includes(targetId)) {
        await base44.entities.UserProfile.update(p.id, {
          blocked_users: [...blocked, targetId],
        });
      }
      setStatus("done");
      setTimeout(() => {
        if (onBlocked) onBlocked();
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handleReport = async () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      await base44.functions.invoke("createReport", {
        reported_user_id: targetId,
        reason,
        description,
        conversation_id: conversationId || null,
      });
      setStatus("done");
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setStatus("idle");
    }
  };

  const title = {
    margin: 0,
    fontFamily: FONT,
    fontWeight: 700,
    fontStyle: "italic",
    fontSize: 19,
    lineHeight: 1,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "#fff",
  };
  const subtitle = {
    margin: "9px 0 0",
    fontFamily: FONT,
    fontWeight: 500,
    fontSize: 10.5,
    lineHeight: 1,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#7fa9d4",
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[200]"
              style={{ background: "rgba(1,6,14,.74)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[201] w-full safe-bottom"
              style={{ maxWidth: 440 }}
            >
              <div
                style={{
                  margin: "0 14px 20px",
                  padding: 16,
                  background: "linear-gradient(180deg, rgba(10,32,64,.97), rgba(5,16,34,.98))",
                  border: "1px solid rgba(105,190,255,.36)",
                  boxShadow: "0 -12px 46px rgba(1,6,14,.75)",
                  clipPath: clip(18),
                }}
              >
                {/* Grab handle */}
                <div
                  aria-hidden="true"
                  style={{ width: 38, height: 3, margin: "0 auto 16px", background: "rgba(140,200,255,.32)" }}
                />

                {status === "done" ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        width: 60,
                        height: 60,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                        background: "rgba(77,255,176,.14)",
                        border: "1px solid rgba(77,255,176,.4)",
                        clipPath: clip(14),
                      }}
                    >
                      <Check className="w-7 h-7" style={{ color: "#4dffb0" }} />
                    </div>
                    <p style={{ ...title, fontStyle: "normal", fontSize: 16 }}>
                      {mode === "block" ? "User blocked" : "Report submitted"}
                    </p>
                    <p style={{ ...subtitle, letterSpacing: "0.04em", textTransform: "none", marginTop: 8 }}>
                      {mode === "block"
                        ? "They won't be notified and can't contact you."
                        : "Our team will review this report."}
                    </p>
                  </div>
                ) : !mode ? (
                  <>
                    <div style={title}>Safety options</div>
                    <div style={subtitle}>
                      {user?.username ? `Managing @${user.username}` : "Managing this user"}
                    </div>

                    <button
                      onClick={() => setMode("report")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        width: "100%",
                        marginTop: 16,
                        padding: "14px 15px",
                        textAlign: "left",
                        background: "rgba(255,170,60,.08)",
                        border: "1px solid rgba(255,180,84,.34)",
                        cursor: "pointer",
                        clipPath: clip(13),
                      }}
                    >
                      <FlagIcon />
                      <span>
                        <span style={{ display: "block", font: `600 14.5px/1 ${FONT}`, color: "#ffd9a0" }}>
                          Report
                        </span>
                        <span style={{ display: "block", marginTop: 7, font: `400 12px/1.4 ${FONT}`, color: "#c2a887" }}>
                          Flag for harassment, threats, or underage
                        </span>
                      </span>
                    </button>

                    <button
                      onClick={() => setMode("block")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        width: "100%",
                        marginTop: 10,
                        padding: "14px 15px",
                        textAlign: "left",
                        background: "rgba(255,90,90,.08)",
                        border: "1px solid rgba(255,120,120,.34)",
                        cursor: "pointer",
                        clipPath: clip(13),
                      }}
                    >
                      <BlockIcon />
                      <span>
                        <span style={{ display: "block", font: `600 14.5px/1 ${FONT}`, color: "#ffb3b3" }}>
                          Block
                        </span>
                        <span style={{ display: "block", marginTop: 7, font: `400 12px/1.4 ${FONT}`, color: "#c99a9a" }}>
                          Silently block — they won't know
                        </span>
                      </span>
                    </button>

                    <button
                      onClick={handleClose}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: 48,
                        marginTop: 12,
                        border: 0,
                        background: "transparent",
                        color: "#a6cbec",
                        font: `600 12.5px/1 ${FONT}`,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : mode === "report" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <button
                        onClick={() => setMode(null)}
                        aria-label="Back"
                        style={{
                          flex: "none",
                          width: 34,
                          height: 34,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(8,26,54,.66)",
                          border: "1px solid rgba(105,190,255,.26)",
                          cursor: "pointer",
                          clipPath: clip(10),
                        }}
                      >
                        <ArrowLeft className="w-4 h-4" style={{ color: "#bfe2ff" }} />
                      </button>
                      <div style={{ ...title, fontSize: 17 }}>Report user</div>
                    </div>
                    <div style={{ ...subtitle, marginTop: 0, marginBottom: 10 }}>Select a reason</div>
                    <div
                      className="scrollbar-hide"
                      style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 192, overflowY: "auto", marginBottom: 14 }}
                    >
                      {REPORT_REASONS.map((r) => {
                        const active = reason === r.value;
                        return (
                          <button
                            key={r.value}
                            onClick={() => setReason(r.value)}
                            style={{
                              width: "100%",
                              padding: "12px 14px",
                              textAlign: "left",
                              font: `500 13.5px/1 ${FONT}`,
                              color: active ? "#fff" : "#8fb4dc",
                              background: active ? "rgba(43,114,232,.22)" : "rgba(8,26,54,.5)",
                              border: active ? "1px solid rgba(120,190,255,.7)" : "1px solid rgba(105,190,255,.2)",
                              cursor: "pointer",
                              clipPath: clip(11),
                            }}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details (optional)…"
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "rgba(8,26,54,.72)",
                        border: "1px solid rgba(105,190,255,.3)",
                        outline: "none",
                        color: "#dceeff",
                        font: `500 13.5px/1.5 ${FONT}`,
                        resize: "none",
                        marginBottom: 14,
                        clipPath: clip(11),
                      }}
                    />
                    {error && (
                      <p style={{ font: `500 12px/1.4 ${FONT}`, color: "#ff8080", marginBottom: 12 }}>{error}</p>
                    )}
                    <button
                      onClick={handleReport}
                      disabled={status === "submitting"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        width: "100%",
                        padding: "14px 15px",
                        background: "rgba(255,90,90,.12)",
                        border: "1px solid rgba(255,120,120,.4)",
                        color: "#ffb3b3",
                        font: `600 14px/1 ${FONT}`,
                        letterSpacing: "0.04em",
                        cursor: status === "submitting" ? "default" : "pointer",
                        clipPath: clip(13),
                      }}
                    >
                      {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlagIcon />}
                      Submit Report
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <button
                        onClick={() => setMode(null)}
                        aria-label="Back"
                        style={{
                          flex: "none",
                          width: 34,
                          height: 34,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(8,26,54,.66)",
                          border: "1px solid rgba(105,190,255,.26)",
                          cursor: "pointer",
                          clipPath: clip(10),
                        }}
                      >
                        <ArrowLeft className="w-4 h-4" style={{ color: "#bfe2ff" }} />
                      </button>
                      <div style={{ ...title, fontSize: 17 }}>Block user</div>
                    </div>
                    <div
                      style={{
                        padding: 15,
                        marginBottom: 14,
                        background: "rgba(255,90,90,.08)",
                        border: "1px solid rgba(255,120,120,.28)",
                        clipPath: clip(13),
                      }}
                    >
                      <p style={{ margin: 0, font: `400 13px/1.55 ${FONT}`, color: "#c9d9ec" }}>
                        Blocking is <span style={{ color: "#fff", fontWeight: 600 }}>silent</span> — they won't be
                        notified and won't be able to detect it. They can't wave at you, message you, or see your
                        profile.
                      </p>
                    </div>
                    {error && (
                      <p style={{ font: `500 12px/1.4 ${FONT}`, color: "#ff8080", marginBottom: 12 }}>{error}</p>
                    )}
                    <button
                      onClick={handleBlock}
                      disabled={status === "submitting"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        width: "100%",
                        padding: "14px 15px",
                        background: "rgba(255,90,90,.12)",
                        border: "1px solid rgba(255,120,120,.4)",
                        color: "#ffb3b3",
                        font: `600 14px/1 ${FONT}`,
                        letterSpacing: "0.04em",
                        cursor: status === "submitting" ? "default" : "pointer",
                        clipPath: clip(13),
                      }}
                    >
                      {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <BlockIcon />}
                      Confirm Block
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
