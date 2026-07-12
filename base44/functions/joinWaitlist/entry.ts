import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();
    const phone = body?.phone?.trim() || undefined;
    const zip_code = body?.zip_code?.trim();
    const is_international = body?.is_international === true;
    const international_location = body?.international_location?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, error: "Valid email is required." }, { status: 400 });
    }

    if (is_international) {
      if (!international_location || international_location.length < 2) {
        return Response.json({ success: false, error: "Please tell us which city/country you're in." }, { status: 400 });
      }
    } else {
      if (!zip_code || !/^\d{5}(-\d{4})?$/.test(zip_code)) {
        return Response.json({ success: false, error: "Valid ZIP code is required." }, { status: 400 });
      }
    }

    // Check for existing entry (service role — waitlist is public, no user auth needed)
    const existing = await base44.asServiceRole.entities.Waitlist.filter({ email });
    if (existing.length > 0) {
      // Update phone if provided and not already stored
      if (phone && !existing[0].phone) {
        await base44.asServiceRole.entities.Waitlist.update(existing[0].id, { phone });
      }
      return Response.json({ success: true, already_registered: true });
    }

    const record = {
      email,
      phone,
      status: 'waitlisted',
      ...(is_international
        ? { is_international: true, international_location, zip_code: undefined }
        : { zip_code, is_international: false, international_location: undefined }),
    };

    await base44.asServiceRole.entities.Waitlist.create(record);

    // Send email notification to the admin
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "whosnex2me@gmail.com",
        subject: "New Waitlist Signup",
        body: `A new user joined the NEX2 waitlist!\n\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ""}${is_international ? `International Location: ${international_location}\nIs International: true` : `ZIP Code: ${zip_code}`}\n\nManage your waitlist from the Admin Panel.`,
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