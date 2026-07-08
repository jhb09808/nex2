import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Check, X, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOAL_PRESETS = [
  { type: "find_investors", label: "Find Investors", emoji: "💰" },
  { type: "find_photographers", label: "Find Photographers", emoji: "📸" },
  { type: "get_clients", label: "Get 10 Clients", emoji: "🎯" },
  { type: "meet_entrepreneurs", label: "Meet Entrepreneurs", emoji: "🚀" },
  { type: "find_cofounder", label: "Find Co-founder", emoji: "🤝" },
  { type: "expand_network", label: "Expand Network", emoji: "🌐" },
  { type: "find_creators", label: "Find Creators", emoji: "🎬" },
  { type: "hire_talent", label: "Hire Talent", emoji: "💼" },
];

export default function AIGoals() {
  const [goals, setGoals] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const me = await base44.auth.me();
      const userGoals = await base44.entities.NetworkingGoal.filter({ created_by_id: me.id, is_active: true });
      setGoals(userGoals);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addGoal = async (preset) => {
    try {
      await base44.entities.NetworkingGoal.create({
        goal_type: preset.type,
        title: preset.label,
        is_active: true,
        target_count: 10,
        current_count: 0,
      });
      setShowPicker(false);
      loadGoals();
    } catch (err) { console.error(err); }
  };

  const removeGoal = async (id) => {
    try {
      await base44.entities.NetworkingGoal.update(id, { is_active: false });
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      {/* Active goals */}
      {goals.length > 0 && (
        <div className="space-y-2 mb-3">
          {goals.map((goal, i) => {
            const progress = goal.target_count > 0 ? (goal.current_count / goal.target_count) * 100 : 0;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="ai-card rounded-2xl p-4 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 flex items-center justify-center border border-blue-500/10 flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{goal.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full gradient-blue" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-white/30 text-[10px] font-mono">{goal.current_count}/{goal.target_count}</span>
                  </div>
                </div>
                <button onClick={() => removeGoal(goal.id)} className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5 text-white/30" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add goal button / picker */}
      <AnimatePresence mode="wait">
        {showPicker ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {GOAL_PRESETS.map((preset, i) => (
                <motion.button
                  key={preset.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => addGoal(preset)}
                  className="ai-card rounded-xl p-3 flex items-center gap-2 text-left hover:scale-[1.02] transition-transform"
                >
                  <span className="text-lg">{preset.emoji}</span>
                  <span className="text-white/70 text-xs font-medium">{preset.label}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="w-full mt-2 py-2 text-white/30 text-xs font-medium"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPicker(true)}
            className="ai-card w-full rounded-2xl p-4 flex items-center justify-center gap-2 text-blue-400 text-sm font-medium hover:scale-[1.01] transition-transform"
          >
            <Plus className="w-4 h-4" />
            Set a Networking Goal
          </motion.button>
        )}
      </AnimatePresence>

      {loading && goals.length === 0 && (
        <div className="ai-card rounded-2xl p-4 space-y-2">
          <div className="h-3 w-32 rounded shimmer" />
          <div className="h-2 w-full rounded shimmer" />
        </div>
      )}
    </div>
  );
}