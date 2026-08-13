import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Same grandfathering cutoff the login gate uses.
const GATE_CUTOFF = new Date("2026-08-12T00:00:00Z").getTime();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const waitlist = await base44.asServiceRole.entities.Waitlist.list('-created_date', 5000);
    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const approvedEmails = new Set(
      waitlist
        .filter((w) => w.status === 'approved' || w.status === 'active')
        .map((w) => (w.email || '').toLowerCase().trim())
    );

    // Active members = real accounts that can actually get in:
    // approved emails, admins, or accounts created before the gate tightened.
    const activeCount = users.filter((u) => {
      const email = (u.email || '').toLowerCase().trim();
      const isLegacy = u.created_date && new Date(u.created_date).getTime() < GATE_CUTOFF;
      return approvedEmails.has(email) || u.role === 'admin' || isLegacy;
    }).length;

    // Waitlist = people still waiting (not approved, not rejected).
    const waitlistCount = waitlist.filter(
      (w) => w.status === 'waitlisted' || w.status === 'pending'
    ).length;

    return Response.json({
      waitlist_count: waitlistCount,
      active_count: activeCount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});