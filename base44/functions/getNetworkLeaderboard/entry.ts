import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);

    const entries = profiles
      .filter((p) => p.created_by_id)
      .map((p) => ({
        user_id: p.created_by_id,
        username: p.visibility === "anonymous" ? "Anonymous" : (p.username || "User"),
        profile_photo: p.profile_photo || null,
        plan: p.plan || "free",
        is_verified: p.is_verified || false,
        connections: p.connections_count || 0,
      }));

    entries.sort((a, b) => b.connections - a.connections);

    const myEntry = entries.find((e) => e.user_id === user.id);
    const myCount = myEntry?.connections || 0;
    const myIndex = entries.findIndex((e) => e.user_id === user.id);
    const myRank = myIndex >= 0 ? myIndex + 1 : entries.length + 1;
    const totalConnections = entries.reduce((sum, e) => sum + e.connections, 0);

    return Response.json({
      leaderboard: entries.slice(0, 50),
      myRank,
      myCount,
      totalUsers: entries.length,
      totalConnections,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});