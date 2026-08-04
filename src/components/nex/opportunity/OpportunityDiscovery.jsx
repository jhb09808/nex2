import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, RefreshCw, Shield, Lock, Plus } from "lucide-react";
import { calculateOpportunityMatch } from "./matchScoring";
import { DEMO_PROVIDERS, DEMO_REQUESTS } from "./demoOpportunities";
import OpportunityCard from "./OpportunityCard";
import MatchDetailsModal from "./MatchDetailsModal";
import ConnectionRequestModal from "./ConnectionRequestModal";
import OpportunityRequestModal from "./OpportunityRequestModal";

const FILTERS = [
  { id: "verified_only", label: "Verified Only" },
  { id: "currently_accepting", label: "Available Now" },
  { id: "national", label: "National" },
  { id: "global", label: "Global" },
];

export default function OpportunityDiscovery({ profile, isPlatinum }) {
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connectionTarget, setConnectionTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Use the first demo request as the "current user's request" for matching
  const currentRequest = DEMO_REQUESTS[0];

  const toggleFilter = (id) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Calculate matches
  const matches = useMemo(() => {
    let providers = [...DEMO_PROVIDERS];

    // Apply filters
    if (activeFilters.includes("verified_only")) {
      providers = providers.filter((p) => p.is_verified);
    }
    if (activeFilters.includes("currently_accepting")) {
      providers = providers.filter((p) => p.currently_accepting);
    }
    if (activeFilters.includes("national")) {
      providers = providers.filter((p) => p.service_area === "national" || p.service_area === "global");
    }
    if (activeFilters.includes("global")) {
      providers = providers.filter((p) => p.service_area === "global");
    }

    // Calculate match scores
    const scored = providers.map((p) => ({
      provider: p,
      matchResult: calculateOpportunityMatch(currentRequest, p),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.matchResult.score - a.matchResult.score);

    // Limit to curated set (no endless feed)
    return scored.slice(0, isPlatinum ? 6 : 3);
  }, [activeFilters, currentRequest, isPlatinum, refreshKey]);

  const handleViewDetails = (provider, matchResult) => {
    setSelectedProvider(provider);
    setSelectedMatch(matchResult);
  };

  const handleRequestConnection = (provider, matchResult) => {
    if (selectedProvider !== provider) {
      setSelectedProvider(provider);
      setSelectedMatch(matchResult);
    }
    setConnectionTarget({ provider, matchResult });
  };

  return (
    <div className="space-y-4">
      {/* Post Opportunity button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full py-3 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Post an Opportunity
      </button>

      {/* Current opportunity banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ai-card rounded-2xl p-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 ai-dot" />
          <span className="text-[10px] font-cyber uppercase tracking-wider text-blue-300">Your Active Opportunity</span>
        </div>
        <h3 className="text-sm font-semibold text-white">{currentRequest.title}</h3>
        <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
          <span>💰 ${currentRequest.requested_amount?.toLocaleString()}</span>
          <span>📍 {currentRequest.location}</span>
          <span>⏱ {currentRequest.timeline}</span>
          <span>🌐 {currentRequest.geographic_scope}</span>
        </div>
      </motion.div>

      {/* Filters bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                activeFilters.includes(f.id)
                  ? "neon-btn text-white"
                  : "bg-white/[0.03] border border-white/5 text-white/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Match count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] text-white/40">
          {matches.length} curated {matches.length === 1 ? "match" : "matches"}
        </p>
        {!isPlatinum && (
          <span className="text-[10px] text-amber-400/70 flex items-center gap-1">
            <Lock size={10} /> Upgrade for more matches
          </span>
        )}
      </div>

      {/* Opportunity cards */}
      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-white/30">No matches found. Try adjusting your filters.</p>
          </div>
        ) : (
          matches.map(({ provider, matchResult }) => (
            <OpportunityCard
              key={provider.id}
              provider={provider}
              matchResult={matchResult}
              onViewDetails={handleViewDetails}
              onRequestConnection={handleRequestConnection}
            />
          ))
        )}
      </div>

      {/* Load more / refresh */}
      {matches.length > 0 && (
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="w-full py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 text-xs font-cyber tracking-wider hover:text-white/70 hover:border-blue-400/20 transition-all"
        >
          REFRESH RECOMMENDATIONS
        </button>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-1 py-2">
        <Shield size={12} className="text-amber-400/60 mt-0.5 flex-shrink-0" />
        <p className="text-[9px] text-amber-200/40 leading-relaxed">
          Match scores are based on profile compatibility and do not represent loan approval, investment approval,
          financial advice, or guaranteed eligibility. Users must independently verify all parties and terms.
        </p>
      </div>

      {/* Modals */}
      {selectedProvider && selectedMatch && (
        <MatchDetailsModal
          provider={selectedProvider}
          matchResult={selectedMatch}
          request={currentRequest}
          onClose={() => {
            setSelectedProvider(null);
            setSelectedMatch(null);
          }}
          onRequestConnection={(provider, matchResult) => {
            setConnectionTarget({ provider, matchResult });
          }}
        />
      )}

      {connectionTarget && (
        <ConnectionRequestModal
          provider={connectionTarget.provider}
          matchResult={connectionTarget.matchResult}
          request={currentRequest}
          onClose={() => setConnectionTarget(null)}
        />
      )}

      {showCreateModal && (
        <OpportunityRequestModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}