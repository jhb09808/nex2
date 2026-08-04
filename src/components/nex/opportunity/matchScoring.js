// Opportunity Match Scoring Engine
// Compares what a user is looking for against what providers offer.
// Score represents compatibility only — never approval, eligibility, or financial advice.

import { NEED_TO_PROVIDER_MAP, getProvidesLabel, getLookingForLabel, getIAmLabel } from "./opportunityCategories";

/**
 * Calculate opportunity match score between a seeker's request and a provider.
 * @param {object} request - The opportunity request (what the seeker needs)
 * @param {object} provider - The provider profile
 * @returns {{ score: number, reasons: string[], details: object }}
 */
export function calculateOpportunityMatch(request, provider) {
  let score = 0;
  let reasons = [];
  const details = {};

  // 1. Need ↔ Provider service match (up to 40 pts)
  const matchingServices = (request.looking_for || []).filter((needId) => {
    const providerIds = provider.provides || [];
    return (NEED_TO_PROVIDER_MAP[needId] || []).some((pid) => providerIds.includes(pid));
  });
  if (matchingServices.length > 0) {
    score += 40;
    details.needServiceMatch = true;
    const matchedProvId = NEED_TO_PROVIDER_MAP[matchingServices[0]]?.[0] || provider.provides?.[0];
    reasons.push(`Provides ${getProvidesLabel(matchedProvId)}`);
  } else {
    score += 5;
  }

  // 2. Amount compatibility (up to 20 pts)
  if (request.requested_amount && provider.max_deal_size) {
    const minDeal = provider.min_deal_size || 0;
    const maxDeal = provider.max_deal_size;
    if (request.requested_amount >= minDeal && request.requested_amount <= maxDeal) {
      score += 20;
      details.amountMatch = true;
      reasons.push(`Funds projects up to $${formatCurrency(maxDeal)}`);
    } else if (request.requested_amount <= maxDeal * 1.2) {
      score += 12;
      details.amountCloseMatch = true;
    }
  } else {
    score += 6;
  }

  // 3. Geographic compatibility (up to 15 pts)
  const geoCompatibility = checkGeographicCompatibility(request, provider);
  score += geoCompatibility.points;
  if (geoCompatibility.match) {
    details.geoMatch = true;
    reasons.push(geoCompatibility.reason);
  }

  // 4. Project type match (up to 8 pts)
  if (request.project_type && provider.project_types?.includes(request.project_type)) {
    score += 8;
    details.projectTypeMatch = true;
    reasons.push("Matching project type");
  }

  // 5. Timeline + availability (up to 7 pts)
  if (request.timeline && provider.currently_accepting) {
    score += 7;
    details.timelineMatch = true;
    reasons.push("Currently accepting new opportunities");
  } else if (provider.currently_accepting) {
    score += 4;
  }

  // 6. Industry match (up to 5 pts)
  if (request.industry && provider.industry) {
    const reqIndustry = request.industry.toLowerCase();
    const provIndustry = provider.industry.toLowerCase();
    if (reqIndustry === provIndustry) {
      score += 5;
      details.industryMatch = true;
      reasons.push("Same industry");
    } else if (provIndustry.includes(reqIndustry) || reqIndustry.includes(provIndustry)) {
      score += 3;
    }
  }

  // 7. Verification bonus (up to 3 pts)
  if (provider.is_verified) {
    score += 3;
    details.verified = true;
    reasons.push("Verified business profile");
  }

  // 8. Profile completeness (up to 2 pts)
  const completeness = calculateProfileCompleteness(provider);
  score += Math.round(completeness * 2);

  // 9. Availability penalty
  if (provider.currently_accepting === false) {
    score -= 8;
  }

  // 10. Hiring mode bonus — if provider is hiring and seeker needs employment
  if (provider.hiring_mode_enabled && (request.looking_for || []).some((n) =>
    ["employees", "interns", "sales_representatives", "software_developers", "ai_developers"].includes(n)
  )) {
    score += 5;
    details.hiringMatch = true;
    reasons.push("Hiring now");
  }

  // Clamp
  score = Math.max(0, Math.min(99, Math.round(score)));

  // Ensure top reasons are unique and max 4
  reasons = [...new Set(reasons)].slice(0, 4);

  return { score, reasons, details };
}

/**
 * Calculate a profile-to-profile opportunity score (for the Discovery feed).
 * Uses the user's looking_for vs the provider's provides, plus all weighted signals.
 */
export function calculateProfileOpportunityScore(seekerProfile, provider) {
  const syntheticRequest = {
    looking_for: seekerProfile.looking_for || [],
    requested_amount: seekerProfile.funding_mode_enabled ? seekerProfile.funding_amount_requested : null,
    industry: seekerProfile.industry,
    project_type: null,
    geographic_scope: seekerProfile.service_area || "national",
    location: seekerProfile.zip_code || "",
    timeline: seekerProfile.funding_timeline,
  };
  return calculateOpportunityMatch(syntheticRequest, provider);
}

function checkGeographicCompatibility(request, provider) {
  const reqGeo = request.geographic_scope || "national";
  const provGeo = provider.service_area || "national";
  const reqLocation = request.location || "";
  const provMarkets = provider.markets_served || [];

  if (reqGeo === "global" && provGeo === "global") {
    return { points: 15, match: true, reason: "Available globally" };
  }

  if (reqLocation && provMarkets.some((m) => m.toLowerCase().includes(reqLocation.toLowerCase().split(",")[0].trim().toLowerCase()))) {
    return { points: 15, match: true, reason: `Works with ${reqLocation.split(",")[0].trim()}-based clients` };
  }

  if (reqGeo === "national" && (provGeo === "national" || provGeo === "global")) {
    return { points: 12, match: true, reason: "Available nationally" };
  }

  if (reqGeo === "global" && provGeo === "national") {
    return { points: 8, match: true, reason: "Available nationally" };
  }

  return { points: 4, match: false, reason: "" };
}

function calculateProfileCompleteness(provider) {
  const fields = ["company_name", "industry", "bio", "provides", "min_deal_size", "max_deal_size", "markets_served", "website"];
  const filled = fields.filter((f) => {
    const val = provider[f];
    return val !== null && val !== undefined && (Array.isArray(val) ? val.length > 0 : String(val).trim() !== "");
  }).length;
  return filled / fields.length;
}

export function formatCurrency(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}