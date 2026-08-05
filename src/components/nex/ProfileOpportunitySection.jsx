import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Briefcase, TrendingUp, Handshake, Loader2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIAmLabel, getLookingForLabel, getProvidesLabel, AVAILABLE_FOR_OPTIONS } from "@/components/nex/opportunity/opportunityCategories";

export default function ProfileOpportunitySection({ profile, isOwnProfile = false }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    generateInsight();
  }, [profile?.id]);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const profileData = {
        username: profile.username,
        i_am: profile.i_am,
        available_for: profile.available_for || [],
        looking_for: profile.looking_for || [],
        provides: profile.provides || [],
        industry: profile.industry,
        company_name: profile.company_name,
        hiring_mode_enabled: profile.hiring_mode_enabled,
        hiring_open_positions: profile.hiring_open_positions,
        funding_mode_enabled: profile.funding_mode_enabled,
        funding_purpose: profile.funding_purpose,
        funding_amount_requested: profile.funding_amount_requested,
        interests: profile.interests || [],
      };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI opportunity matcher for NEX2, a proximity-based professional network.
Analyze this user profile and generate a concise, actionable opportunity insight.

Profile:
${JSON.stringify(profileData, null, 2)}

Generate a JSON response with:
1. "offer_summary": One punchy sentence (max 15 words) describing what this person offers to others nearby.
2. "need_summary": One punchy sentence (max 15 words) describing what this person is looking for.
3. "top_opportunities": Array of exactly 3 opportunity objects, each with:
   - "title": Short title (max 5 words)
   - "description": One sentence (max 20 words) describing a specific opportunity this person presents to others nearby.
   - "icon": One of these exact values: "briefcase", "trending", "handshake"
4. "connection_pitch": One compelling sentence (max 25 words) explaining why someone nearby should connect with this person.

Be specific to their role, industry, and stated needs. Everyone has something to offer and everyone needs a service. Be encouraging and specific, not generic.`,
        response_json_schema: {
          type: "object",
          properties: {
            offer_summary: { type: "string" },
            need_summary: { type: "string" },
            top_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  icon: { type: "string" },
                },
              },
            },
            connection_pitch: { type: "string" },
          },
        },
      });

      setInsight(res);
    } catch (err) {
      console.error("Opportunity insight error:", err);
      // Fallback insight based on profile data
      setInsight(generateFallbackInsight(profile));
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackInsight = (p) => {
    const role = getIAmLabel(p.i_am) || "Professional";
    const offers = (p.provides || []).slice(0, 2).map(getProvidesLabel);
    const needs = (p.looking_for || []).slice(0, 2).map(getLookingForLabel);

    return {
      offer_summary: offers.length > 0 ? `Offers ${offers.join(" and ")}` : `${role} available for connection`,
      need_summary: needs.length > 0 ? `Looking for ${needs.join(" and ")}` : "Open to new opportunities nearby",
      top_opportunities: [
        { title: "Network Nearby", description: "Connect with this person based on shared interests and goals.", icon: "handshake" },
        { title: "Explore Collaboration", description: "Discuss mutual projects and professional synergy.", icon: "briefcase" },
        { title: "Share Knowledge", description: "Exchange insights and experience in their field.", icon: "trending" },
      ],
      connection_pitch: `${role} with valuable expertise to share. Connect to explore mutual opportunities.`,
    };
  };

  const ICONS = {
    briefcase: Briefcase,
    trending: TrendingUp,
    handshake: Handshake,
  };

  const availableForLabels = (profile?.available_for || [])
    .map((id) => AVAILABLE_FOR_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);

  return (
    <div className="cyber-frame cyber-corners relative rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <p className="text-sm font-cyber font-bold text-white neon-text">OPPORTUNITIES</p>
          <p className="text-[9px] font-cyber text-cyan-300/40 uppercase tracking-wider">AI-powered discovery</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      ) : insight ? (
        <>
          {/* Offer & Need summaries */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-2.5">
              <p className="text-[9px] font-cyber uppercase tracking-wider text-cyan-300/50 mb-1">I Offer</p>
              <p className="text-[11px] text-white/70 leading-snug">{insight.offer_summary}</p>
            </div>
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-2.5">
              <p className="text-[9px] font-cyber uppercase tracking-wider text-violet-300/50 mb-1">I Want</p>
              <p className="text-[11px] text-white/70 leading-snug">{insight.need_summary}</p>
            </div>
          </div>

          {/* Top opportunities */}
          <div className="space-y-2">
            {(insight.top_opportunities || []).map((opp, idx) => {
              const Icon = ICONS[opp.icon] || Briefcase;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-cyber font-semibold text-white/80">{opp.title}</p>
                    <p className="text-[10px] text-white/40 leading-snug mt-0.5">{opp.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Connection pitch */}
          <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-400/15 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-300 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-white/70 leading-snug">{insight.connection_pitch}</p>
            </div>
          </div>

          {/* Available for tags */}
          {availableForLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableForLabels.map((label) => (
                <span key={label} className="px-2 py-0.5 rounded-full text-[9px] font-cyber font-medium bg-blue-500/10 text-blue-300/70 border border-blue-500/10">
                  {label}
                </span>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}