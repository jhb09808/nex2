import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || typeof email !== "string") {
      return Response.json({ approved: false, error: "Email is required" }, { status: 400 });
    }

    const entries = await base44.asServiceRole.entities.Waitlist.filter({
      email
    });

    if (entries.length === 0) {
      return Response.json({ approved: false, status: "not_found" });
    }

    const entry = entries[0];
    if (entry.status === "active" || entry.status === "approved") {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      return Response.json({ approved: true, status: entry.status, has_account: users.length > 0 });
    }
    return Response.json({ approved: false, status: entry.status });
  } catch (error) {
    return Response.json({ approved: false, error: error.message }, { status: 500 });
  }
});