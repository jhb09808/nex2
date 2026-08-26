import { AURA_PALETTES, AURA_PALETTE_KEYS, paletteKeyForCategory } from "@/components/nex/aura/auraPalettes";
import { getCategoryForSubInterest } from "@/components/nex/radar/interestCategories";

// ── Deterministic randomness ───────────────────────────────────────────────
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < String(str).length; i++) {
    hash = (hash << 5) - hash + String(str).charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const AURA_VARIATION_COUNT = 4;

/**
 * Normalize a UserProfile (or a partial/mock profile) into the small set of
 * inputs the Aura generator actually reads. Keeping this separate means every
 * surface can pass whatever it has and still get the same Aura.
 */
export function profileToAuraInput(profile = {}) {
  const badges = (profile.badges?.length || 0) + (profile.is_verified ? 1 : 0) + (profile.is_og ? 1 : 0);
  const focusAreas = (profile.provides?.length || 0) + (profile.looking_for?.length || 0);

  // Activity: online now, recently seen, and how much of a footprint they have.
  let activity = 0.28;
  if (profile.is_online) activity += 0.3;
  if (profile.last_seen) {
    const hours = (Date.now() - new Date(profile.last_seen).getTime()) / 3600000;
    if (hours < 24) activity += 0.16;
    else if (hours < 168) activity += 0.08;
  }
  activity += Math.min(0.18, (profile.connections_count || 0) * 0.012);
  activity += Math.min(0.08, focusAreas * 0.02);

  return {
    // Account id first so the Aura survives a username change.
    seed: profile.aura_seed || profile.created_by_id || profile.id || profile.username || "nex2",
    variant: profile.aura_variant ?? 0,
    interests: profile.interests || [],
    connections: profile.connections_count || 0,
    badges,
    plan: profile.plan || "free",
    activity: Math.max(0, Math.min(1, activity)),
  };
}

// Interests decide the palette: the dominant category wins, the runner-up
// contributes the accent so multi-interest people get a blended field.
function palettesFromInterests(interests, rand) {
  const tally = {};
  for (const id of interests) {
    const key = paletteKeyForCategory(getCategoryForSubInterest(id)?.id);
    if (key) tally[key] = (tally[key] || 0) + 1;
  }
  const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
  const primary = ranked[0] || AURA_PALETTE_KEYS[Math.floor(rand() * AURA_PALETTE_KEYS.length)];
  const secondary = ranked[1] || AURA_PALETTE_KEYS[Math.floor(rand() * AURA_PALETTE_KEYS.length)];
  return { primary: AURA_PALETTES[primary], secondary: AURA_PALETTES[secondary], primaryKey: primary };
}

/**
 * Build every visual parameter of one Aura. Pure and deterministic:
 * the same seed + variant always produces the same Aura.
 */
export function buildAura(input) {
  const { seed, variant, interests, connections, badges, activity, plan } = {
    interests: [],
    connections: 0,
    badges: 0,
    activity: 0.4,
    variant: 0,
    plan: "free",
    ...input,
  };

  const h = hashString(`${seed}#${variant}`);
  const rand = mulberry32(h);
  const { primary, secondary, primaryKey } = palettesFromInterests(interests, rand);

  // Composition — where the energy sits inside the circle.
  const tilt = rand() * 360;
  const coreX = 44 + rand() * 14;
  const coreY = 42 + rand() * 14;

  // Glow intensity follows activity level.
  const glow = 0.4 + activity * 0.6;

  // Layered gradient blobs — the body of the orb.
  const blobColors = [primary.a, primary.b, secondary.a, secondary.b];
  const blobs = [];
  const blobCount = 3 + Math.floor(rand() * 2);
  for (let i = 0; i < blobCount; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 8 + rand() * 20;
    blobs.push({
      cx: 50 + Math.cos(angle) * dist,
      cy: 50 + Math.sin(angle) * dist,
      r: 22 + rand() * 22,
      color: blobColors[i % blobColors.length],
      opacity: 0.34 + rand() * 0.3,
    });
  }

  // Orbit rings — one per band of connections, up to four.
  const ringCount = Math.max(1, Math.min(4, 1 + Math.floor(connections / 6)));
  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    rings.push({
      rx: 30 + i * 5.5 + rand() * 3,
      ry: (30 + i * 5.5) * (0.46 + rand() * 0.4),
      rot: rand() * 180,
      width: 0.5 + rand() * 0.45,
      opacity: 0.5 - i * 0.07,
      dash: rand() < 0.45 ? `${(1 + rand() * 3).toFixed(1)} ${(2 + rand() * 4).toFixed(1)}` : null,
    });
  }

  // Light streaks — soft arcs sweeping through the field.
  const streaks = [];
  const streakCount = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < streakCount; i++) {
    const r = 20 + rand() * 24;
    const from = rand() * Math.PI * 2;
    const span = 1 + rand() * 2.2;
    let d = "";
    for (let s = 0; s <= 24; s++) {
      const th = from + (s / 24) * span;
      d += `${s === 0 ? "M" : "L"}${(50 + Math.cos(th) * r).toFixed(2)} ${(50 + Math.sin(th) * r * 0.82).toFixed(2)}`;
    }
    streaks.push({ d, width: 1.2 + rand() * 2.4, opacity: 0.2 + rand() * 0.3, rot: rand() * 360 });
  }

  // Particles — one spark per badge or achievement, capped so it stays clean.
  const particles = [];
  const particleCount = Math.min(9, badges * 2);
  for (let i = 0; i < particleCount; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 16 + rand() * 26;
    particles.push({
      cx: 50 + Math.cos(angle) * dist,
      cy: 50 + Math.sin(angle) * dist,
      r: 0.7 + rand() * 1.3,
      color: rand() < 0.5 ? primary.accent : secondary.accent,
    });
  }

  return {
    id: `aura${h}v${variant}`,
    paletteKey: primaryKey,
    primary,
    secondary,
    tilt,
    coreX,
    coreY,
    glow,
    blobs,
    rings,
    streaks,
    particles,
    // Platinum breathes a touch faster — a quiet tier tell, no extra chrome.
    spin: plan === "platinum" ? 34 : 46 + rand() * 22,
  };
}

/** The 2–4 alternates offered in settings, all in the same identity style. */
export function auraVariations(profile) {
  const base = profileToAuraInput(profile);
  return Array.from({ length: AURA_VARIATION_COUNT }, (_, i) => ({
    variant: i,
    aura: buildAura({ ...base, variant: i }),
  }));
}