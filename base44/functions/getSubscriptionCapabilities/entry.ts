import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIER_CONFIG = {
  free: {
    radius_miles: 1,
    daily_chat_limit: 3,
    filters: 'basic',
    invisible_mode: false,
    analytics: false,
    profile_boost: false,
    priority_placement: false,
    platinum_only_mode: false,
    verified_photo_badge: false,
    global_leaderboard: false,
    concierge: false,
  },
  plus: {
    radius_miles: 10,
    daily_chat_limit: null,
    filters: 'advanced',
    invisible_mode: true,
    analytics: false,
    profile_boost: false,
    priority_placement: false,
    platinum_only_mode: false,
    verified_photo_badge: false,
    global_leaderboard: false,
    concierge: false,
  },
  pro: {
    radius_miles: 20,
    daily_chat_limit: null,
    filters: 'advanced',
    invisible_mode: true,
    analytics: true,
    profile_boost: true,
    priority_placement: true,
    platinum_only_mode: false,
    verified_photo_badge: false,
    global_leaderboard: false,
    concierge: false,
  },
  platinum: {
    radius_miles: null,
    daily_chat_limit: null,
    filters: 'advanced',
    invisible_mode: true,
    analytics: true,
    profile_boost: true,
    priority_placement: true,
    platinum_only_mode: true,
    verified_photo_badge: true,
    global_leaderboard: true,
    concierge: true,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    if (profiles.length === 0) {
      return Response.json({
        tier: 'free',
        ...TIER_CONFIG.free,
        daily_chat_count: 0,
        can_start_chat: true,
        invisible_mode_enabled: false,
        platinum_only_mode_enabled: false,
        has_verified_photo_badge: false,
      });
    }

    const profile = profiles[0];
    let tier = profile.plan || 'free';
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check for subscription expiry — downgrade immediately if expired
    if (tier !== 'free' && profile.subscription_expires_at) {
      const expires = new Date(profile.subscription_expires_at);
      if (expires < now) {
        tier = 'free';
      }
    }

    // Clean up stale higher-tier settings on downgrade
    const staleUpdates = {};
    if (tier === 'free') {
      if (profile.invisible_mode) staleUpdates.invisible_mode = false;
      if (profile.platinum_only_mode_enabled) staleUpdates.platinum_only_mode_enabled = false;
      if (profile.has_verified_photo_badge) staleUpdates.has_verified_photo_badge = false;
      if (profile.profile_boost_used_at) staleUpdates.profile_boost_used_at = null;
      if (profile.subscription_expires_at) staleUpdates.subscription_expires_at = null;
    }
    if (tier !== 'platinum' && profile.platinum_only_mode_enabled) {
      staleUpdates.platinum_only_mode_enabled = false;
    }
    if (tier !== 'platinum' && profile.has_verified_photo_badge) {
      staleUpdates.has_verified_photo_badge = false;
    }

    // Initialize default radius (0.5 mi) for new accounts; cap at tier ceiling
    const tierMax = TIER_CONFIG[tier]?.radius_miles;
    if (profile.radius_miles == null) {
      staleUpdates.radius_miles = 0.5;
    } else if (tierMax != null && profile.radius_miles > tierMax) {
      staleUpdates.radius_miles = tierMax;
    }

    if (Object.keys(staleUpdates).length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(profile.id, staleUpdates);
    }

    // Daily chat reset for free tier
    let dailyChatCount = profile.daily_chat_count || 0;
    if (profile.last_chat_reset_date !== today) {
      dailyChatCount = 0;
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        daily_chat_count: 0,
        last_chat_reset_date: today,
      });
    }

    const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
    const canStartChat = config.daily_chat_limit === null || dailyChatCount < config.daily_chat_limit;
    const finalRadius = staleUpdates.radius_miles !== undefined ? staleUpdates.radius_miles : (profile.radius_miles ?? 0.5);

    return Response.json({
      tier,
      radius_miles: finalRadius,
      radius_miles_max: config.radius_miles,
      daily_chat_limit: config.daily_chat_limit,
      daily_chat_count: dailyChatCount,
      can_start_chat: canStartChat,
      filters: config.filters,
      invisible_mode: config.invisible_mode,
      invisible_mode_enabled: tier === 'free' ? false : (profile.invisible_mode || false),
      analytics: config.analytics,
      profile_boost: config.profile_boost,
      profile_boost_used_at: profile.profile_boost_used_at || null,
      priority_placement: config.priority_placement,
      platinum_only_mode: config.platinum_only_mode,
      platinum_only_mode_enabled: tier === 'platinum' ? (profile.platinum_only_mode_enabled || false) : false,
      verified_photo_badge: config.verified_photo_badge,
      has_verified_photo_badge: tier === 'platinum' ? (profile.has_verified_photo_badge || false) : false,
      global_leaderboard: config.global_leaderboard,
      concierge: config.concierge,
      subscription_expires_at: profile.subscription_expires_at || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});