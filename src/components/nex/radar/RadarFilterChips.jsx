import React from "react";
import { RADAR_INTERESTS } from "./constants";

export default function RadarFilterChips({ activeFilters, onToggle, onClear }) {
  const allActive = activeFilters.length === 0;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={onClear}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
          allActive ? "gradient-blue text-white" : "glass text-white/40"
        }`}
      >
        All
      </button>
      {RADAR_INTERESTS.map((interest) => {
        const isActive = activeFilters.includes(interest);
        return (
          <button
            key={interest}
            onClick={() => onToggle(interest)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
              isActive ? "gradient-blue text-white glow-blue-sm" : "glass text-white/40"
            }`}
          >
            {interest}
          </button>
        );
      })}
    </div>
  );
}