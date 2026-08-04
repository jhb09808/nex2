import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, TrendingUp, DollarSign, Handshake, Users, Wrench, MapPin, Globe, ChevronRight } from "lucide-react";
import { DEMO_PROVIDERS } from "./demoOpportunities";
import { calculateProfileOpportunityScore } from "./matchScoring";
import { getProvidesLabel, getLookingForLabel } from "./opportunityCategories";
import OpportunityCard from "./OpportunityCard";

const ICONS = { Briefcase, TrendingUp, DollarSign, Handshake, Users, Wrench, MapPin, Globe };

const SECTIONS = [
  {
    id: "hiring_now",
    label: "Hiring Now",
    icon: "Briefcase",
    filter: (p) => p.hiring_mode_enabled,
    emptyText: "No businesses are currently hiring.",
  },
  {
    id: "seeking_investors",
    label: "Seeking Investors",
    icon: "TrendingUp",
    filter: (p) => (p.looking_for || []).some((n) => ["investors", "venture_capital", "angel_investment"].includes(n)),
    emptyText: "No one is currently seeking investors.",
  },
  {
    id: "looking_for_funding",
    label: "Looking For Funding",
    icon: "DollarSign",
    filter: (p) => (p.looking_for || []).some((n) => ["construction_funding", "working_capital", "business_lines_of_credit", "acquisition_financing"].includes(n)),
    emptyText: "No funding requests right now.",
  },
  {
    id: "businesses_looking_for_clients",
    label: "Businesses Looking For Clients",
    icon: "Handshake",
    filter: (p) => (p.looking_for || []).some((n) => ["clients", "vendors", "customers"].includes(n)) || (p.available_for || []).includes("business_development"),
    emptyText: "No businesses seeking clients right now.",
  },
  {
    id: "freelancers_available",
    label: "Freelancers Available",
    icon: "Users",
    filter: (p) => (p.available_for || []).includes("freelance") || (p.available_for || []).includes("contract_work"),
    emptyText: "No freelancers available right now.",
  },
  {
    id: "service_marketplace",
    label: "Service Marketplace",
    icon: "Wrench",
    filter: (p) => (p.provides || []).length > 0,
    emptyText: "No service providers available.",
  },
  {
    id: "local_opportunities",
    label: "Local Opportunities",
    icon: "MapPin",
    filter: (p) => p.service_area === "local",
    emptyText: "No local opportunities right now.",
  },
  {
    id: "global_opportunities",
    label: "Global Opportunities",
    icon: "Globe",
    filter: (p) => p.service_area === "global",
    emptyText: "No global opportunities right now.",
    platinumOnly: true,
  },
];

export default function OpportunitySections({ profile, isPlatinum, onViewDetails, onRequestConnection }) {
  const [activeSection, setActiveSection] = useState(null);

  const sectionData = useMemo(() => {
    return SECTIONS.map((section) => {
      const filtered = DEMO_PROVIDERS.filter(section.filter);
      const scored = filtered.map((p) => ({
        provider: p,
        matchResult: calculateProfileOpportunityScore(profile, p),
      }));
      scored.sort((a, b) => b.matchResult.score - a.matchResult.score);
      return { ...section, count: scored.length, providers: scored.slice(0, 3) };
    });
  }, [profile]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 rounded-full bg-blue-400" />
        <h2 className="text-xs font-cyber uppercase tracking-[0.2em] text-white/60">Opportunity Categories</h2>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-2 gap-2">
        {sectionData.map((section) => {
          const Icon = ICONS[section.icon] || Briefcase;
          const isLocked = section.platinumOnly && !isPlatinum;
          return (
            <button
              key={section.id}
              onClick={() => !isLocked && setActiveSection(activeSection === section.id ? null : section.id)}
              className={`relative p-3 rounded-xl border text-left transition-all ${
                activeSection === section.id
                  ? "neon-card-active border-blue-400/30"
                  : "bg-white/[0.02] border-white/5 hover:border-blue-400/15"
              } ${isLocked ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon size={14} className="text-blue-400" />
                {section.count > 0 && (
                  <span className="text-[10px] font-cyber font-bold text-blue-300">{section.count}</span>
                )}
                {isLocked && <span className="text-[9px] text-amber-400/70">PLATINUM</span>}
              </div>
              <p className="text-[10px] text-white/60 leading-tight">{section.label}</p>
            </button>
          );
        })}
      </div>

      {/* Active section results */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3"
          >
            {sectionData.find((s) => s.id === activeSection)?.providers.map(({ provider, matchResult }) => (
              <OpportunityCard
                key={provider.id}
                provider={provider}
                matchResult={matchResult}
                onViewDetails={onViewDetails}
                onRequestConnection={onRequestConnection}
                compact
              />
            ))}
            {sectionData.find((s) => s.id === activeSection)?.providers.length === 0 && (
              <p className="text-center text-xs text-white/30 py-6">
                {sectionData.find((s) => s.id === activeSection)?.emptyText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}