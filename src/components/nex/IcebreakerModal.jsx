import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PANEL_CLIP = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";
const ICON_CLIP = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const TEXT_CLIP = "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";
const BTN_CLIP = "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)";

// Burst glyph used on the icebreaker header and match sheet.
function BurstIcon({ size = 26, color = "#7fc8ff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1v16M1.6 4.8l14.8 8.4M16.4 4.8L1.6 13.2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 1l-2 2.2M9 1l2 2.2M9 17l-2-2.2M9 17l2-2.2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function IcebreakerModal({ open, onClose, myProfile, otherUser, onUseSuggestion }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [matchPct, setMatchPct] = useState(0);
  const [sharedInterests, setSharedInterests] = useState([]);

  const computeMatch = useCallback(() => {
    const myInterests = myProfile?.interests || [];
    const theirInterests = otherUser?.interests || [];
    const shared = myInterests.filter((i) => theirInterests.includes(i));
    setSharedInterests(shared);

    const total = Math.max(myInterests.length, theirInterests.length, 1);
    const rawPct = (shared.length / total) * 100;

    // Even with no direct overlap, give a baseline so it still feels like a connection
    const baseline = shared.length > 0 ? 42 : 28;
    const pct = Math.round(Math.max(baseline, rawPct + baseline * 0.3));
    setMatchPct(Math.min(98, Math.max(15, pct)));
  }, [myProfile, otherUser]);

  const generateIcebreaker = useCallback(async () => {
    setLoading(true);
    setSuggestion(null);
    try {
      const myInterests = myProfile?.interests || [];
      const theirInterests = otherUser?.interests || [];
      const shared = myInterests.filter((i) => theirInterests.includes(i));

      const prompt = `You are a witty, friendly conversation starter for a social networking app called NEX2.

User A's interests: ${myInterests.join(", ") || "not specified"}
User B's interests: ${theirInterests.join(", ") || "not specified"}
Shared interests: ${shared.join(", ") || "none directly shared"}

Generate ONE short, casual icebreaker message that User A could send to User B to start a conversation.

Rules:
- Keep it under 2 sentences, natural and casual (like a real text message)
- If there are shared interests, reference one naturally
- If there are no shared interests, find a creative, playful connection between their different interests
- Be warm and engaging, NOT cheesy, cringey, or formal
- Don't use hashtags or emojis
- Don't start with "Hey" or "Hi" — be specific and interesting
- Speak as User A talking TO User B

Return ONLY the message text.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      });
      const text = typeof res === "string" ? res : res?.message;
      setSuggestion(typeof text === "string" ? text : null);
    } catch (err) {
      console.error(err);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  }, [myProfile, otherUser]);

  useEffect(() => {
    if (open && myProfile && otherUser) {
      computeMatch();
      generateIcebreaker();
    }
  }, [open, myProfile, otherUser, computeMatch, generateIcebreaker]);

  const handleUse = () => {
    if (suggestion && onUseSuggestion) {
      onUseSuggestion(suggestion);
    }
    onClose();
  };

  return (
    <>
      <style>{"@keyframes nxsheen{0%,12%{transform:translateX(-60px)}55%,100%{transform:translateX(340px)}}"}</style>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ padding: "0 18px", background: "rgba(1,6,14,.78)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 360,
                padding: "22px 20px 20px",
                textAlign: "center",
                background: "linear-gradient(180deg, rgba(10,32,64,.97), rgba(5,16,34,.98))",
                border: "1px solid rgba(105,190,255,.4)",
                boxShadow: "0 20px 60px rgba(1,6,14,.8), 0 0 34px rgba(40,120,220,.22)",
                clipPath: PANEL_CLIP,
              }}
            >
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ position: "absolute", top: 6, right: 6, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#7fa9d4", cursor: "pointer" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Icon */}
              <div
                style={{ width: 64, height: 64, margin: "6px auto 0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(120,200,255,.4)", background: "rgba(16,48,94,.6)", boxShadow: "0 0 26px rgba(60,150,255,.3)", clipPath: ICON_CLIP }}
              >
                <BurstIcon size={26} />
              </div>

              {/* Match percentage */}
              <div style={{ marginTop: 16, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 40, lineHeight: 1, letterSpacing: "-0.01em", color: "#eaf6ff", textShadow: "0 0 26px rgba(90,180,255,.6)" }}>
                {matchPct}%
              </div>
              <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.24em", textTransform: "uppercase", color: "#8fd0ff" }}>
                Connection match
              </div>

              {/* Shared interests / fallback line */}
              {sharedInterests.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", margin: "14px 0 0" }}>
                  {sharedInterests.slice(0, 5).map((interest) => (
                    <span
                      key={interest}
                      style={{ padding: "5px 10px", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 10, color: "#a6cbec", background: "rgba(16,48,94,.5)", border: "1px solid rgba(105,190,255,.22)" }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ margin: "14px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.5, color: "#a6cbec" }}>
                  No direct overlap — but opposites connect too
                </p>
              )}

              {/* Suggestion */}
              <div style={{ marginTop: 16, padding: "15px 16px", textAlign: "left", background: "rgba(6,20,42,.8)", border: "1px solid rgba(105,190,255,.22)", minHeight: 78, display: "flex", alignItems: "center", clipPath: TEXT_CLIP }}>
                {loading ? (
                  <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: "#7fa9d4", opacity: 0.85 }} className="animate-pulse">
                    Breaking the ice…
                  </p>
                ) : suggestion ? (
                  <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: "#dceeff" }}>
                    {suggestion}
                  </p>
                ) : (
                  <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: "#7fa9d4" }}>
                    Tap refresh to try again
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
                <button
                  onClick={generateIcebreaker}
                  disabled={loading}
                  aria-label="New suggestion"
                  style={{ flex: "none", width: 52, height: 50, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(120,190,255,.32)", background: "rgba(10,30,60,.6)", color: "#bfe2ff", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1 }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={handleUse}
                  disabled={loading || !suggestion}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    height: 50,
                    border: "1.5px solid transparent",
                    background:
                      "linear-gradient(180deg,#0a1c3e,#071228) padding-box, linear-gradient(100deg,#3b6bff,#9b4dff 48%,#2fd4d4) border-box",
                    color: "#fff",
                    fontFamily: "var(--font-chakra)",
                    fontWeight: 700,
                    fontSize: 12.5,
                    lineHeight: 1,
                    letterSpacing: "0.17em",
                    textTransform: "uppercase",
                    cursor: loading || !suggestion ? "default" : "pointer",
                    boxShadow: "0 0 22px rgba(80,110,255,.42), inset 0 0 22px rgba(70,120,255,.26)",
                    clipPath: BTN_CLIP,
                    opacity: loading || !suggestion ? 0.5 : 1,
                  }}
                >
                  <span aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, width: 56, background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.28),rgba(255,255,255,0))", animation: "nxsheen 4.5s ease-in-out infinite" }} />
                  <Send className="w-3.5 h-3.5" style={{ position: "relative" }} />
                  <span style={{ position: "relative" }}>Use icebreaker</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
