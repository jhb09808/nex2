import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const entryId = body?.entryId;
    if (!entryId) return Response.json({ error: 'entryId is required' }, { status: 400 });

    const entry = await base44.asServiceRole.entities.Waitlist.get(entryId);
    if (!entry) return Response.json({ error: 'Waitlist entry not found' }, { status: 404 });

    // Update status to approved
    await base44.asServiceRole.entities.Waitlist.update(entryId, { status: 'active' });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});