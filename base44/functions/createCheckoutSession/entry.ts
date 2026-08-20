import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';

// Prices live here rather than as Stripe Price IDs so the only thing that has
// to be configured is the secret key. Amounts are in cents and must match the
// plan list the app shows (src/pages/Premium.jsx).
const PLANS = {
  plus: { label: 'NEX2 Plus', amount: 999 },
  pro: { label: 'NEX2 Pro', amount: 1999 },
  platinum: { label: 'NEX2 Platinum', amount: 100000 },
};

// Only these origins may be used for the return URLs, so a caller can't point
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

    const body = await req.json();
    const plan = String(body?.plan || '').toLowerCase();
    if (!PLANS[plan]) {
      return Response.json({ error: 'Unknown plan' }, { status: 400 });
    }

    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) {
      // Nothing is charged until a key is set — say so plainly rather than
      // pretending the subscription went through.
      return Response.json({
        error: 'Payments are not set up yet.',
        payments_not_configured: true,
      }, { status: 503 });
    }

    const origin = allowedOrigin(body?.origin, req);
    const { label, amount } = PLANS[plan];

    const form = new URLSearchParams({
      mode: 'subscription',
      success_url: `${origin}/premium?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?checkout=cancelled`,
      client_reference_id: user.id,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(amount),
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][price_data][product_data][name]': label,
      // Read back on activation so the tier can't be swapped after payment.
      'metadata[plan]': plan,
      'metadata[user_id]': user.id,
      'subscription_data[metadata][plan]': plan,
      'subscription_data[metadata][user_id]': user.id,
    });
    if (user.email) form.set('customer_email', user.email);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) {
      console.error('Stripe checkout error:', session?.error?.message);
      return Response.json({ error: session?.error?.message || 'Could not start checkout' }, { status: 502 });
    }

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
