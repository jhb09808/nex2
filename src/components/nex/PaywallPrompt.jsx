import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ArrowRight } from "lucide-react";
import GlassCard from "@/components/nex/GlassCard";

const PAYWALL_CONTENT = {
  radius: {
    icon: "🌍",
    headline: "Your world just got bigger.",
    body: "Unlock a 10 mile radius with Plus — see who's around beyond your block.",
    cta: "Upgrade to Plus — $9.99/mo",
  },
  chat_limit: {
    icon: "💬",
    headline: "You're out of chats for today.",
    body: "Go unlimited with Plus — talk to as many people as you want, whenever you want.",
    cta: "Upgrade to Plus — $9.99/mo",
  },
  invisible: {
    icon: "👻",
    headline: "Browse without being seen.",
    body: "Invisible Mode lets you check out who's nearby without showing up in their list. Available on Plus.",
    cta: "Unlock Invisible Mode",
  },
  analytics: {
    icon: "📊",
    headline: "Curious who's checking you out?",
    body: "Pro members see profile views, get daily visibility boosts, and jump the line in discovery.",
    cta: "Upgrade to Pro — $19.99/mo",
  },
  platinum: {
    icon: "💎",
    headline: "Welcome to the top 1%.",
    body: "Platinum unlocks global reach, a verified badge, and a network of members who mean business.",
    cta: "Go Platinum — $1,000/mo",
  },
};

export default function PaywallPrompt({ variant, open, onClose }) {
  const navigate = useNavigate();
  const content = PAYWALL_CONTENT[variant];
  if (!content) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard strong className="relative !p-6 text-center overflow-hidden">
              {/* Subtle gradient backdrop */}
              <div className="absolute inset-0 gradient-blue opacity-[0.06] pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center z-10"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mx-auto mb-4 glow-blue">
                  <span className="text-3xl">{content.icon}</span>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{content.headline}</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                  {content.body}
                </p>

                <button
                  onClick={() => {
                    onClose();
                    navigate("/premium");
                  }}
                  className="w-full py-3.5 rounded-2xl gradient-blue text-white font-semibold text-sm active:scale-[0.98] transition-transform glow-blue flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {content.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="mt-3 text-white/30 text-xs hover:text-white/50 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}