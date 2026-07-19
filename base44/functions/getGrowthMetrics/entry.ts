import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 1000);

    const activeProfiles = profiles.filter(p => !p.is_suspended && !p.is_banned).length;

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = profiles.filter(p => {
        const created = new Date(p.created_date);
        return created >= date && created < nextDate;
      }).length;

      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }

    return Response.json({
      total_profiles: profiles.length,
      active_profiles: activeProfiles,
      daily_counts: days
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});