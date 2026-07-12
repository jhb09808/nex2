import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Total waitlist entries (all statuses except rejected)
    const allWaitlist = await base44.asServiceRole.entities.Waitlist.filter({
      status: 'waitlisted'
    });
    const pendingApproval = await base44.asServiceRole.entities.Waitlist.filter({
      status: 'pending'
    });

    // Active users = approved waitlist entries + all UserProfile records
    const approvedWaitlist = await base44.asServiceRole.entities.Waitlist.filter({
      status: 'approved'
    });

    // Count actual UserProfile records (these are real users in the app)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);

    const waitlistCount = allWaitlist.length + pendingApproval.length;
    const activeCount = allProfiles.length + approvedWaitlist.length;

    return Response.json({
      waitlist_count: waitlistCount,
      active_count: activeCount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});