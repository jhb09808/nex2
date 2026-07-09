// Computes blur level for profile photos based on conversation state.
// Stages: 20px (match/no exchange), 10px (both replied once), 0px (mutual agreement)

export function computeBlurLevel(messages, myId, otherId) {
  if (!messages || messages.length === 0) return 20;
  const myCount = messages.filter((m) => m.sender_id === myId).length;
  const theirCount = messages.filter((m) => m.sender_id === otherId).length;
  // Stage 3: mutual agreement — both sent 2+ messages
  if (myCount >= 2 && theirCount >= 2) return 0;
  // Stage 2: first reply from both sides
  if (myCount >= 1 && theirCount >= 1) return 10;
  // Stage 1: one-sided or no exchange
  return 20;
}

// Quick lookup for card popup using conversation's photo_unlocked flag
export function getBlurForConversation(convo) {
  if (!convo || !convo.is_active) return 20;
  if (convo.photo_unlocked) return 0;
  return 10;
}