import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Haversine distance in miles
function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FEET_PER_MILE = 5280;
const RADIUS_FEET = 500;
const RADIUS_MILES = RADIUS_FEET / FEET_PER_MILE; // ~0.0947 miles
const MIN_SHARED_INTERESTS = 2;
const DEDUP_WINDOW_HOURS = 2;

Deno.serve(async (_req) => {
  try {
    const base44 = createClientFromRequest(_req);

    // Service-role: scan all profiles with locations (no user context in workflow calls)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list("-created_date", 200);

    // Only profiles with a location and at least one interest, not banned/suspended, not invisible
    const located = allProfiles.filter(
      (p) =>
        p.latitude &&
        p.longitude &&
        p.interests &&
        p.interests.length > 0 &&
        !p.is_banned &&
        !p.is_suspended &&
        !p.invisible_mode
    );

    let notificationsCreated = 0;

    for (const me of located) {
      // Find others within 500 feet with shared interests
      const nearbyMatches = [];
      for (const other of located) {
        if (other.id === me.id || other.created_by_id === me.created_by_id) continue;

        const dist = distanceMiles(me.latitude, me.longitude, other.latitude, other.longitude);
        if (dist <= RADIUS_MILES) {
          const shared = me.interests.filter((i) => other.interests.includes(i));
          if (shared.length >= MIN_SHARED_INTERESTS) {
            nearbyMatches.push({
              userId: other.id,
              username: other.visibility === 'anonymous' ? 'Someone nearby' : other.username,
              visibility: other.visibility,
              sharedInterests: shared,
              distanceFeet: Math.round(dist * FEET_PER_MILE),
              plan: other.plan,
            });
          }
        }
      }

      if (nearbyMatches.length === 0) continue;

      // Check existing match notifications to avoid duplicates within the dedup window
      const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
        user_id: me.created_by_id,
        type: 'match',
      });

      const now = new Date();
      const cutoff = new Date(now.getTime() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000);
      const recentlyNotifiedIds = new Set(
        existingNotifs
          .filter((n) => new Date(n.created_date) >= cutoff)
          .map((n) => n.related_id)
      );

      // Create notifications only for newly-seen high-compatibility users (limit to 2 per scan)
      const newMatches = nearbyMatches
        .filter((m) => !recentlyNotifiedIds.has(m.userId))
        .slice(0, 2);

      for (const match of newMatches) {
        const interestText = match.sharedInterests.slice(0, 3).join(', ');
        await base44.asServiceRole.entities.Notification.create({
          user_id: me.created_by_id,
          type: 'match',
          title: `${match.username} is ${match.distanceFeet}ft away`,
          body: `High compatibility — you both like ${interestText}. Don't miss the chance to connect.`,
          related_id: match.userId,
          sender_id: match.userId,
        });
        notificationsCreated++;
      }
    }

    return Response.json({
      status: 'success',
      profilesScanned: located.length,
      notificationsCreated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});