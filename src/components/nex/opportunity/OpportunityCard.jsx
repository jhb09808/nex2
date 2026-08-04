import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Globe, Zap, ArrowRight } from "lucide-react";
import { formatCurrency } from "./matchScoring";
import { getProvidesLabel, getLookingForLabel } from "./opportunityCategories";

export default function OpportunityCard({ provider, matchResult, onViewDetails, onRequestConnection }) {
  const { score, reasons } = matchResult;
  const scoreColor = score >= 85 ? "text-emerald-400" : score >= 70 ? "text-blue-400" : "text-white/60";
  const ringColor = score >= 85 ? "border-emerald-400/30" : score >= 70 ? "border-blue-400/30" : "border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`ai-card ${ringColor} rounded-2xl p-5 space-y-4`}
    >
      {/* Header: score + name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-base font-cyber font-semibold text-white truncate">{provider.company_name}</h3>
            {provider.is_verified && <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />}
          </div>
          <p className="text-xs text-white/40 truncate">{provider.industry}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-cyber font-bold ${scoreColor}`}>{score}%</div>
          <div className="text-[9px] uppercase tracking-wider text-white/30">Match</div>
        </div>
      </div>

      {/* What they provide */}
      <div className="flex flex-wrap gap-1.5">
        {(provider.provides || []).slice(0, 3).map((p) => (
          <span key={p} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-medium">
            {getProvidesLabel(p)}
          </span>
        ))}
        {provider.provides?.length > 3 && (
          <span className="px-2 py-0.5 text-[10px] text-white/30">+{provider.provides.length - 3}</span>
        )}
      </div>

      {/* Match reasons */}
      {reasons.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-white/50">
              <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[10px] text-white/40 pt-1 border-t border-white/5">
        {provider.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {provider.location}
          </span>
        )}
        {provider.max_deal_size > 0 && (
          <span className="flex items-center gap-1">
            <Zap size={10} /> {formatCurrency(provider.min_deal_size)}–{formatCurrency(provider.max_deal_size)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Globe size={10} /> {provider.service_area}
        </span>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${provider.currently_accepting ? "bg-emerald-400 ai-dot" : "bg-white/20"}`} />
        <span className="text-[10px] text-white/40">
          {provider.currently_accepting ? "Currently accepting opportunities" : "Not accepting new opportunities"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onViewDetails(provider, matchResult)}
          className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/70 text-xs font-cyber font-medium tracking-wide hover:border-blue-400/30 hover:text-white transition-all"
        >
          View Match Details
        </button>
        <button
          onClick={() => onRequestConnection(provider, matchResult)}
          className="flex-1 py-2.5 rounded-lg neon-btn text-white text-xs font-cyber font-bold tracking-wide flex items-center justify-center gap-1"
        >
          Request Connection <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}