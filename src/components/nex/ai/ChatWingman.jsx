import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Lightbulb, MessageSquareHeart, TrendingUp, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AIWingmanCard from "@/components/nex/ai/AIWingmanCard";

export default function ChatWingman({ otherUser, recentMessages = [] }) {
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    if (!otherUser || loading) return;
    setLoading(true);
    try {
      const prompt = `You are an AI networking wingman helping the user have a great conversation in a messaging app.

Other person's profile:
- Name: ${otherUser.username || "Unknown"}
- Bio: ${otherUser.bio || "No bio provided"}
- Interests: ${(otherUser.interests || []).join(", ") || "None listed"}
${otherUser.badges?.length ? `- Badges: ${otherUser.badges.join(", ")}` : ""}

Recent conversation (last few messages):
${recentMessages.slice(-5).map((m) => `${m.sender_id === "me" ? "Me" : otherUser.username}: ${m.content}`).join("\n") || "(No messages yet — this is the start of the conversation)"}

Generate 3 actionable networking insights as JSON:
1. An icebreaker — a specific, natural opening message referencing their interests or bio. Make it feel human, not robotic. Keep it under 2 sentences.
2. A conversation tip — what topic to lean into based on their profile that would deepen the connection. Explain WHY in one sentence.
3. A networking angle — how this person could be valuable (friend, business partner, client, collaborator) based on their profile, with a one-line reason.

Return ONLY valid JSON with this exact structure:
{
  "insights": [
    { "type": "recommend", "title": "<icebreaker message text>", "body": "<brief reasoning>", "action_label": "Use this", "category": "icebreaker" },
    { "type": "notify", "title": "<topic suggestion>", "body": "<why this topic works>", "action_label": "Explore topic", "category": "tip" },
    { "type": "recommend", "title": "<networking value>", "body": "<one-line reason>", "action_label": "Learn more", "category": "angle" }
  ]
}`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  body: { type: "string" },
                  action_label: { type: "string" },
                  category: { type: "string" },
                },
              },
            },
          },
        },
      });

      setInsights(res.insights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && insights.length === 0) generateInsights();
  }, [open]);

  const handleAction = (insight) => {
    if (insight.category === "icebreaker") {
      // Dispatch a custom event the Chat page listens for to fill the input
      window.dispatchEvent(new CustomEvent("wingman-icebreaker", { detail: insight.title }));
      setOpen(false);
    }
  };

  const categoryIcon = { icebreaker: Sparkles, tip: Lightbulb, angle: TrendingUp };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          open ? "gradient-blue glow-blue-sm" : "glass"
        }`}
      >
        <Sparkles className={`w-5 h-5 ${open ? "text-white" : "text-blue-400"}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] z-50 max-h-[60vh] overflow-y-auto scrollbar-hide"
          >
            <div className="ai-card ai-border rounded-2xl p-3 space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs">AI Wingman</p>
                    <p className="text-white/30 text-[9px]">Live networking intel</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5">
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Target context */}
              {otherUser?.interests?.length > 0 && (
                <div className="px-1 pb-1">
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1.5">Their interests</p>
                  <div className="flex flex-wrap gap-1">
                    {otherUser.interests.slice(0, 4).map((interest) => (
                      <span key={interest} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/15">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {loading ? (
                <div className="space-y-2 py-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="shimmer rounded-xl h-20" />
                  ))}
                </div>
              ) : (
                insights.map((insight, i) => {
                  const CatIcon = categoryIcon[insight.category] || Sparkles;
                  return (
                    <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 p-3 hover:border-blue-500/15 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <CatIcon className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                            {insight.category === "icebreaker" ? "Icebreaker" : insight.category === "tip" ? "Conversation Tip" : "Networking Angle"}
                          </p>
                          <p className="text-white/90 text-sm font-medium leading-snug">{insight.title}</p>
                          <p className="text-white/40 text-xs leading-relaxed mt-1">{insight.body}</p>
                          {insight.category === "icebreaker" && (
                            <button
                              onClick={() => handleAction(insight)}
                              className="mt-2 flex items-center gap-1 text-blue-400 text-xs font-medium group"
                            >
                              {insight.action_label || "Use this"}
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Refresh */}
              {!loading && insights.length > 0 && (
                <button
                  onClick={generateInsights}
                  className="w-full py-2 rounded-lg glass text-white/50 text-xs font-medium hover:text-white/70 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate new insights
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}