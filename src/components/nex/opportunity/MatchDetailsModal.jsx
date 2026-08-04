import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgeCheck, MapPin, Globe, Clock, Zap, Users, CheckCircle2, Shield, Lock } from "lucide-react";
import { formatCurrency } from "./matchScoring";
import { getProvidesLabel, getLookingForLabel } from "./opportunityCategories";

export default function MatchDetailsModal({ provider, matchResult, request, onClose, onRequestConnection }) {
  const { score, reasons, details } = matchResult;

  const detailRows = [
    { label: "Need", value: request?.looking_for?.map(getLookingForLabel).join(", ") || "—" },
    { label: "Provider Service", value: provider.provides?.map(getProvidesLabel).join(", ") || "—" },
    { label: "Requested Amount", value: request?.requested_amount ? formatCurrency(request.requested_amount) : "—" },
    { label: "Provider Range", value: provider.max_deal_size > 0 ? `${formatCurrency(provider.min_deal_size)} – ${formatCurrency(provider.max_deal_size)}` : "—" },
    { label: "Geographic Compatibility", value: details.geoMatch ? "Compatible" : "Review needed" },
    { label: "Timeline Compatibility", value: details.timelineMatch ? "Yes" : "Review needed" },
    { label: "Industry Compatibility", value: `${score}%` },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide glass-strong rounded-t-3xl sm:rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass-strong border-b border-white/5 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-cyber uppercase tracking-wider text-blue-300">Match Details</span>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-6">
            {/* Company header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="text-xl font-cyber font-bold text-white">{provider.company_name}</h2>
                  {provider.is_verified && <BadgeCheck size={16} className="text-blue-400" />}
                </div>
                <p className="text-sm text-white/50">{provider.industry}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-cyber font-bold text-blue-400">{score}%</div>
                <div className="text-[9px] uppercase tracking-wider text-white/30">Match Score</div>
              </div>
            </div>

            {/* Why you matched */}
            <div className="space-y-3">
              <h3 className="text-xs font-cyber uppercase tracking-[0.2em] text-blue-300">Why You Matched</h3>
              {reasons.length > 0 ? (
                <div className="space-y-2">
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">Limited match data available.</p>
              )}
            </div>

            {/* Compatibility details */}
            <div className="space-y-2">
              {detailRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-white/40">{row.label}</span>
                  <span className="text-sm text-white/80 font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="space-y-2">
              <h3 className="text-xs font-cyber uppercase tracking-[0.2em] text-blue-300">About the Company</h3>
              <p className="text-sm text-white/60 leading-relaxed">{provider.bio}</p>
            </div>

            {/* Services & Deal info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-white/30">Typical Deal Size</p>
                <p className="text-sm text-white/80">
                  {provider.max_deal_size > 0 ? `${formatCurrency(provider.min_deal_size)} – ${formatCurrency(provider.max_deal_size)}` : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-white/30">Response Time</p>
                <p className="text-sm text-white/80">{provider.avg_response_time || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-white/30">Markets Served</p>
                <p className="text-sm text-white/80">{provider.markets_served?.join(", ") || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-white/30">Response Rate</p>
                <p className="text-sm text-white/80">{provider.response_rate ? `${provider.response_rate}%` : "—"}</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <Shield size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-200/60 leading-relaxed">
                Match scores are based on profile compatibility and do not represent loan approval, investment approval,
                financial advice, or guaranteed eligibility. Users must independently verify all parties and terms.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => onRequestConnection(provider, matchResult)}
              className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2"
            >
              <Lock size={14} /> Request a Private Introduction
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}