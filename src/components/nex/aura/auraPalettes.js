// NEX2 Aura palettes.
// Every palette stays inside the NEX2 range — electric blue, cyan, indigo,
// violet — with a single accent that shifts by interest category so two
// people with different passions read differently at a glance.

export const AURA_PALETTES = {
  signal: { a: "#2D7DFF", b: "#00D4FF", c: "#123A7A", accent: "#8FE9FF" },
  violet: { a: "#7C5BFF", b: "#C084FC", c: "#2A1B5E", accent: "#E9D5FF" },
  indigo: { a: "#4F6BFF", b: "#22D3EE", c: "#1B1F6B", accent: "#A5F3FC" },
  ember: { a: "#5B6BFF", b: "#FF8FB0", c: "#33174A", accent: "#FFD4E4" },
  aurora: { a: "#2FD4D4", b: "#7DE0B0", c: "#0F3A4A", accent: "#C7FFE9" },
  royal: { a: "#3B6BFF", b: "#9B4DFF", c: "#1A1552", accent: "#D6C7FF" },
  solar: { a: "#4F7BFF", b: "#FFC46B", c: "#2A2350", accent: "#FFE6BC" },
  deep: { a: "#1E5BD6", b: "#5BC8FF", c: "#0B2450", accent: "#BFE8FF" },
};

export const AURA_PALETTE_KEYS = Object.keys(AURA_PALETTES);

// Interest category → palette. Categories come from interestCategories.js.
const CATEGORY_PALETTE = {
  music: "violet",
  nightlife: "royal",
  art: "ember",
  fashion: "ember",
  food: "solar",
  fitness: "aurora",
  sports: "aurora",
  outdoors: "aurora",
  wellness: "aurora",
  technology: "signal",
  gaming: "indigo",
  business: "deep",
  education: "deep",
  travel: "indigo",
  culture: "violet",
  "movies-tv": "indigo",
  "social-activities": "signal",
  "dating-relationships": "ember",
  pets: "solar",
  "cars-motorsports": "royal",
};

export function paletteKeyForCategory(categoryId) {
  return CATEGORY_PALETTE[categoryId] || null;
}