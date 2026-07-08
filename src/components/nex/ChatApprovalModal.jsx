import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Clock, Loader2 } from "lucide-react";
import UserAvatar from "@/components/nex/UserAvatar";
import { EyeOff, BadgeCheck, Crown, Shield } from "lucide-react";

const COUNTDOWN_SECONDS = 10;

export default function ChatApprovalModal({ user, onAccept, onReject, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [status, setStatus] = useState("waiting"); // waiting | accepted | rejected | timeout
  const timersRef = useRef([]);

  const getDisplayName = (u) => {
    if (!u) return "";
    if (u.visibility === "anonymous") return "Anonymous";
    return u.username;
  };

  useEffect(() => {
    // Simulate the other person responding at a random time between 3-9 seconds
    const responseDelay = (Math.random() * 6 + 3) * 1000;
    const willAccept = Math.random() > 0.3; // 70% accept rate

    const responseTimer = setTimeout(() => {
      setStatus(willAccept ? "accepted" : "rejected");
      clearTimers();
      if (willAccept) {
        const navTimer = setTimeout(() => onAccept(), 1200);
        timersRef.current.push(navTimer);
      } else {
        const closeTimer = setTimeout(() => onReject(), 1500);
        timersRef.current.push(closeTimer);
      }
    }, responseDelay);
    timersRef.current.push(responseTimer);

    // Countdown ticker
    const tickTimer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickTimer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    timersRef.current.push(tickTimer);

    // Timeout — no response in 10s
    const timeoutTimer = setTimeout(() => {
      if (status === "waiting") {
        setStatus("timeout");
        const closeT = setTimeout(() => onReject(), 2000);
        timersRef.current.push(closeT);
      }
    }, COUNTDOWN_SECONDS * 1000);
    timersRef.current.push(timeoutTimer);

    return clearTimers;
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    timersRef.current = [];
  };

  const progress = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;

  const renderAvatar = () => {
    if (!user) return null;
    if (user.visibility === "anonymous") {
      return (
        <div className="w-16 h-16 rounded-full glass flex items-center justify-center">
          <EyeOff className="w-7 h-7 text-white/40" />
        </div>
      );
    }
    if (user.visibility === "first_name") {
      return (
        <div className="w-16 h-16 rounded-full gradient-blue flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{getDisplayName(user).charAt(0)}</span>
        </div>
      );
    }
    return <UserAvatar src={user.profile_photo} size="lg" isOnline={user.is_online} />;
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={status === "accepted" ? undefined : onClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="glass-strong rounded-3xl p-8 text-center">
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 right-4">
              <X className="w-5 h-5 text-white/40" />
            </button>

            {/* Avatar */}
            <div className="relative inline-block mb-4">
              {renderAvatar()}
              {/* Status overlay */}
              {status !== "waiting" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-[hsl(0,0%,8%)] flex items-center justify-center ${
                    status === "accepted" ? "bg-green-500" : status === "rejected" ? "bg-red-500" : "bg-amber-500"
                  }`}
                >
                  {status === "accepted" && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  {status === "rejected" && <X className="w-4 h-4 text-white" strokeWidth={3} />}
                  {status === "timeout" && <Clock className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </motion.div>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h2 className="text-white font-bold text-lg">{getDisplayName(user)}</h2>
              {user?.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
              {user?.is_premium && <Crown className="w-4 h-4 text-amber-400" />}
            </div>

            {/* Status text */}
            <div className="min-h-[60px] flex flex-col items-center justify-center">
              {status === "waiting" && (
                <>
                  <p className="text-white/60 text-sm mb-3">Requesting to chat…</p>
                  {/* Countdown ring */}
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="url(#countdownGrad)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                      <defs>
                        <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#60A5FA" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{secondsLeft}</span>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mt-3">Waiting for response</p>
                </>
              )}

              {status === "accepted" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-green-400 font-semibold text-base mb-1">Chat accepted!</p>
                  <p className="text-white/40 text-xs">Opening conversation…</p>
                </motion.div>
              )}

              {status === "rejected" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-red-400 font-semibold text-base mb-1">Request declined</p>
                  <p className="text-white/40 text-xs mb-3">They're not available right now</p>
                  <button onClick={onClose} className="px-6 py-2 rounded-xl glass text-white/70 text-sm font-medium active:scale-95 transition-transform">Dismiss</button>
                </motion.div>
              )}

              {status === "timeout" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-amber-400 font-semibold text-base mb-1">No response</p>
                  <p className="text-white/40 text-xs mb-3">They didn't respond in time</p>
                  <button onClick={onClose} className="px-6 py-2 rounded-xl glass text-white/70 text-sm font-medium active:scale-95 transition-transform">Dismiss</button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}