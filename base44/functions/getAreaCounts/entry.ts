import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const zip_code = body?.zip_code?.trim();

    if (!zip_code || !/^\d{5}(-\d{4})?$/.test(zip_code)) {
      return Response.json({ error: 'Valid ZIP code is required' }, { status: 400 });
    }

    const zipPrefix = zip_code.substring(0, 3);

    // Waitlist counts by exact zip
    const waitlistedExact = await base44.asServiceRole.entities.Waitlist.filter({
      zip_code: zip_code,
      status: 'waitlisted'
    });

    let waitlistCount = waitlistedExact.length;
    let waitlistFallback = false;

    // Fallback: if under 5, broaden to zip prefix (city-wide)
    if (waitlistCount < 5) {
      const allWaitlisted = await base44.asServiceRole.entities.Waitlist.filter({ status: 'waitlisted' });
      const broadCount = allWaitlisted.filter((e) => e.zip_code && e.zip_code.startsWith(zipPrefix)).length;
      if (broadCount > waitlistCount) {
        waitlistCount = broadCount;
        waitlistFallback = true;
      }
    }

    // Active counts by exact zip
    const activeExact = await base44.asServiceRole.entities.Waitlist.filter({
      zip_code: zip_code,
      status: 'active'
    });

    let activeCount = activeExact.length;
    let activeFallback = false;

    if (activeCount > 0 && activeCount < 5) {
      const allActive = await base44.asServiceRole.entities.Waitlist.filter({ status: 'active' });
      const broadActive = allActive.filter((e) => e.zip_code && e.zip_code.startsWith(zipPrefix)).length;
      if (broadActive > activeCount) {
        activeCount = broadActive;
        activeFallback = true;
      }
    }

    return Response.json({
      waitlist_count: waitlistCount,
      waitlist_fallback: waitlistFallback,
      active_count: activeCount,
      active_fallback: activeFallback
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});