import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
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