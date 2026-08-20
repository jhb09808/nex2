import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Briefcase, TrendingUp, Handshake, Loader2, ArrowRight, ChevronDown, Building2 } from "lucide-react";
import useOpportunityInsight from "@/hooks/useOpportunityInsight";
import { AVAILABLE_FOR_OPTIONS } from "@/components/nex/opportunity/opportunityCategories";

export default function ProfileOpportunitySection({ profile, isOwnProfile = false }) {
  const { insight, loading } = useOpportunityInsight(profile);

  const ICONS = {
    briefcase: Briefcase,
    trending: TrendingUp,
    handshake: Handshake,
  };

  const availableForLabels = (profile?.available_for || [])
    .map((id) => AVAILABLE_FOR_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);

  // Build industry-specific detail blocks (only shown on demand)
  const industryDetails = [];

  if (profile?.company_name || profile?.business_bio || profile?.website) {
    industryDetails.push({
      id: "business",
      icon: Building2,
      label: "Business",
      accent: "text-blue-300",
      bg: "bg-blue-500/5 border-blue-500/10",
      rows: [
        profile.company_name && { label: "Company", value: profile.company_name },
        profile.industry && { label: "Industry", value: profile.industry },
        profile.business_bio && { label: "About", value: profile.business_bio },
        profile.website && { label: "Website", value: profile.website },
        profile.service_area && { label: "Service Area", value: profile.service_area },
        profile.project_types?.length > 0 && { label: "Project Types", value: profile.project_types.join(", ") },
        profile.markets_served?.length > 0 && { label: "Markets Served", value: profile.markets_served.join(", ") },
      ].filter(Boolean),
    });
  }

  return (
    <div className="cyber-frame cyber-corners relative rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <p className="text-sm font-cyber font-bold text-white neon-text">OPPORTUNITIES</p>
          <p className="text-[9px] font-cyber text-cyan-300/40 uppercase tracking-wider">AI-powered discovery</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      ) : insight ? (
        <>
          {/* Offer & Need summaries */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-2.5">
              <p className="text-[9px] font-cyber uppercase tracking-wider text-cyan-300/50 mb-1">I Offer</p>
              <p className="text-[11px] text-white/70 leading-snug">{insight.offer_summary}</p>
            </div>
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-2.5">
              <p className="text-[9px] font-cyber uppercase tracking-wider text-violet-300/50 mb-1">I Want</p>
              <p className="text-[11px] text-white/70 leading-snug">{insight.need_summary}</p>
            </div>
          </div>

          {/* Connection pitch */}
          <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-400/15 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-300 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-white/70 leading-snug">{insight.connection_pitch}</p>
            </div>
          </div>

          {/* Available for tags */}
          {availableForLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableForLabels.map((label) => (
                <span key={label} className="px-2 py-0.5 rounded-full text-[9px] font-cyber font-medium bg-blue-500/10 text-blue-300/70 border border-blue-500/10">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Industry-specific details — collapsed by default */}
          {industryDetails.length > 0 && (
            <IndustryDetailsDropdown details={industryDetails} />
          )}
        </>
      ) : null}
    </div>
  );
}

function IndustryDetailsDropdown({ details }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="space-y-1.5 pt-1 border-t border-white/5">
      <p className="text-[9px] font-cyber uppercase tracking-wider text-white/30 pt-2">
        Industry Details
      </p>
      {details.map((detail) => {
        const isOpen = openId === detail.id;
        const Icon = detail.icon;
        return (
          <div key={detail.id} className={`rounded-xl border ${isOpen ? detail.bg : "border-white/5 bg-white/[0.02]"} overflow-hidden transition-colors`}>
            <button
              onClick={() => setOpenId(isOpen ? null : detail.id)}
              className="w-full flex items-center gap-2.5 p-2.5 active:scale-[0.99] transition-transform"
            >
              <Icon className={`w-3.5 h-3.5 ${detail.accent} flex-shrink-0`} />
              <span className="text-[11px] font-cyber font-semibold text-white/70 flex-1 text-left">{detail.label}</span>
              <span className="text-[9px] text-white/30 font-cyber">{detail.rows.length} {detail.rows.length === 1 ? "detail" : "details"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-2.5 pb-2.5 space-y-1.5">
                    {detail.rows.map((row, i) => (
                      <div key={i} className="flex flex-col gap-0.5 py-1 px-2 bg-black/20 rounded-lg">
                        <p className="text-[9px] font-cyber uppercase tracking-wider text-white/30">{row.label}</p>
                        <p className="text-[11px] text-white/70 leading-snug">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}