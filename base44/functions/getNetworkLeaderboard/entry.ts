import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Service-role: see all users' networking memories
    const memories = await base44.asServiceRole.entities.NetworkingMemory.list('-created_date', 500);
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);

    const profileMap = {};
    profiles.forEach((p) => {
      if (p.created_by_id) profileMap[p.created_by_id] = p;
    });

    const countByUser = {};
    memories.forEach((m) => {
      const uid = m.created_by_id;
      if (!uid) return;
      countByUser[uid] = (countByUser[uid] || 0) + 1;
    });

    const entries = Object.entries(countByUser).map(([uid, count]) => ({
      user_id: uid,
      username: profileMap[uid]?.username || "Anonymous",
      profile_photo: profileMap[uid]?.profile_photo || null,
      is_verified: profileMap[uid]?.is_verified || false,
      connections: count,
    }));
    entries.sort((a, b) => b.connections - a.connections);

    const myCount = countByUser[user.id] || 0;
    const myIndex = entries.findIndex((e) => e.user_id === user.id);
    const myRank = myIndex >= 0 ? myIndex + 1 : entries.length + 1;

    return Response.json({
      leaderboard: entries.slice(0, 10),
      myRank,
      myCount,
      totalUsers: entries.length,
      totalConnections: memories.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});