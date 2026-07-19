import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { getUserDisplayName } from "@/components/nex/userDisplay";

export default function ChatRequestOverlay({ blurred = false }) {
  const navigate = useNavigate();
  const [activeWave, setActiveWave] = useState(null);
  const [senderProfile, setSenderProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const myIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const me = await base44.auth.me();
        if (!isMounted) return;
        myIdRef.current = me.id;

        const waves = await base44.entities.Wave.filter(
          { receiver_id: me.id, status: "pending" },
          "-created_date",
          5
        );
        if (!isMounted) return;
        if (waves.length > 0) loadWave(waves[0]);
      } catch {
        // Silent fail — overlay is non-critical
      }
    })();

    const unsubscribe = base44.entities.Wave.subscribe((event) => {
      if (event.type !== "create") return;
      const w = event.data;
      if (w.receiver_id !== myIdRef.current || w.status !== "pending") return;
      loadWave(w);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loadWave = async (wave) => {
    setActiveWave(wave);
    setSenderProfile(null);
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: wave.sender_id });
      if (profiles[0]) setSenderProfile(profiles[0]);
    } catch {
      // ignore
    }
  };

  const handleAccept = async () => {
    if (!activeWave) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("acceptWave", { wave_id: activeWave.id });
      const data = res.data;
      if (data?.conversation_id) {
        setActiveWave(null);
        navigate(`/chat/${data.conversation_id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!activeWave) return;
    setLoading(true);
    try {
      await base44.entities.Wave.update(activeWave.id, { status: "declined" });
      setActiveWave(null);
      setSenderProfile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const name = senderProfile ? getUserDisplayName(senderProfile) : "Someone";

  return (
    <AnimatePresence>
      {activeWave && !blurred && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
        >
          {/* Pulsing rings */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(0,212,255,0.25)" }}
            animate={{ scale: [1, 1.9, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(0,212,255,0.15)" }}
            animate={{ scale: [1, 2.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
          />

          {/* Circular glass window */}
          <div className="relative w-56 h-56 rounded-full cyber-frame cyber-corners flex flex-col items-center justify-center p-6 text-center"
            style={{ boxShadow: "0 0 40px rgba(0,122,255,0.15), 0 0 80px rgba(0,212,255,0.08)" }}
          >
            {/* Close button */}
            <button
              onClick={handleDecline}
              disabled={loading}
              className="absolute top-5 right-5 text-blue-200/40 hover:text-blue-200/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon / Avatar */}
            <div className="mb-2.5">
              {senderProfile?.visibility === "anonymous" ? (
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
              ) : senderProfile ? (
                <UserAvatar name={name} size="md" plan={senderProfile.plan} />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-white font-cyber font-bold text-sm neon-text truncate max-w-[140px]">{name}</p>
              {senderProfile?.is_verified && <VerifiedBadges isVerified size="sm" />}
            </div>

            {/* Status */}
            <p className="text-blue-200/50 text-[10px] font-cyber tracking-widest mb-3.5">
              WANTS TO CHAT
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                disabled={loading}
                className="px-3.5 py-2 rounded-full bg-transparent border border-blue-400/20 text-white/50 font-cyber font-semibold text-[10px] tracking-wider transition-transform hover:border-blue-400/40 disabled:opacity-40"
              >
                DECLINE
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="px-3.5 py-2 rounded-full neon-btn text-white font-cyber font-bold text-[10px] tracking-wider flex items-center gap-1 disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> ACCEPT</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}