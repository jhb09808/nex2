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
      // The server reads the profile and sends only general fields to the AI.
      const { data: res } = await base44.functions.invoke("aiAssist", { action: "opportunityInsight", profile_id: profile.id });
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