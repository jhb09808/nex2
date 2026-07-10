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

    const accessCode = Deno.env.get("ACCESS_PASSWORD");

    // Update status to approved
    await base44.asServiceRole.entities.Waitlist.update(entryId, { status: 'approved' });

    // Send approval email with access code
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: entry.email,
        subject: "You're In — Welcome to NEX2",
        body: `Great news! You've been approved for NEX2.\n\nYour access code is: ${accessCode}\n\nUse it at the login screen to create your account.\n\nSee you soon,\nThe NEX2 Team`,
      });
    } catch (emailErr) {
      console.error("Failed to send approval email:", emailErr?.message || JSON.stringify(emailErr));
      return Response.json({ success: true, email_sent: false, warning: "Approved but email failed to send" });
    }

    return Response.json({ success: true, email_sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});