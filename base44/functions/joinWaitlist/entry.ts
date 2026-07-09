import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, error: "Valid email is required." }, { status: 400 });
    }

    // Check for existing entry (service role — waitlist is public, no user auth needed)
    const existing = await base44.asServiceRole.entities.Waitlist.filter({ email });
    if (existing.length > 0) {
      return Response.json({ success: true, already_registered: true });
    }

    await base44.asServiceRole.entities.Waitlist.create({ email });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});