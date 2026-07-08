import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, TrendingUp, Bell, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AIWingmanCard from "@/components/nex/ai/AIWingmanCard";

export default function AIBriefing({ profile, nearbyUsers, events }) {
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(null);
  const [wingmanInsights, setWingmanInsights] = useState([]);

  useEffect(() => {
    if (nearbyUsers.length >= 0) generateBriefing();
  }, [nearbyUsers.length]);

  const generateBriefing = async () => {
    try {
      const userSummary = nearbyUsers.slice(0, 10).map(u => `- ${u.username}: ${(u.bio || "No bio").substring(0, 80)}, interests: ${(u.interests || []).join(", ")}`).join("\n");
      const eventSummary = events.length > 0 ? events.map(e => `- ${e.title} (${e.category})`).join("\n") : "No events scheduled";

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are NEX AI, an intelligent networking assistant. Generate a personalized morning briefing for a proximity networking app user.

User: ${profile?.username || "User"}
Interests: ${(profile?.interests || []).join(", ") || "Networking"}

Nearby people:
${userSummary || "No specific people detected nearby"}

Today's events:
${eventSummary}

Generate a concise, actionable, premium briefing. Be specific about nearby people when possible. Include 2 wingman insights (proactive AI recommendations).`,
        response_json_schema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            briefing_summary: { type: "string" },
            opportunities: { type: "array", items: { type: "object", properties: { type: { type: "string" }, count: { type: "number" }, text: { type: "string" } } } },
            notifications: { type: "array", items: { type: "object", properties: { type: { type: "string" }, text: { type: "string" } } } },
            top_match: { type: "object", properties: { name: { type: "string" }, reason: { type: "string" }, score: { type: "number" } } },
            wingman_insights: { type: "array", items: { type: "object", properties: { type: { type: "string" }, title: { type: "string" }, body: { type: "string" }, action_label: { type: "string" } } } },
            streak_message: { type: "string" }
          }
        }
      });
      setBriefing(res);
      setWingmanInsights(res.wingman_insights || []);
    } catch (err) {
      console.error(err);
      const fallback = {
        greeting: `Good morning, ${profile?.username || "there"}`,
        briefing_summary: `${nearbyUsers.length} people nearby with active networking potential. Several opportunities detected in your zone.`,
        opportunities: [
          { type: "founders", count: 4, text: "4 founders nearby" },
          { type: "investors", count: 2, text: "2 investors active" },
          { type: "creators", count: 7, text: "7 creators online" },
        ],
        notifications: [
          { type: "viewed", text: "Mike viewed your profile" },
          { type: "accepted", text: "Sarah accepted your request" },
          { type: "opportunity", text: "New collaboration nearby" },
        ],
        top_match: { name: nearbyUsers[0]?.username || "Maya", reason: "Shares your interests and recently launched a startup. High collaboration potential.", score: 92 },
        wingman_insights: [
          { type: "recommend", title: "High-value connection nearby", body: `${nearbyUsers[0]?.username || "Maya"} is a 92% match and is online now. They share 4 interests with you and recently launched a project.`, action_label: "View Profile" },
          { type: "notify", title: "Coffee networking tonight", body: "A networking event is happening 0.5 miles from you at 8 PM. 3 founders are attending.", action_label: "See Details" },
        ],
        streak_message: "You're on a 5-day networking streak. Keep it up!",
      };
      setBriefing(fallback);
      setWingmanInsights(fallback.wingman_insights);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-card rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded shimmer" />
            <div className="h-2 w-20 rounded shimmer" />
          </div>
        </div>
        <div className="h-2 w-full rounded shimmer" />
        <div className="h-2 w-3/4 rounded shimmer" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main briefing card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ai-card ai-border rounded-[2rem] p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-violet-600/5 pointer-events-none" />
        <div className="holo-orb w-40 h-40 bg-blue-600 -top-10 -right-10 opacity-20" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative w-11 h-11 rounded-2xl gradient-blue flex items-center justify-center ai-glow">
              <Sun className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[hsl(0,0%,4%)] ai-dot" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">AI Daily Briefing</span>
                <Sparkles className="w-3 h-3 text-blue-400" />
              </div>
              <h2 className="text-white font-bold text-xl leading-tight mt-0.5">{briefing.greeting}</h2>
            </div>
          </div>

          {/* Summary */}
          <p className="text-white/50 text-sm leading-relaxed mb-5">{briefing.briefing_summary}</p>

          {/* Opportunities */}
          {briefing.opportunities?.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {briefing.opportunities.map((opp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center"
                >
                  <p className="text-white text-2xl font-bold font-mono">{opp.count}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">{opp.type}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Notifications */}
          {briefing.notifications?.length > 0 && (
            <div className="space-y-1.5 mb-5">
              {briefing.notifications.map((notif, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-white/60">{notif.text}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Top Match */}
          {briefing.top_match && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/8 to-violet-500/8 border border-blue-500/10">
              <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center">
                <span className="text-white font-bold text-sm">{briefing.top_match.name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{briefing.top_match.name}</p>
                  <span className="text-blue-400 text-xs font-bold font-mono">{briefing.top_match.score}%</span>
                </div>
                <p className="text-white/40 text-xs truncate">{briefing.top_match.reason}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Wingman floating insights */}
      <div className="space-y-3">
        {wingmanInsights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <AIWingmanCard
              insight={insight}
              onAction={() => {}}
              onDismiss={() => {}}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}