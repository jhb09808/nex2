import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();
    const zip_code = body?.zip_code?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, error: "Valid email is required." }, { status: 400 });
    }
    if (!zip_code || !/^\d{5}(-\d{4})?$/.test(zip_code)) {
      return Response.json({ success: false, error: "Valid ZIP code is required." }, { status: 400 });
    }

    // Check for existing entry (service role — waitlist is public, no user auth needed)
    const existing = await base44.asServiceRole.entities.Waitlist.filter({ email });
    if (existing.length > 0) {
      return Response.json({ success: true, already_registered: true });
    }

    await base44.asServiceRole.entities.Waitlist.create({ email, zip_code });

    // Send email notification to the admin
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "whosnex2me@gmail.com",
        subject: "New Waitlist Signup",
        body: `A new user joined the NEX2 waitlist!\n\nEmail: ${email}\nZIP Code: ${zip_code}\n\nManage your waitlist from the Admin Panel.`,
      });
    } catch (emailErr) {
      // Don't fail the whole request if email fails
      console.error("Failed to send waitlist notification email:", emailErr?.message || JSON.stringify(emailErr));
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});