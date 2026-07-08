import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Briefcase, Handshake, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

function calcDimensions(myInterests, theirInterests, seed) {
  const mine = myInterests || [];
  const theirs = theirInterests || [];
  const shared = mine.filter(i => theirs.includes(i));
  const base = 40 + shared.length * 12;
  return {
    friend: Math.min(98, base + (seed * 7 % 20)),
    business: Math.min(98, base + (seed * 13 % 25) - 5),
    client: Math.min(95, base - 10 + (seed * 11 % 20)),
    collaboration: Math.min(98, base + 5 + (seed * 17 % 15)),
  };
}

export default function AIMatchmaker({ nearbyUsers, myInterests, onConnect }) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (nearbyUsers.length > 0) generateMatches();
    else { setLoading(false); }
  }, [nearbyUsers.length]);

  const generateMatches = async () => {
    try {
      const userList = nearbyUsers.slice(0, 15).map((u, i) => `- ${u.username}: ${(u.bio || "").substring(0, 80)}, interests: ${(u.interests || []).join(", ")}`).join("\n");

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are NEX AI Matchmaker. Rank these nearby people by networking value for a user who wants to expand their network.

User interests: ${(myInterests || []).join(", ")}

Nearby people:
${userList}

Select the top 3 people worth meeting. For each, provide a compatibility score, multi-dimensional potential scores (0-100), a specific reason WHY they should meet, and a personalized icebreaker message. Be specific and reference their interests/bio.`,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  friend_potential: { type: "number" },
                  business_potential: { type: "number" },
                  client_potential: { type: "number" },
                  collaboration_potential: { type: "number" },
                  reason: { type: "string" },
                  icebreaker: { type: "string" },
                  profession: { type: "string" }
                }
              }
            }
          }
        }
      });
      setMatches(res.matches || []);
    } catch (err) {
      console.error(err);
      // Fallback: client-side ranking
      const dims = nearbyUsers.slice(0, 3).map((u, i) => {
        const d = calcDimensions(myInterests, u.interests, i + 1);
        return {
          name: u.username,
          score: Math.floor((d.friend + d.business + d.collaboration) / 3),
          friend_potential: d.friend,
          business_potential: d.business,
          client_potential: d.client,
          collaboration_potential: d.collaboration,
          reason: `Shares ${u.interests?.filter(i => (myInterests || []).includes(i)).length || 0} interests with you${u.bio ? ` and is "${u.bio.substring(0, 50)}"` : ""}.`,
          icebreaker: `Hey ${u.username}! I noticed we both love ${u.interests?.[0] || "networking"}. Would love to connect!`,
          profession: ["Product Designer", "Startup Founder", "Software Engineer"][i % 3]
        };
      });
      setMatches(dims);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="ai-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded shimmer" />
                <div className="h-2 w-16 rounded shimmer" />
              </div>
            </div>
            <div className="h-2 w-full rounded shimmer" />
            <div className="h-2 w-3/4 rounded shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="ai-card rounded-2xl py-8 px-4 text-center">
        <Sparkles className="w-6 h-6 text-white/10 mx-auto mb-2" />
        <p className="text-white/30 text-sm">AI is scanning for your best matches...</p>
      </div>
    );
  }

  const dims = [
    { key: "friend_potential", label: "Friend", icon: Users, color: "from-blue-500 to-blue-400" },
    { key: "business_potential", label: "Business", icon: Briefcase, color: "from-violet-500 to-violet-400" },
    { key: "client_potential", label: "Client", icon: TrendingUp, color: "from-amber-500 to-amber-400" },
    { key: "collaboration_potential", label: "Collab", icon: Handshake, color: "from-emerald-500 to-emerald-400" },
  ];

  return (
    <div className="space-y-3">
      {matches.map((match, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="ai-card rounded-[1.5rem] p-5"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 blur" />
              <div className="relative w-12 h-12 rounded-full gradient-blue flex items-center justify-center">
                <span className="text-white font-bold text-lg">{match.name?.charAt(0)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-base">{match.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold font-mono">{match.score}%</span>
              </div>
              <p className="text-white/40 text-xs mt-0.5">{match.profession || "Professional"}</p>
            </div>
          </div>

          {/* AI Reason */}
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/60 text-xs leading-relaxed">{match.reason}</p>
          </div>

          {/* Multi-dimensional potential */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {dims.map((dim) => {
              const val = match[dim.key] || 0;
              const Icon = dim.icon;
              return (
                <div key={dim.key} className="text-center">
                  <Icon className="w-3 h-3 text-white/30 mx-auto mb-1" />
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-1">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${dim.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    />
                  </div>
                  <p className="text-white/40 text-[8px] uppercase tracking-wider">{dim.label}</p>
                  <p className="text-white/60 text-[10px] font-mono">{val}%</p>
                </div>
              );
            })}
          </div>

          {/* Icebreaker */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">AI Icebreaker</span>
            </div>
            <p className="text-white/70 text-xs italic leading-relaxed">"{match.icebreaker}"</p>
          </div>

          <button
            onClick={() => onConnect?.(match)}
            className="w-full py-2.5 rounded-xl gradient-blue text-white text-sm font-semibold flex items-center justify-center gap-2 glow-blue-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            <Zap className="w-4 h-4" />
            Send Introduction
          </button>
        </motion.div>
      ))}
    </div>
  );
}