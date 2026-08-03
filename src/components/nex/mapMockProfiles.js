// Generates diverse mock nearby profiles (bots) around a center point.
// Positioned within ~0.5mi so they appear on the radar scope by default.
// Each bot has a primary interest so blips render in distinct colors.
// Generates 60 bots; NearbyMap shows ~15 in Best Matches, all 60 in All Nearby.

const INTEREST_POOL = [
  ["graphic-design", "illustration"],
  ["weight-training", "basketball"],
  ["italian", "cooking"],
  ["hip-hop", "nightclubs"],
  ["outdoor-hiking", "road-trips"],
  ["cryptocurrency", "coding"],
  ["yoga", "meditation"],
  ["pc-gaming", "lo-fi"],
  ["dogs", "dog-parks"],
  ["streetwear", "sneakers"],
  ["artificial-intelligence", "startups"],
  ["photography", "travel-photography"],
  ["jdm-cars", "car-meets"],
  ["anime", "binge-watching"],
  ["science", "book-clubs"],
  ["baking", "desserts"],
  ["painting", "street-art"],
  ["entrepreneurship", "investing"],
  ["reading", "jazz"],
  ["international-travel", "beach-vacations"],
];

const FIRST_NAMES = ["Alex","Jordan","Taylor","Morgan","Casey","Riley","Jamie","Avery","Quinn","Sam","Drew","Reese","Sky","River","Sage","Phoenix","Rowan","Wren","Kai","Nova","Luna","Orion","Finn","Iris","Jude","Maya","Leo","Zoe","Ivy","Eli","Nora","Theo","Cora","Max","Lily","Felix","Hazel","Oscar","Ruby","Hugo","Stella","Leo","Mila","Ezra","Ada","Liam","Sofia","Noah","Aria","Ethan","Zoe","Mason","Avery","Quinn","Ghost","Echo","Shadow","Wanderer","Nomad","Drift","Phantom"];

const MI_TO_DEG = 0.0145; // approx miles to degrees latitude

function seededRand(seed) {
  return (Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1);
}

export function generateMockProfiles(center, maxDistanceMiles = 9) {
  const { lat, lng } = center;
  const bots = [];
  const VISIBILITIES = ["full_profile", "full_profile", "full_profile", "first_name", "anonymous"];
  const maxDist = Math.max(0.5, maxDistanceMiles);
  const latRad = (lat * Math.PI) / 180;

  for (let i = 0; i < 60; i++) {
    const interests = INTEREST_POOL[i % INTEREST_POOL.length];
    const visibility = VISIBILITIES[i % VISIBILITIES.length];
    const isAnon = visibility === "anonymous";
    // Spread distances evenly from near (0.05mi) to max — some close, some far
    const distFrac = seededRand(i * 3 + 1);
    const distance = 0.05 + Math.sqrt(distFrac) * (maxDist - 0.05);
    const angle = seededRand(i * 3 + 2) * Math.PI * 2;
    const dLat = distance * Math.cos(angle) * MI_TO_DEG;
    const dLng = (distance * Math.sin(angle) * MI_TO_DEG) / Math.cos(latRad);
    bots.push({
      id: `bot-${i + 1}`,
      username: isAnon ? FIRST_NAMES[54 + (i % 6)] : FIRST_NAMES[i % 54],
      bio: isAnon ? undefined : `${interests[0]} enthusiast`,
      visibility,
      is_online: i % 5 !== 4,
      is_verified: i % 7 === 0,
      is_premium: i % 9 === 0,
      interests,
      plan: i % 4 === 0 ? "platinum" : i % 3 === 0 ? "pro" : "free",
      lat: lat + dLat,
      lng: lng + dLng,
    });
  }
  return bots;
}