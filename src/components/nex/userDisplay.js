// Display name logic:
// - Anonymous visibility → "Anonymous"
// - All other users → their chosen username
// User number is sequential (chronological signup order), formatted as 9 digits.

export function getUserNumber(user) {
  if (!user?.user_number) return "000000000";
  return String(user.user_number).padStart(9, "0");
}

export function getUserNumberLabel(user) {
  return `User #${getUserNumber(user)}`;
}

export function getUserDisplayName(user) {
  if (!user) return "User";
  if (user.visibility === "anonymous") return "Anonymous";
  return user.username || `User #${getUserNumber(user)}`;
}