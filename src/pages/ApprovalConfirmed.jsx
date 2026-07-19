import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Map } from "lucide-react";
import CyberRadar from "@/components/nex/CyberRadar";

export default function ApprovalConfirmed() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hasAccount = params.get("has_account") === "true";

  return (
    <div className="fixed inset-0 cyber-bg flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md cyber-frame cyber-corners relative rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <img
            src="https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/a1047e68c_29CEE08A-B9AB-4759-8C30-4B99BC19A018.png"
            alt="NEX2"
            className="h-14 w-auto object-contain"
          />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 ai-dot" />
            <span className="text-[10px] font-cyber font-semibold text-green-400 tracking-widest">APPROVED</span>
          </div>
        </div>

        <CyberRadar />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center space-y-3 mt-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mx-auto"
            style={{ boxShadow: "0 0 20px rgba(0,255,102,0.15)" }}
          >
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>

          <h1 className="font-cyber text-xl sm:text-2xl font-bold tracking-wider text-white neon-text">
            YOUR ACCOUNT HAS BEEN APPROVED
          </h1>
          <p className="text-blue-200/50 text-xs tracking-wide">
            {hasAccount
              ? "You're all set. Welcome to NEX2 — jump back into the radar."
              : "You're in. Create your profile to start discovering people nearby."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={() => navigate(hasAccount ? "/" : "/register")}
            className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform"
          >
            {hasAccount ? (
              <><Map className="w-4 h-4" /> GO TO MAP</>
            ) : (
              <>CREATE YOUR PROFILE NOW <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>

        <div className="flex items-center justify-center pt-4 mt-6 border-t border-blue-500/10">
          <span className="text-blue-200/40 text-[10px] tracking-wide">© 2026 NEX2, Inc. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  );
}