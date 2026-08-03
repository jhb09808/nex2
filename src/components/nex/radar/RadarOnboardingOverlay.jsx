import React, { useState } from "react";
import { motion } from "framer-motion";
import InterestPicker from "@/components/nex/radar/InterestPicker";
import { MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "./constants";

export default function RadarOnboardingOverlay({ onComplete }) {
  const [selected, setSelected] = useState([]);

  const handleEnter = () => {
    if (selected.length < MIN_INTEREST_SELECTIONS) return;
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
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="cyber-frame cyber-corners rounded-3xl p-5 h-[80vh] flex flex-col">
          <InterestPicker
            selected={selected}
            onChange={setSelected}
            showSave
            onSave={handleEnter}
            saveLabel="ENTER THE RADAR"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}