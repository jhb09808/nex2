import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import AreaCounters from "@/components/nex/AreaCounters";
import GlobalCounters from "@/components/nex/GlobalCounters";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] flex flex-col items-center justify-between px-6 py-12 safe-top safe-bottom max-w-lg mx-auto">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-20 h-20 rounded-3xl gradient-blue glow-blue flex items-center justify-center mb-8"
        >
          <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
          NEX<span className="gradient-text">2</span>
        </h1>

        <p className="text-white/50 text-lg leading-relaxed max-w-xs">
          Discover people nearby who share your interests. No followers needed.
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
        className="w-full space-y-3"
      >
        <button
          onClick={() => navigate("/register")}
          className="w-full py-4 rounded-2xl gradient-blue text-white font-semibold text-base flex items-center justify-center gap-2 glow-blue active:scale-[0.98] transition-transform"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 rounded-2xl glass text-white/70 font-medium text-base active:scale-[0.98] transition-transform"
        >
          I already have an account
        </button>
      </motion.div>
    </div>
  );
}