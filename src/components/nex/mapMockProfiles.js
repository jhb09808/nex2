// Generates diverse mock nearby profiles around a center point.
// Types: anonymous, first_name, full_profile — plus verified/premium/online variants.

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn", "Sam", "Drew", "Reese"];
const ANON_NAMES = ["Ghost", "Shadow", "Wanderer", "Nomad", "Echo", "Drift", "Phantom", "Mystery"];
const INTERESTS = ["Music", "Tech", "Fitness", "Coffee", "Art", "Travel", "Gaming", "Food", "Photography", "Reading", "Hiking", "Design"];
const PHOTO_SEEDS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"];

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function pickMany(arr, count, seed) {
  const result = [];
  const used = new Set();
  let s = seed;
  while (result.length < count && used.size < arr.length) {
    s = (s * 31 + 7) & 0x7fffffff;
    const idx = Math.abs(s) % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
  }
  return result;
}

export function generateMockProfiles(center) {
  const { lat, lng } = center;
  return [
    // Anonymous — online
    { id: "mock-anon-1", username: "Ghost", visibility: "anonymous", is_online: true, is_verified: false, is_premium: false, interests: [], lat: lat + 0.008, lng: lng - 0.006 },
    // Anonymous — offline
    { id: "mock-anon-2", username: "Shadow", visibility: "anonymous", is_online: false, is_verified: false, is_premium: false, interests: [], lat: lat - 0.012, lng: lng + 0.005 },
    // First name only — verified
    { id: "mock-fn-1", username: pick(FIRST_NAMES, 11), visibility: "first_name", is_online: true, is_verified: true, is_premium: false, interests: pickMany(INTERESTS, 3, 7), profile_photo: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop`, lat: lat + 0.004, lng: lng + 0.011 },
    // First name only — premium
    { id: "mock-fn-2", username: pick(FIRST_NAMES, 3), visibility: "first_name", is_online: false, is_verified: false, is_premium: true, interests: pickMany(INTERESTS, 2, 13), profile_photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop`, lat: lat - 0.007, lng: lng - 0.009 },
    // Full profile — online verified premium
    { id: "mock-full-1", username: "Maya", bio: "Designer & coffee enthusiast", visibility: "full_profile", is_online: true, is_verified: true, is_premium: true, interests: pickMany(INTERESTS, 4, 19), profile_photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop`, lat: lat + 0.014, lng: lng + 0.003 },
    // Full profile — online
    { id: "mock-full-2", username: "Liam", bio: "Just here to meet people", visibility: "full_profile", is_online: true, is_verified: false, is_premium: false, interests: pickMany(INTERESTS, 3, 23), profile_photo: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop`, lat: lat - 0.015, lng: lng - 0.014 },
    // Full profile — offline
    { id: "mock-full-3", username: "Sofia", bio: "Travel addict 🌍", visibility: "full_profile", is_online: false, is_verified: true, is_premium: false, interests: pickMany(INTERESTS, 2, 29), profile_photo: `https://images.unsplash.com/photo-1534528741775-53994a68a10c?w=100&h=100&fit=crop`, lat: lat + 0.006, lng: lng - 0.018 },
    // Anonymous — online
    { id: "mock-anon-3", username: "Echo", visibility: "anonymous", is_online: true, is_verified: false, is_premium: false, interests: [], lat: lat - 0.003, lng: lng + 0.016 },
    // First name — online
    { id: "mock-fn-3", username: pick(FIRST_NAMES, 5), visibility: "first_name", is_online: true, is_verified: false, is_premium: false, interests: pickMany(INTERESTS, 2, 37), profile_photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop`, lat: lat + 0.018, lng: lng - 0.004 },
    // Full profile — premium offline
    { id: "mock-full-4", username: "Noah", bio: "Music producer 🎧", visibility: "full_profile", is_online: false, is_verified: false, is_premium: true, interests: pickMany(INTERESTS, 3, 41), profile_photo: `https://images.unsplash.com/photo-1492562080023-ab3db95b948c?w=100&h=100&fit=crop`, lat: lat + 0.002, lng: lng + 0.021 },
    // Anonymous — offline
    { id: "mock-anon-4", username: "Drift", visibility: "anonymous", is_online: false, is_verified: false, is_premium: false, interests: [], lat: lat - 0.020, lng: lng + 0.008 },
  ];
}