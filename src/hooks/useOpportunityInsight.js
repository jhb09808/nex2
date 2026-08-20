import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getIAmLabel, getLookingForLabel, getProvidesLabel } from "@/components/nex/opportunity/opportunityCategories";

/**
 * The AI opportunity read for a profile — what they offer, what they want and
 * why to connect. Shared by the phone section and the desktop profile so both
 * show the same text and only one call is made per mount.
 */
export default function useOpportunityInsight(profile) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    generateInsight();
  }, [profile?.id]);

  const generateInsight = async () => {
    setLoading(true);
    try {
      // Send only general profile data to LLM — funding/hiring specifics are shown only on demand
      const generalData = {
        username: profile.username,
        i_am: profile.i_am,
        available_for: profile.available_for || [],
        looking_for: profile.looking_for || [],
        provides: profile.provides || [],
        industry: profile.industry,
        company_name: profile.company_name,
        interests: profile.interests || [],
      };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI opportunity matcher for NEX2, a proximity-based professional network.
Analyze this user profile and generate a concise, GENERAL opportunity insight.

Profile:
${JSON.stringify(generalData, null, 2)}

IMPORTANT: Keep the insight broad and general. Do NOT focus on funding, investment amounts, or financial specifics. Focus on what this person does, what they offer, and what they're open to. Funding and hiring details are revealed separately on demand.

Generate a JSON response with:
1. "offer_summary": One punchy sentence (max 15 words) describing what this person offers to others nearby.
2. "need_summary": One punchy sentence (max 15 words) describing what this person is looking for.
3. "top_opportunities": Array of exactly 3 opportunity objects, each with:
   - "title": Short title (max 5 words)
   - "description": One sentence (max 20 words) describing a general opportunity this person presents to others nearby.
   - "icon": One of these exact values: "briefcase", "trending", "handshake"
4. "connection_pitch": One compelling sentence (max 25 words) explaining why someone nearby should connect with this person.

Be specific to their role and industry, but stay general — no funding amounts or financial details. Everyone has something to offer. Be encouraging and specific, not generic.`,
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


  return { insight, loading };
}
