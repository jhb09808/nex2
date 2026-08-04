// Opportunity Match Scoring Engine
// Compares what a user is looking for against what providers offer.
// Score represents compatibility only — never approval, eligibility, or financial advice.

import { NEED_TO_PROVIDER_MAP, getProvidesLabel, getLookingForLabel } from "./opportunityCategories";

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
    reasons.push(`Provides ${getProvidesLabel(NEED_TO_PROVIDER_MAP[matchingServices[0]]?.[0] || provider.provides[0])}`);
  } else {
    // Partial: same broad category
    score += 5;
  }

  // 2. Amount compatibility (up to 25 pts)
  if (request.requested_amount && provider.max_deal_size) {
    const minDeal = provider.min_deal_size || 0;
    const maxDeal = provider.max_deal_size;
    if (request.requested_amount >= minDeal && request.requested_amount <= maxDeal) {
      score += 25;
      details.amountMatch = true;
      reasons.push(`Funds projects up to $${formatCurrency(maxDeal)}`);
    } else if (request.requested_amount <= maxDeal * 1.2) {
      score += 15;
      details.amountCloseMatch = true;
    }
  } else {
    score += 8; // unknown amounts, neutral
  }

  // 3. Geographic compatibility (up to 20 pts)
  const geoCompatibility = checkGeographicCompatibility(request, provider);
  score += geoCompatibility.points;
  if (geoCompatibility.match) {
    details.geoMatch = true;
    reasons.push(geoCompatibility.reason);
  }

  // 4. Project type match (up to 10 pts)
  if (request.project_type && provider.project_types?.includes(request.project_type)) {
    score += 10;
    details.projectTypeMatch = true;
    reasons.push("Matching project type");
  }

  // 5. Timeline compatibility (up to 5 pts)
  if (request.timeline && provider.currently_accepting) {
    score += 5;
    details.timelineMatch = true;
    reasons.push("Currently accepting opportunities");
  }

  // 6. Verification bonus (up to 5 pts, does not inflate relevance unfairly)
  if (provider.is_verified) {
    score += 3;
    details.verified = true;
    reasons.push("Verified business profile");
  }

  // 7. Profile completeness (up to 5 pts)
  const completeness = calculateProfileCompleteness(provider);
  score += Math.round(completeness * 5);

  // 8. Availability
  if (provider.currently_accepting === false) {
    score -= 10;
  }

  // Clamp
  score = Math.max(0, Math.min(99, Math.round(score)));

  // Ensure top reasons are unique and max 3
  reasons = [...new Set(reasons)].slice(0, 3);

  return { score, reasons, details };
}

function checkGeographicCompatibility(request, provider) {
  const reqGeo = request.geographic_scope || "national";
  const provGeo = provider.service_area || "national";
  const reqLocation = request.location || "";
  const provMarkets = provider.markets_served || [];

  // If both global
  if (reqGeo === "global" && provGeo === "global") {
    return { points: 20, match: true, reason: "Available globally" };
  }

  // If provider serves the request location
  if (reqLocation && provMarkets.some((m) => m.toLowerCase().includes(reqLocation.toLowerCase().split(",")[0].trim().toLowerCase()))) {
    return { points: 20, match: true, reason: `Works with ${reqLocation.split(",")[0].trim()}-based clients` };
  }

  // National match
  if (reqGeo === "national" && (provGeo === "national" || provGeo === "global")) {
    return { points: 15, match: true, reason: "Available nationally" };
  }

  if (reqGeo === "global" && provGeo === "national") {
    return { points: 10, match: true, reason: "Available nationally" };
  }

  return { points: 5, match: false, reason: "" };
}

function calculateProfileCompleteness(provider) {
  const fields = ["company_name", "industry", "bio", "provides", "min_deal_size", "max_deal_size", "markets_served", "website"];
  const filled = fields.filter((f) => {
    const val = provider[f];
    return val !== null && val !== undefined && (Array.isArray(val) ? val.length > 0 : String(val).trim() !== "");
  }).length;
  return filled / fields.length;
}

function formatCurrency(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export { formatCurrency };