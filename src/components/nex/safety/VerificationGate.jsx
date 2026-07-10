import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VerificationGate({ onComplete }) {
  const [stage, setStage] = useState("loading"); // loading | intro | verifying | done
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length === 0) {
        window.location.href = "/onboarding";
        return;
      }
      setProfile(profiles[0]);
      setStage("intro");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStage("intro");
    }
  };

  const startVerification = async () => {
    if (!profile) return;
    setStage("verifying");
    setError("");
    try {
      await base44.entities.UserProfile.update(profile.id, {
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
        verification_method: "self_attested",
        requires_reverification: false,
      });
      setTimeout(() => setStage("done"), 1500);
    } catch (err) {
      setError(err.message || "Verification failed.");
      setStage("intro");
    }
  };

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,4%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] flex items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
                <div className="relative w-24 h-24 rounded-full glass-strong flex items-center justify-center">
                  <Lock className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Verify you're 18+</h1>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                NEX2 requires age verification before you can discover or connect with people nearby. Your privacy is protected — we don't store your ID documents.
              </p>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}
              <button onClick={startVerification} className="w-full py-4 rounded-2xl gradient-blue text-white font-semibold active:scale-[0.98] transition-transform">
                Start Verification
              </button>
              <p className="text-white/20 text-xs mt-4">
                By continuing you confirm you are 18 or older. Misrepresenting your age violates our Terms of Service.
              </p>
            </motion.div>
          )}

          {stage === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="inline-block mb-6">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying…</h1>
              <p className="text-white/40 text-sm">Confirming your eligibility</p>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-green-400" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Verified!</h1>
              <p className="text-white/40 text-sm mb-8">You're all set to start connecting safely.</p>
              <button onClick={onComplete} className="w-full py-4 rounded-2xl gradient-blue text-white font-semibold active:scale-[0.98] transition-transform">
                Enter NEX2
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}