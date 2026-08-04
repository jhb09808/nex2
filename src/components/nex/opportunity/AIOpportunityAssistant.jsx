import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, TrendingUp, Users, DollarSign, Briefcase } from "lucide-react";
import { DEMO_PROVIDERS } from "./demoOpportunities";
import { calculateProfileOpportunityScore } from "./matchScoring";
import { getProvidesLabel, getLookingForLabel, getIAmLabel, NEED_TO_PROVIDER_MAP } from "./opportunityCategories";

export default function AIOpportunityAssistant({ profile, onJumpToOpportunity }) {
  const [expanded, setExpanded] = useState(false);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const generated = generateInsights(profile);
    setInsights(generated);
  }, [profile]);

  if (!profile || insights.length === 0) return null;

  return (
    <div className="ai-card rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
            <Sparkles size={13} className="text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-cyber font-semibold text-white">Opportunity Assistant</p>
            <p className="text-[10px] text-blue-300/60">{insights.length} new {insights.length === 1 ? "insight" : "insights"}</p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center transition-transform ${expanded ? "rotate-180" : ""}`}>
          <ArrowRight size={12} className="text-blue-400 rotate-90" />
        </div>
      </button>

      {/* Expandable insights */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-4 py-3 space-y-2.5">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                    {insight.icon === "users" && <Users size={12} className="text-blue-400" />}
                    {insight.icon === "dollar" && <DollarSign size={12} className="text-emerald-400" />}
                    {insight.icon === "trending" && <TrendingUp size={12} className="text-purple-400" />}
                    {insight.icon === "briefcase" && <Briefcase size={12} className="text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/70 leading-relaxed">{insight.text}</p>
                    {insight.action && (
                      <button
                        onClick={() => onJumpToOpportunity?.(insight.action)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-cyber uppercase tracking-wider mt-1 flex items-center gap-1"
                      >
                        {insight.actionLabel || "View"} <ArrowRight size={9} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function generateInsights(profile) {
  const insights = [];
  const lookingFor = profile.looking_for || [];
  const provides = profile.provides || [];

  // Find matching providers from demo data
  const scoredProviders = DEMO_PROVIDERS.map((p) => ({
    provider: p,
    match: calculateProfileOpportunityScore(profile, p),
  })).sort((a, b) => b.match.score - a.match.score);

  const topMatches = scoredProviderMatches(scoredProviders, 3);
  const verifiedMatches = scoredProviders.filter((s) => s.provider.is_verified && s.match.score > 60);

  // Insight: high-value matches
  if (topMatches.length > 0) {
    const best = topMatches[0];
    insights.push({
      icon: "trending",
      text: `${best.match.score}% opportunity match with ${best.provider.company_name} — ${best.match.reasons[0] || "strong compatibility"}.`,
      action: "discover",
      actionLabel: "View Match",
    });
  }

  // Insight: hiring matches
  const hiringProviders = DEMO_PROVIDERS.filter((p) => p.hiring_mode_enabled);
  if (lookingFor.some((n) => ["employees", "interns", "software_developers", "ai_developers", "sales_representatives"].includes(n)) && hiringProviders.length > 0) {
    insights.push({
      icon: "briefcase",
      text: `${hiringProviders.length} ${hiringProviders.length === 1 ? "business is" : "businesses are"} currently hiring in your area of interest.`,
      action: "hiring",
      actionLabel: "View Hiring",
    });
  }

  // Insight: verified lenders
  if (lookingFor.some((n) => ["construction_funding", "working_capital", "investors", "venture_capital"].includes(n))) {
    const lenderCount = verifiedMatches.length;
    if (lenderCount > 0) {
      insights.push({
        icon: "dollar",
        text: `${lenderCount} verified ${lenderCount === 1 ? "lender matches" : "lenders match"} your funding requirements.`,
        action: "funding",
        actionLabel: "View Lenders",
      });
    }
  }

  // Insight: providers looking for what you provide
  if (provides.length > 0) {
    const needCount = DEMO_PROVIDERS.filter((p) => {
      const providerNeeds = p.looking_for || [];
      return providerNeeds.some((need) => {
        const needMap = NEED_TO_PROVIDER_MAP_REV[need] || [];
        return needMap.some((pid) => provides.includes(pid));
      });
    }).length;
    if (needCount > 0) {
      insights.push({
        icon: "users",
        text: `${needCount} ${needCount === 1 ? "user is" : "users are"} actively looking for ${getProvidesLabel(provides[0]).toLowerCase()} — you can help them.`,
        action: "discover",
        actionLabel: "View Opportunities",
      });
    }
  }

  // Insight: profile completeness
  if (!profile.i_am) {
    insights.push({
      icon: "trending",
      text: "Complete your 'I Am' profile to unlock higher-quality opportunity matches.",
      action: "edit-profile",
      actionLabel: "Complete Profile",
    });
  }

  return insights.slice(0, 5);
}

function scoredProviderMatches(scored, limit) {
  return scored.filter((s) => s.match.score > 50).slice(0, limit);
}

// Reverse lookup for need → provider mapping
const NEED_TO_PROVIDER_MAP_REV = Object.entries(NEED_TO_PROVIDER_MAP).reduce((acc, [needId, provIds]) => {
  provIds.forEach((pid) => {
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(needId);
  });
  return acc;
}, {});