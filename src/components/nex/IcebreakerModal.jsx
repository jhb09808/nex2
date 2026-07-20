import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Send, Snowflake } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
      setSuggestion(res?.message || res);
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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="cyber-frame rounded-3xl p-6 w-full max-w-sm relative overflow-hidden"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <button onClick={onClose} className="absolute top-3 right-3 z-10">
              <X className="w-5 h-5 text-white/30" />
            </button>

            {/* Ice Cube */}
            <div className="flex justify-center mb-4 mt-2">
              <IceCube matchPct={matchPct} loading={loading} />
            </div>

            {/* Match Percentage */}
            <div className="text-center mb-3">
              <p className="text-4xl font-cyber font-bold gradient-text">{matchPct}%</p>
              <p className="text-blue-400/40 text-[10px] font-cyber tracking-widest uppercase mt-1">
                Connection Match
              </p>
            </div>

            {/* Shared Interests */}
            {sharedInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {sharedInterests.slice(0, 5).map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300/80 border border-blue-500/15"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
            {sharedInterests.length === 0 && (
              <p className="text-center text-white/30 text-xs mb-4">
                No direct overlap — but opposites connect too ✨
              </p>
            )}

            {/* Suggestion */}
            <div className="glass rounded-2xl p-4 mb-4 min-h-[80px] flex items-center justify-center">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-blue-400 animate-pulse" />
                  <p className="text-white/40 text-sm font-cyber">Breaking the ice...</p>
                </div>
              ) : suggestion ? (
                <p className="text-white/80 text-sm leading-relaxed text-center">"{suggestion}"</p>
              ) : (
                <p className="text-white/30 text-sm">Tap refresh to try again</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={generateIcebreaker}
                disabled={loading}
                className="w-12 py-3 rounded-xl cyber-input text-white/60 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={handleUse}
                disabled={loading || !suggestion}
                className="flex-1 py-3 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
              >
                <Send className="w-4 h-4" /> USE ICEBREAKER
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IceCube({ matchPct, loading }) {
  return (
    <div className="relative w-24 h-28">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-2xl" />

      {/* Floating ice cube */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-24 h-24 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.06) 50%, rgba(96,165,250,0.18) 100%)",
          border: "1px solid rgba(96,165,250,0.3)",
          boxShadow: "0 0 30px rgba(59,130,246,0.2), inset 0 0 20px rgba(255,255,255,0.05)",
        }}
      >
        {/* Top shine */}
        <div
          className="absolute top-2 left-2 right-8 h-6 rounded-xl"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }}
        />
        {/* Crystalline facets */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="20" y1="20" x2="50" y2="50" stroke="rgba(96,165,250,0.15)" strokeWidth="0.5" />
          <line x1="80" y1="20" x2="50" y2="50" stroke="rgba(96,165,250,0.15)" strokeWidth="0.5" />
          <line x1="20" y1="80" x2="50" y2="50" stroke="rgba(96,165,250,0.15)" strokeWidth="0.5" />
          <line x1="80" y1="80" x2="50" y2="50" stroke="rgba(96,165,250,0.15)" strokeWidth="0.5" />
        </svg>
        {/* Snowflake */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
          >
            <Snowflake
              className="w-8 h-8 text-blue-300"
              style={{ filter: "drop-shadow(0 0 6px rgba(96,165,250,0.6))" }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Melting drips */}
      {!loading && matchPct > 0 && (
        <>
          <motion.div
            className="absolute bottom-4 left-1/4 w-1 h-1.5 rounded-full bg-blue-300/50"
            animate={{ y: [0, 28], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute bottom-4 right-1/3 w-1 h-1.5 rounded-full bg-blue-300/50"
            animate={{ y: [0, 24], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          />
        </>
      )}
    </div>
  );
}