import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';

// Only these origins may be used for the return URL, so a caller can't point
// Stripe's redirect at a site they control.
function allowedOrigin(origin: string | undefined, req: Request): string {
  const self = new URL(req.url).origin;
  const allowed = (Deno.env.get('APP_ORIGINS') || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (origin && (allowed.includes(origin) || origin === self)) return origin;
  return allowed[0] || self;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) {
      // Nothing is checked until a key is set — say so plainly rather than
      // letting the caller believe a verification started.
      return Response.json({
        error: 'Identity verification is not set up yet.',
        verification_not_configured: true,
      }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const origin = allowedOrigin(body?.origin, req);
    // Where the user lands after Stripe is done. `return` tells the app to
    // pick its draft back up and confirm the result.
    const returnTo = String(body?.return_to || '/onboarding');

    const form = new URLSearchParams({
      type: 'document',
      return_url: `${origin}${returnTo}${returnTo.includes('?') ? '&' : '?'}verify=return`,
      // Read back on confirmation so a session cannot be redeemed by another
      // account.
      'metadata[user_id]': user.id,
      // A document alone proves the document exists; the selfie is what ties
      // it to the person holding the phone.
      'options[document][require_matching_selfie]': 'true',
      'options[document][require_live_capture]': 'true',
    });

    const res = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) {
      console.error('Stripe Identity error:', session?.error?.message);
      return Response.json({ error: session?.error?.message || 'Could not start verification' }, { status: 502 });
    }

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
