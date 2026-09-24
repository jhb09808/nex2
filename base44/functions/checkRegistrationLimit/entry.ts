import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // True-Client-IP is set (and overwritten) by the platform edge, so callers
    // can't spoof it. X-Forwarded-For is client-extendable: only the entry the
    // edge appended (3rd from the end) is trustworthy.
    const xff = (req.headers.get("x-forwarded-for") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const ip = req.headers.get("true-client-ip")?.trim()
      || (xff.length >= 3 ? xff[xff.length - 3] : null)
      || "unknown";

    const attempts = await base44.asServiceRole.entities.RegistrationAttempt.filter({
      ip_address: ip
    });

    const MAX_PER_DEVICE = 1;
    if (attempts.length >= MAX_PER_DEVICE) {
      return Response.json({
        allowed: false,
        error: "An account has already been created from this device."
      });
    }

    await base44.asServiceRole.entities.RegistrationAttempt.create({ ip_address: ip });

    return Response.json({ allowed: true });
  } catch (error) {
    return Response.json({ allowed: false, error: error.message }, { status: 500 });
  }
});