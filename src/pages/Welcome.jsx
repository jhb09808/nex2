import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AreaCounters from "@/components/nex/AreaCounters";
import GlobalCounters from "@/components/nex/GlobalCounters";
import CyberRadar from "@/components/nex/CyberRadar";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 cyber-bg flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md cyber-frame cyber-corners relative rounded-2xl p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/a1047e68c_29CEE08A-B9AB-4759-8C30-4B99BC19A018.png"
            alt="NEX2"
            className="h-14 w-auto object-contain"
          />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 ai-dot" />
            <span className="text-[10px] font-cyber font-semibold text-green-400 tracking-widest">EARLY ACCESS</span>
          </div>
        </div>

        <CyberRadar />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-1.5"
        >
          <h1 className="font-cyber text-xl sm:text-2xl font-bold tracking-wider text-white neon-text">
            DISCOVER PEOPLE NEARBY
          </h1>
          <p className="text-[11px] sm:text-xs text-blue-200/60 tracking-wide">
            WHO SHARE YOUR INTERESTS. NO FOLLOWERS. NO PRESSURE.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full"
        >
          <GlobalCounters />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full"
        >
          <AreaCounters />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full space-y-2.5 pt-1"
        >
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform"
          >
            GET STARTED <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 rounded-xl bg-transparent border border-blue-400/20 text-white font-cyber font-semibold text-sm tracking-wider transition-transform hover:border-blue-400/40"
          >
            I ALREADY HAVE AN ACCOUNT →
          </button>
        </motion.div>

        <div className="flex items-center justify-center pt-3 border-t border-blue-500/10">
          <span className="text-blue-200/40 text-[10px] tracking-wide">© 2026 NEX2, Inc. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  );
}