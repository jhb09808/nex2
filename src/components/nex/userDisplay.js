// Display name logic:
// - Anonymous visibility → "Anonymous"
// - Pro / Platinum subscribers → their chosen username
// - Everyone else → "User #XXXXX" (stable number derived from id)
// Photos are restricted to platinum only in UserAvatar.

export function getUserNumber(user) {
  if (!user?.id) return "00000";
  const id = String(user.id);
  if (id.startsWith("bot-")) {
    const n = parseInt(id.replace("bot-", ""), 10);
    return String(n).padStart(5, "0");
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return String(Math.abs(hash) % 100000).padStart(5, "0");
}

export function getUserDisplayName(user) {
  if (!user) return "User";
  if (user.visibility === "anonymous") return "Anonymous";
  if (user.plan === "pro" || user.plan === "platinum") {
    return user.username || `User #${getUserNumber(user)}`;
  }
  return `User #${getUserNumber(user)}`;
}