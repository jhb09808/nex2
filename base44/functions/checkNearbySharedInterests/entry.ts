import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Haversine distance in miles
function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the current user's profile
    const myProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    if (myProfiles.length === 0) return Response.json({ matches: [] });

    const me = myProfiles[0];
    if (!me.latitude || !me.longitude || !me.interests || me.interests.length === 0) {
      return Response.json({ matches: [] });
    }

    // Get all other profiles
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list("-created_date", 100);
    const others = allProfiles.filter(
      (p) => p.id !== me.id && p.latitude && p.longitude && p.interests && p.interests.length > 0
    );

    // Find matches within 5 miles with shared interests
    const RADIUS_MILES = 5;
    const matches = [];
    for (const other of others) {
      const dist = distanceMiles(me.latitude, me.longitude, other.latitude, other.longitude);
      if (dist <= RADIUS_MILES) {
        const shared = me.interests.filter((i) => other.interests.includes(i));
        if (shared.length > 0) {
          matches.push({
            userId: other.id,
            username: other.visibility === 'anonymous' ? 'Someone nearby' : other.username,
            visibility: other.visibility,
            sharedInterests: shared,
            distanceMiles: Math.round(dist * 10) / 10,
          });
        }
      }
    }

    // Check existing nearby notifications to avoid duplicates
    const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
      user_id: user.id,
      type: 'nearby',
    });

    const notifiedUserIds = new Set(existingNotifs.map((n) => n.related_id));
    const newMatches = matches.filter((m) => !notifiedUserIds.has(m.userId));

    // Create notifications for new matches (limit to 3 to avoid spam)
    const toNotify = newMatches.slice(0, 3);
    for (const match of toNotify) {
      const interestText = match.sharedInterests.slice(0, 2).join(', ');
      await base44.asServiceRole.entities.Notification.create({
        user_id: user.id,
        type: 'nearby',
        title: `${match.username} is nearby`,
        body: `You both like ${interestText} — ${match.distanceMiles} mi away. Tap to connect on the map.`,
        related_id: match.userId,
        sender_id: match.userId,
      });
    }

    return Response.json({ matches: toNotify, totalNearby: matches.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});