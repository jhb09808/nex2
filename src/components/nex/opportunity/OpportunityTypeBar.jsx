import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Minimal AI-predictive type bar for "Looking For" and "I Provide".
 * User types free text; AI predicts completions as they type.
 * Values are stored as arrays of strings (tags).
 */
export default function OpportunityTypeBar({ lookingFor = [], provides = [], onChange }) {
  return (
    <div className="space-y-4">
      <TypeField
        label="Looking For"
        placeholder="e.g. A co-founder, investors, clients..."
        values={lookingFor}
        accent="violet"
        onChange={(vals) => onChange({ looking_for: vals, provides })}
      />
      <TypeField
        label="I Provide"
        placeholder="e.g. Web development, marketing consulting..."
        values={provides}
        accent="cyan"
        onChange={(vals) => onChange({ looking_for: lookingFor, provides: vals })}
      />
    </div>
  );
}

const ACCENTS = {
  violet: {
    text: "text-violet-300",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    chip: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  },
  cyan: {
    text: "text-cyan-300",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    chip: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  },
};

function TypeField({ label, placeholder, values, accent, onChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const styles = ACCENTS[accent];

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an autocomplete engine for a professional networking app.
The user is typing in the "${label}" field. Based on what they've typed so far, predict 3-5 likely completions.

Input so far: "${query}"

Return a JSON object with a "suggestions" array of short phrases (2-6 words each) that complete or relate to what the user is typing. Make them specific and practical. Do not include the input text itself — just the completions.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });
      setSuggestions((res.suggestions || []).filter((s) => !values.includes(s)));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const addValue = (val) => {
    const trimmed = val.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
    setSuggestions([]);
  };

  const removeValue = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addValue(input);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div>
      <label className="text-xs font-cyber font-medium text-white/40 uppercase tracking-wider mb-2 block">{label}</label>

      {/* Existing tags */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((val) => (
            <span key={val} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${styles.chip}`}>
              {val}
              <button onClick={() => removeValue(val)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`relative rounded-xl border ${focused ? styles.border : "border-white/5"} bg-black/30 transition-colors`}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Search className={`w-3.5 h-3.5 ${styles.text} flex-shrink-0`} />
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
          />
          {loading && <Loader2 className={`w-3.5 h-3.5 ${styles.text} animate-spin flex-shrink-0`} />}
          {input.trim() && !loading && (
            <button onClick={() => addValue(input)} className={`p-0.5 rounded ${styles.text} hover:scale-110 transition-transform`}>
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* AI suggestions dropdown */}
        {focused && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#0a0a0e] border border-white/10 shadow-xl overflow-hidden">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 ${styles.bg} border-b border-white/5`}>
              <Sparkles className={`w-3 h-3 ${styles.text}`} />
              <span className="text-[9px] font-cyber uppercase tracking-wider text-white/40">AI Suggestions</span>
            </div>
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => addValue(sug)}
                className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}