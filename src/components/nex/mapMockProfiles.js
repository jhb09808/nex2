// Generates diverse mock nearby profiles (bots) around a center point.
// Positioned within ~0.5mi so they appear on the radar scope by default.
// Each bot has a primary interest so blips render in distinct colors.
// Generates 60 bots; NearbyMap shows ~15 in Best Matches, all 60 in All Nearby.

const INTEREST_POOL = [
  // 1 — Creative Designer
  ["graphic-design", "illustration", "branding", "photography", "videography", "content-creation", "social-media", "3d-design", "ai-art", "creative-collaborations", "art-galleries", "museums", "street-art", "animation", "fashion-photography"],
  // 2 — Fitness Athlete
  ["weight-training", "strength-training", "bodybuilding", "powerlifting", "crossfit", "hiit", "nutrition", "meal-prep", "running", "yoga", "recovery", "sauna", "cold-plunge", "gym-partners", "outdoor-workouts"],
  // 3 — Foodie Explorer
  ["italian", "japanese", "thai", "sushi", "ramen", "cooking", "baking", "brunch", "coffee", "wine", "craft-beer", "trying-new-restaurants", "food-trucks", "street-food", "fine-dining"],
  // 4 — Nightlife Socialite
  ["hip-hop", "house", "nightclubs", "rooftops", "lounges", "cocktail-bars", "speakeasies", "dance-parties", "raves", "djing", "concerts", "music-festivals", "happy-hour", "event-hopping", "underground-techno"],
  // 5 — Outdoor Adventurer
  ["outdoor-hiking", "outdoor-camping", "kayaking", "paddleboarding", "rock-climbing", "mountain-biking", "nature-walks", "parks", "beach-days", "fishing", "boating", "road-trips", "adventure-travel", "outdoor-photography", "outdoor-fitness"],
  // 6 — Tech Entrepreneur
  ["artificial-intelligence", "startups", "coding", "web-development", "app-development", "software-engineering", "cryptocurrency", "blockchain", "ux-ui-design", "product-design", "automation", "venture-capital", "entrepreneurship", "tech-news", "gadgets"],
  // 7 — Wellness Guru
  ["yoga", "meditation", "mindfulness", "breathwork", "spirituality", "self-care", "journaling", "pilates", "mental-wellness", "holistic-wellness", "personal-growth", "healthy-eating", "work-life-balance", "wellness-sauna", "wellness-cold-plunge"],
  // 8 — Gamer
  ["pc-gaming", "playstation", "xbox", "nintendo", "esports", "call-of-duty", "fortnite", "minecraft", "role-playing-games", "strategy-games", "indie-games", "fighting-games", "streaming-gameplay", "board-games", "dungeons-and-dragons"],
  // 9 — Dog Lover
  ["dogs", "dog-walking", "dog-parks", "pet-training", "pet-adoption", "animal-rescue", "pet-photography", "outdoor-hiking", "nature-walks", "parks", "running", "outdoor-fitness", "coffee", "exploring-the-city", "community-volunteering"],
  // 10 — Streetwear Icon
  ["streetwear", "sneakers", "vintage-fashion", "thrifting", "luxury-fashion", "designer-brands", "styling", "fashion-shows", "fashion-photography", "custom-clothing", "upcycling", "jewelry", "watches", "beauty", "content-creation"],
  // 11 — AI Startup Founder
  ["artificial-intelligence", "startups", "entrepreneurship", "investing", "venture-capital", "fundraising", "marketing", "networking", "leadership", "personal-development", "consulting", "technology-businesses", "innovation", "product-design", "automation"],
  // 12 — Travel Photographer
  ["photography", "travel-photography", "videography", "filmmaking", "video-editing", "international-travel", "solo-travel", "adventure-travel", "cultural-travel", "backpacking", "digital-nomad-life", "street-art", "museums", "content-creation", "social-media"],
  // 13 — Car Enthusiast
  ["jdm-cars", "luxury-cars", "classic-cars", "exotic-cars", "car-meets", "car-shows", "racing", "drifting", "car-modification", "detailing", "vinyl-wraps", "automotive-photography", "cars-road-trips", "motorcycles", "cars-formula-1"],
  // 14 — Anime & Film Buff
  ["anime", "binge-watching", "science-fiction", "fantasy", "animation", "action", "comedy", "horror", "thriller", "drama", "documentaries", "true-crime", "film-festivals", "film-discussions", "movie-theaters"],
  // 15 — Science Nerd
  ["science", "book-clubs", "reading", "history", "psychology", "philosophy", "politics", "writing", "study-groups", "online-courses", "public-speaking", "financial-literacy", "career-development", "documentaries", "languages"],
  // 16 — Baker & Food Creator
  ["baking", "desserts", "bakeries", "cooking", "italian", "french", "pasta", "coffee", "matcha", "tea", "smoothies", "healthy-eating", "organic-food", "food-reviews", "trying-new-restaurants"],
  // 17 — Street Artist
  ["painting", "street-art", "graffiti", "illustration", "drawing", "sculpture", "creative-collaborations", "art-galleries", "museums", "photography", "graphic-design", "content-creation", "social-media", "animation", "fashion-design"],
  // 18 — Business Investor
  ["entrepreneurship", "investing", "finance", "real-estate", "venture-capital", "startups", "marketing", "advertising", "sales", "networking", "leadership", "consulting", "e-commerce", "small-business", "fundraising"],
  // 19 — Jazz & Culture Lover
  ["jazz", "blues", "soul", "funk", "live-music", "concerts", "vinyl-records", "reading", "book-clubs", "history", "philosophy", "art-galleries", "museums", "cultural-events", "festivals"],
  // 20 — Beach Traveler
  ["international-travel", "beach-vacations", "solo-travel", "luxury-travel", "cultural-travel", "food-tourism", "cruises", "staycations", "road-trips", "photography", "adventure-travel", "backpacking", "city-trips", "camping", "digital-nomad-life"],
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
      bio: isAnon ? undefined : `Passionate about ${interests.slice(0, 3).join(", ")} and more`,
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