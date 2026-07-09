// Generates diverse mock nearby profiles (bots) around a center point.
// Positioned within ~0.5mi so they appear on the radar scope by default.
// Each bot has a primary interest so blips render in distinct colors.

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn", "Sam", "Drew", "Reese"];
const ANON_NAMES = ["Ghost", "Shadow", "Wanderer", "Nomad", "Echo", "Drift", "Phantom", "Mystery"];

// ~0.007 deg ≈ 0.5mi — keep bots inside default radius
const R = 0.006;

function off(seed) {
  // deterministic offset in [-R, R]
  const v = ((Math.abs(seed) * 9301 + 49297) % 233280) / 233280;
  return (v - 0.5) * 2 * R;
}

export function generateMockProfiles(center) {
  const { lat, lng } = center;
  return [
    { id: "bot-1", username: "Maya", bio: "Designer & coffee enthusiast", visibility: "full_profile", is_online: true, is_verified: true, is_premium: false, interests: ["Design", "Art"], profile_photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop`, lat: lat + off(1), lng: lng + off(2) },
    { id: "bot-2", username: "Liam", bio: "Gym junkie 💪", visibility: "full_profile", is_online: true, is_verified: false, is_premium: false, interests: ["Fitness", "Sports"], profile_photo: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop`, lat: lat + off(3), lng: lng + off(4) },
    { id: "bot-3", username: "Sofia", bio: "Foodie adventures 🍕", visibility: "full_profile", is_online: false, is_verified: true, is_premium: false, interests: ["Food", "Cooking"], profile_photo: `https://images.unsplash.com/photo-1534528741775-53994a68a10c?w=100&h=100&fit=crop`, lat: lat + off(5), lng: lng + off(6) },
    { id: "bot-4", username: "Noah", bio: "Music producer 🎧", visibility: "full_profile", is_online: true, is_verified: false, is_premium: true, interests: ["Music", "Nightlife"], profile_photo: `https://images.unsplash.com/photo-1492562080023-ab3db95b948c?w=100&h=100&fit=crop`, lat: lat + off(7), lng: lng + off(8) },
    { id: "bot-5", username: "Aria", bio: "Hiking every weekend ⛰️", visibility: "full_profile", is_online: true, is_verified: false, is_premium: false, interests: ["Hiking", "Travel"], profile_photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop`, lat: lat + off(9), lng: lng + off(10) },
    { id: "bot-6", username: "Ethan", bio: "Crypto trader", visibility: "full_profile", is_online: true, is_verified: false, is_premium: false, interests: ["Crypto", "Technology"], profile_photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop`, lat: lat + off(11), lng: lng + off(12) },
    { id: "bot-7", username: "Zoe", bio: "Yoga instructor 🧘", visibility: "full_profile", is_online: true, is_verified: true, is_premium: false, interests: ["Yoga", "Fitness"], profile_photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop`, lat: lat + off(13), lng: lng + off(14) },
    { id: "bot-8", username: "Mason", bio: "Gamer 🎮", visibility: "first_name", is_online: true, is_verified: false, is_premium: false, interests: ["Gaming", "Music"], profile_photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop`, lat: lat + off(15), lng: lng + off(16) },
    { id: "bot-9", username: "Avery", bio: "Pet lover 🐕", visibility: "full_profile", is_online: false, is_verified: false, is_premium: false, interests: ["Pets", "Reading"], profile_photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop`, lat: lat + off(17), lng: lng + off(18) },
    { id: "bot-10", username: "Quinn", bio: "Fashion designer 👗", visibility: "full_profile", is_online: true, is_verified: true, is_premium: true, interests: ["Fashion", "Art"], profile_photo: `https://images.unsplash.com/photo-1534528741775-53994a68a10c?w=100&h=100&fit=crop`, lat: lat + off(19), lng: lng + off(20) },
    { id: "bot-11", username: "Ghost", visibility: "anonymous", is_online: true, is_verified: false, is_premium: false, interests: [], lat: lat + off(21), lng: lng + off(22) },
    { id: "bot-12", username: "Echo", visibility: "anonymous", is_online: true, is_verified: false, is_premium: false, interests: [], lat: lat + off(23), lng: lng + off(24) },
  ];
}