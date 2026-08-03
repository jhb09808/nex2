import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check, ChevronDown, CheckCircle2 } from "lucide-react";
import { INTEREST_CATEGORIES, searchSubInterests, getSubInterestName } from "@/components/nex/radar/interestCategories";
import { MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";

export default function InterestPicker({ selected = [], onChange, minSelects = MIN_INTEREST_SELECTIONS, maxSelects = MAX_INTEREST_SELECTIONS, showSave = false, onSave, saveLabel = "Save Interests" }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchSubInterests(searchQuery);
  }, [searchQuery]);

  const toggleInterest = (id) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < maxSelects) {
      onChange([...selected, id]);
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategory((prev) => (prev === catId ? null : catId));
  };

  const canSave = selected.length >= minSelects;

  return (
    <div className="flex flex-col h-full">
      {/* Header text */}
      <div className="text-center mb-4 px-2">
        <h2 className="text-lg font-cyber font-bold text-white neon-text mb-1">
          Choose what you're actually into
        </h2>
        <p className="text-blue-200/50 text-sm">
          Select the interests you would want to connect with people around.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4 px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search interests..."
          className="w-full pl-11 pr-10 py-3 rounded-xl cyber-input text-white placeholder:text-blue-200/30 focus:outline-none text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-blue-200/40" />
          </button>
        )}
      </div>

      {/* Selected count + pills */}
      <div className="px-1 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-cyber text-blue-200/50 tracking-wider">
            {selected.length} SELECTED
          </span>
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-[10px] text-blue-400 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-hide">
            {selected.map((id) => (
              <button
                key={id}
                onClick={() => toggleInterest(id)}
                className="px-2.5 py-1 rounded-full text-xs font-medium gradient-blue text-white flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Check className="w-3 h-3" />
                {getSubInterestName(id)}
                <X className="w-2.5 h-2.5 ml-0.5 opacity-60" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Categories / Search results */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
        <AnimatePresence mode="wait">
          {searchQuery.trim() ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {searchResults.length === 0 ? (
                <p className="text-blue-200/30 text-sm text-center py-8">No interests found</p>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => toggleInterest(result.id)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all active:scale-98 ${
                      selectedSet.has(result.id)
                        ? "gradient-blue text-white"
                        : "cyber-input text-blue-200/60"
                    }`}
                  >
                    <div className="text-left">
                      <span>{result.name}</span>
                      <span className="block text-[10px] text-blue-200/30 mt-0.5">{result.categoryName}</span>
                    </div>
                    {selectedSet.has(result.id) && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {INTEREST_CATEGORIES.map((cat) => {
                const isExpanded = expandedCategory === cat.id;
                const Icon = cat.icon;
                const selectedInCat = selected.filter((id) => {
                  const sub = cat.subInterests.find((s) => s.id === id);
                  return !!sub;
                });
                return (
                  <div key={cat.id} className="overflow-hidden rounded-xl">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full px-4 py-3.5 rounded-xl flex items-center justify-between transition-all ${
                        isExpanded ? "cyber-frame" : "cyber-input"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isExpanded ? "neon-btn" : "bg-white/5"}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-sm font-medium ${isExpanded ? "text-white" : "text-blue-200/60"}`}>
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedInCat.length > 0 && (
                          <span className="text-[10px] font-cyber text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            {selectedInCat.length}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-blue-200/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-1.5 pt-2 px-1 pb-1">
                            {cat.subInterests.map((sub) => {
                              const isSelected = selectedSet.has(sub.id);
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => toggleInterest(sub.id)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                                    isSelected
                                      ? "gradient-blue text-white glow-blue-sm"
                                      : "cyber-input text-blue-200/50 hover:text-blue-200/70"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                  {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky save button */}
      {showSave && (
        <div className="pt-3 px-1">
          <button
            onClick={onSave}
            disabled={!canSave}
            className={`w-full py-4 rounded-2xl font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
              canSave
                ? "neon-btn text-white active:scale-[0.98]"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {canSave ? (
              <>{saveLabel} ({selected.length})</>
            ) : (
              `Select ${minSelects - selected.length} more`
            )}
          </button>
        </div>
      )}
    </div>
  );
}