import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";
import {
  LOOKING_FOR_CATEGORIES,
  PROVIDE_CATEGORIES,
  ALL_LOOKING_FOR,
  ALL_PROVIDES,
} from "./opportunityCategories";

const MAX_SELECTIONS = 15;

export default function LookingForProvidesPicker({ lookingFor, provides, onChange }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [search, setSearch] = useState("");

  const toggleLookingFor = (id) => {
    const current = lookingFor || [];
    if (current.includes(id)) {
      onChange({ looking_for: current.filter((x) => x !== id), provides });
    } else if (current.length < MAX_SELECTIONS) {
      onChange({ looking_for: [...current, id], provides });
    }
  };

  const toggleProvides = (id) => {
    const current = provides || [];
    if (current.includes(id)) {
      onChange({ looking_for: lookingFor, provides: current.filter((x) => x !== id) });
    } else if (current.length < MAX_SELECTIONS) {
      onChange({ looking_for: lookingFor, provides: [...current, id] });
    }
  };

  const filteredLookingCategories = LOOKING_FOR_CATEGORIES.filter((cat) => {
    if (!search) return true;
    return cat.label.toLowerCase().includes(search.toLowerCase()) ||
      cat.subcategories.some((s) => s.label.toLowerCase().includes(search.toLowerCase()));
  });

  const filteredProvideCategories = PROVIDE_CATEGORIES.filter((cat) => {
    if (!search) return true;
    return cat.label.toLowerCase().includes(search.toLowerCase()) ||
      cat.subcategories.some((s) => s.label.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search needs and services..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none"
        />
      </div>

      {/* Selection counters */}
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>Looking For: {(lookingFor || []).length}/{MAX_SELECTIONS}</span>
        <span>I Provide: {(provides || []).length}/{MAX_SELECTIONS}</span>
      </div>

      {/* I'm Looking For */}
      <div className="space-y-3">
        <h3 className="text-xs font-cyber uppercase tracking-[0.2em] text-blue-300">I'm Looking For</h3>
        <div className="space-y-2">
          {filteredLookingCategories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === `lf-${cat.id}` ? null : `lf-${cat.id}`)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-white/80 font-medium">{cat.label}</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform ${expandedCategory === `lf-${cat.id}` ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {expandedCategory === `lf-${cat.id}` && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => {
                        const selected = (lookingFor || []).includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => toggleLookingFor(sub.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                              selected
                                ? "bg-blue-500/20 border border-blue-400/40 text-blue-300"
                                : "bg-white/[0.03] border border-white/5 text-white/40 hover:border-blue-400/20"
                            }`}
                          >
                            {selected && <Check size={10} />}
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* I Provide */}
      <div className="space-y-3">
        <h3 className="text-xs font-cyber uppercase tracking-[0.2em] text-emerald-300">I Provide</h3>
        <div className="space-y-2">
          {filteredProvideCategories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === `ip-${cat.id}` ? null : `ip-${cat.id}`)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-white/80 font-medium">{cat.label}</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform ${expandedCategory === `ip-${cat.id}` ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {expandedCategory === `ip-${cat.id}` && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => {
                        const selected = (provides || []).includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => toggleProvides(sub.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                              selected
                                ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                                : "bg-white/[0.03] border border-white/5 text-white/40 hover:border-emerald-400/20"
                            }`}
                          >
                            {selected && <Check size={10} />}
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}