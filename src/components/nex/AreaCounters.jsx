import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, MapPin, Loader2, Mail, Phone, Check, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AreaCounters() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Join form state
  const [showJoin, setShowJoin] = useState(false);
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");

  const handleCheck = async () => {
    if (!/^\d{5}$/.test(zip.trim())) {
      setError("Enter a valid 5-digit ZIP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getAreaCounts", { zip_code: zip.trim() });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Couldn't load counts. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoinError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(joinEmail.trim())) {
      setJoinError("Enter a valid email");
      return;
    }
    if (!/^\d{5}$/.test(zip.trim())) {
      setJoinError("Enter a valid 5-digit ZIP first");
      return;
    }
    setJoining(true);
    try {
      const res = await base44.functions.invoke("joinWaitlist", {
        email: joinEmail.trim(),
        phone: joinPhone.trim(),
        zip_code: zip.trim(),
      });
      if (res.data?.success) {
        setJoined(true);
      } else {
        setJoinError(res.data?.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setJoinError("Couldn't join. Try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="w-full">
      {/* ZIP input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Your ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-500/30 transition-colors"
          />
        </div>
        <button
          onClick={handleCheck}
          disabled={loading || zip.length < 5}
          className="px-5 py-3 rounded-xl gradient-blue text-white font-medium text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </button>
      </div>

      {error && <p className="text-red-400/70 text-xs mb-3 text-center">{error}</p>}

      {/* Counters */}
      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            key="counters"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {/* Waitlist counter — urgency */}
            {data.waitlist_count > 0 && (
              <div className="relative glass-strong rounded-2xl p-4 overflow-hidden">
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <div className="absolute inset-0 rounded-xl border border-orange-500/20 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white leading-none">
                      {data.waitlist_count}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      {data.waitlist_fallback ? "people in your area on the waitlist" : "people near you on the waitlist"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active counter — social proof */}
            {data.active_count > 0 && (
              <div className="relative glass-strong rounded-2xl p-4 overflow-hidden">
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <div className="absolute inset-0 rounded-xl border border-blue-500/20 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white leading-none">
                      {data.active_count}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      {data.active_fallback ? "active members in your area" : "active members near you"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Threshold messaging */}
            <p className="text-center text-white/30 text-xs pt-1">
              We launch in your area once we hit 100 nearby
            </p>

            {/* Join waitlist CTA */}
            {!joined && (
              <button
                onClick={() => setShowJoin(!showJoin)}
                className="w-full py-3 rounded-xl glass text-white/70 font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <UserPlus className="w-4 h-4" /> Join the waitlist
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join form */}
      <AnimatePresence>
        {showJoin && !joined && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass-strong rounded-2xl p-4 space-y-3 mt-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-500/30 transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-500/30 transition-colors"
                />
              </div>
              {joinError && <p className="text-red-400/70 text-xs text-center">{joinError}</p>}
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3 rounded-xl gradient-blue text-white font-medium text-sm disabled:opacity-40 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reserve my spot"}
              </button>
              <p className="text-center text-white/30 text-[11px]">
                We'll text or email you when NEX2 launches near {zip}
              </p>
            </div>
          </motion.div>
        )}

        {joined && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-4 flex items-center gap-3 mt-3"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">You're on the list!</p>
              <p className="text-white/40 text-xs">We'll notify you when NEX2 launches in your area.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}