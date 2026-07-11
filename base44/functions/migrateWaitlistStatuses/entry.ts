import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const results = { waitlist_updated: 0, activated: 0, profiles_backfilled: 0, errors: [] };

    // 1. Migrate Waitlist statuses
    const allEntries = await base44.asServiceRole.entities.Waitlist.list('-created_date', 500);

    // approved → active (ensure zip_code is set to avoid required-field validation errors)
    const approvedEntries = allEntries.filter((e) => e.status === 'approved');
    for (const entry of approvedEntries) {
      try {
        const update = { status: 'active' };
        if (!entry.zip_code) update.zip_code = '00000';
        await base44.asServiceRole.entities.Waitlist.update(entry.id, update);
        results.activated++;
      } catch (err) {
        results.errors.push(`Failed to activate ${entry.email}: ${err.message}`);
      }
    }

    // pending → waitlisted
    const pendingEntries = allEntries.filter((e) => e.status === 'pending');
    for (const entry of pendingEntries) {
      try {
        const update = { status: 'waitlisted' };
        if (!entry.zip_code) update.zip_code = '00000';
        await base44.asServiceRole.entities.Waitlist.update(entry.id, update);
        results.waitlist_updated++;
      } catch (err) {
        results.errors.push(`Failed to update ${entry.email}: ${err.message}`);
      }
    }

    // 2. Backfill zip_code on UserProfile from matching Waitlist entries
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const entryByEmail = new Map();
    for (const entry of allEntries) {
      if (entry.email) entryByEmail.set(entry.email.trim().toLowerCase(), entry);
    }

    for (const u of allUsers) {
      if (!u.email) continue;
      const wlEntry = entryByEmail.get(u.email.trim().toLowerCase());
      if (!wlEntry || !wlEntry.zip_code) continue;

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: u.id });
      if (profiles.length === 0) continue;
      const profile = profiles[0];
      if (profile.zip_code) continue; // already has zip

      try {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, { zip_code: wlEntry.zip_code });
        results.profiles_backfilled++;
      } catch (err) {
        results.errors.push(`Failed to backfill profile for ${u.email}: ${err.message}`);
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});