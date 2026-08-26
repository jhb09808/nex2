import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';

const MIN_AGE = 18;

// Whole years between a verified date of birth and today.
function ageFrom(dob: { day?: number; month?: number; year?: number } | null): number | null {
  if (!dob?.year || !dob?.month || !dob?.day) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.year;
  const before =
    now.getUTCMonth() + 1 < dob.month ||
    (now.getUTCMonth() + 1 === dob.month && now.getUTCDate() < dob.day);
  if (before) age -= 1;
  return age;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sessionId = body?.session_id;
    if (!sessionId) return Response.json({ error: 'session_id is required' }, { status: 400 });

    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) {
      return Response.json({
        error: 'Identity verification is not set up yet.',
        verification_not_configured: true,
      }, { status: 503 });
    }

    // The verdict is read from Stripe here, never taken from the caller — the
    // client only ever hands over an id, so it cannot assert its own result.
    const url = `https://api.stripe.com/v1/identity/verification_sessions/${encodeURIComponent(sessionId)}?expand[]=verified_outputs`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    const session = await res.json();
    if (!res.ok) {
      return Response.json({ error: session?.error?.message || 'Could not read the verification session' }, { status: 502 });
    }

    if (session.metadata?.user_id !== user.id) {
      return Response.json({ error: 'That verification belongs to another account.' }, { status: 403 });
    }
    if (session.status !== 'verified') {
      return Response.json({
        verified: false,
        status: session.status,
        reason: session.last_error?.reason || null,
      }, { status: 200 });
    }

    const age = ageFrom(session.verified_outputs?.dob || null);
    if (age === null) {
      return Response.json({ verified: false, status: 'no_dob' }, { status: 200 });
    }
    if (age < MIN_AGE) {
      // A verified document showing under 18 is a definite no, not a retry.
      return Response.json({ verified: false, under_age: true, status: 'under_age' }, { status: 200 });
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    if (profiles.length === 0) {
      // Onboarding confirms after the profile is created, so this only happens
      // if the two got out of order. The caller can retry.
      return Response.json({ verified: true, age, profile_pending: true }, { status: 200 });
    }

    // Nothing from the document is kept beyond the age it proves — no name,
    // address, document number or image.
    await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
      age,
      is_adult: true,
      adult_verified_at: new Date().toISOString(),
      verification_method: 'id_verified',
      is_verified: true,
      requires_reverification: false,
    });

    return Response.json({ verified: true, age });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
