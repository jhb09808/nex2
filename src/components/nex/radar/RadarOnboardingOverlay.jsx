import React, { useState } from "react";
import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { RADAR_INTERESTS, MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "./constants";

export default function RadarOnboardingOverlay({ onComplete }) {
  const [selected, setSelected] = useState([]);

  const canEnter = selected.length >= MIN_INTEREST_SELECTIONS && selected.length <= MAX_INTEREST_SELECTIONS;

  const toggleInterest = (interest) => {
    setSelected((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= MAX_INTEREST_SELECTIONS) return prev;
      return [...prev, interest];
    });
  };

  const handleEnter = () => {
    if (!canEnter) return;
    onComplete(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
    >
      {/* Ambient dim layer */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Glass card */}
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-7">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mx-auto mb-4 glow-blue">
              <Radar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Calibrate Your Radar</h2>
            <p className="text-white/40 text-sm">Pick {MAX_INTEREST_SELECTIONS} interests to find your best matches nearby</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs text-white/40 font-medium">
              {selected.length} of {MAX_INTEREST_SELECTIONS} selected
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX_INTEREST_SELECTIONS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < selected.length ? "gradient-blue scale-110" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Interest chips */}
          <div className="flex flex-wrap gap-2 mb-6 max-h-[260px] overflow-y-auto scrollbar-hide">
            {RADAR_INTERESTS.map((interest) => {
              const isSelected = selected.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                    isSelected
                      ? "gradient-blue text-white glow-blue-sm"
                      : "glass text-white/50 hover:text-white/70"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={handleEnter}
            disabled={!canEnter}
            className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              canEnter
                ? "gradient-blue text-white glow-blue active:scale-[0.98]"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {canEnter ? (
              <>
                <Radar className="w-4 h-4" /> Enter the Radar
              </>
            ) : (
              `Select ${MIN_INTEREST_SELECTIONS - selected.length} more`
            )}
          </button>
          <p className="text-white/25 text-[11px] text-center mt-2">Max {MAX_INTEREST_SELECTIONS} — pick what matters most</p>
        </div>
      </motion.div>
    </motion.div>
  );
}