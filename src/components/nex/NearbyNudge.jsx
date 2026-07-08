import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NearbyNudge() {
  const navigate = useNavigate();
  const [nudges, setNudges] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("checkNearbySharedInterests", {});
        if (isMounted && res.data?.matches?.length > 0) {
          setNudges(res.data.matches);
        }
      } catch {
        // Silent fail — nudge is non-critical
      }
    })();
    return () => { isMounted = false; };
  }, []);

  if (nudges.length === 0 || dismissed) return null;

  const top = nudges[0];
  const extraCount = nudges.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <motion.button
          onClick={() => navigate("/map")}
          className="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left relative overflow-hidden group"
          whileTap={{ scale: 0.98 }}
        >
          {/* Subtle animated glow background */}
          <div className="absolute inset-0 gradient-blue opacity-10" />
          <motion.div
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-blue-500/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative w-10 h-10 rounded-xl gradient-blue flex items-center justify-center flex-shrink-0 glow-blue-sm">
            <MapPin className="w-5 h-5 text-white" />
          </div>

          <div className="relative flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {top.username} is nearby
            </p>
            <p className="text-white/50 text-xs truncate">
              Shared: {top.sharedInterests.slice(0, 2).join(" · ")}
              {extraCount > 0 && ` · +${extraCount} more`}
            </p>
          </div>

          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="relative text-white/30 hover:text-white/60 transition-colors flex-shrink-0 p-1"
          >
            <X className="w-4 h-4" />
          </span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}