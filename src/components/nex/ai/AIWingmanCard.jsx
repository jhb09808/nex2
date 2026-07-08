import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, AlertTriangle, Bell } from "lucide-react";

const TYPE_CONFIG = {
  recommend: { icon: Sparkles, color: "text-blue-400", bg: "from-blue-500/10 to-violet-500/5", border: "rgba(96,165,250,0.12)" },
  warn: { icon: AlertTriangle, color: "text-amber-400", bg: "from-amber-500/10 to-orange-500/5", border: "rgba(245,158,11,0.12)" },
  notify: { icon: Bell, color: "text-violet-400", bg: "from-violet-500/10 to-blue-500/5", border: "rgba(139,92,246,0.12)" },
};

export default function AIWingmanCard({ insight, onAction, onDismiss, compact = false }) {
  const [dismissed, setDismissed] = useState(false);
  const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.recommend;
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="ai-card ai-border rounded-2xl p-4 relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} pointer-events-none`} />

          <div className="relative flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${config.color}`}>AI Wingman</span>
                <div className={`w-1 h-1 rounded-full ${config.color.replace("text-", "bg-")} ai-dot`} />
              </div>
              <p className="text-white font-semibold text-sm leading-tight mb-1">{insight.title}</p>
              {!compact && <p className="text-white/50 text-xs leading-relaxed">{insight.body}</p>}
            </div>

            <button onClick={handleDismiss} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5 text-white/30" />
            </button>
          </div>

          {insight.action_label && (
            <button
              onClick={onAction}
              className="relative mt-3 ml-12 flex items-center gap-1.5 text-blue-400 text-xs font-medium group"
            >
              {insight.action_label}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}