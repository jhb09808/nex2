import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FREE_DAILY_CHAT_LIMIT = 10;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    const tier = profile.plan || 'free';
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Reset daily count if new day
    let dailyChatCount = profile.daily_chat_count || 0;
    if (profile.last_chat_reset_date !== today) {
      dailyChatCount = 0;
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        daily_chat_count: 0,
        last_chat_reset_date: today,
      });
    }

    // Free tier enforcement
    if (tier === 'free') {
      if (dailyChatCount >= FREE_DAILY_CHAT_LIMIT) {
        return Response.json({
          allowed: false,
          reason: 'daily_limit_reached',
          daily_chat_count: dailyChatCount,
          daily_chat_limit: FREE_DAILY_CHAT_LIMIT,
        });
      }

      // Increment count
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        daily_chat_count: dailyChatCount + 1,
      });

      return Response.json({
        allowed: true,
        daily_chat_count: dailyChatCount + 1,
        daily_chat_limit: FREE_DAILY_CHAT_LIMIT,
      });
    }

    // Paid tiers: unlimited chats
    return Response.json({
      allowed: true,
      daily_chat_count: null,
      daily_chat_limit: null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});