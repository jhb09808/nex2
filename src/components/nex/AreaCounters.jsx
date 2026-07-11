import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, MapPin, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AreaCounters() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}