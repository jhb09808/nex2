import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';

const TIERS = ['free', 'plus', 'pro', 'platinum'];

// A month from now, which is what the checkout session bills for. Renewals
// extend this again on each successful payment.
function oneMonthOut(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

async function applyPlan(base44, userId: string, plan: string) {
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId });
  if (profiles.length === 0) return { error: 'Profile not found', status: 404 };

  const updates: Record<string, unknown> = { plan };
  updates.subscription_expires_at = plan === 'free' ? null : oneMonthOut();
  await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, updates);
  return { plan, subscription_expires_at: updates.subscription_expires_at };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // --- Admin grant: comps and testing, from the admin panel only ----------
    if (body?.grant) {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const plan = String(body.plan || '').toLowerCase();
      if (!TIERS.includes(plan)) return Response.json({ error: 'Unknown plan' }, { status: 400 });
      const targetId = body.user_id || user.id;
      const result = await applyPlan(base44, targetId, plan);
      if (result.error) return Response.json({ error: result.error }, { status: result.status });
      return Response.json({ success: true, ...result });
    }

    // --- Normal path: only a Stripe session that actually paid counts -------
    const sessionId = body?.session_id;
    if (!sessionId) return Response.json({ error: 'session_id is required' }, { status: 400 });

    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) {
      return Response.json({
        error: 'Payments are not set up yet.',
        payments_not_configured: true,
      }, { status: 503 });
    }

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const session = await res.json();
    if (!res.ok) {
      return Response.json({ error: session?.error?.message || 'Could not read the checkout session' }, { status: 502 });
    }

    // The plan comes from the session Stripe stored, never from the caller, so
    // a paid $9.99 session can't be redeemed for Platinum.
    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'That payment has not completed.', payment_status: session.payment_status }, { status: 402 });
    }
    if (session.client_reference_id !== user.id && session.metadata?.user_id !== user.id) {
      return Response.json({ error: 'That checkout belongs to another account.' }, { status: 403 });
    }

    const plan = String(session.metadata?.plan || '').toLowerCase();
    if (!TIERS.includes(plan) || plan === 'free') {
      return Response.json({ error: 'That checkout has no plan attached.' }, { status: 400 });
    }

    const result = await applyPlan(base44, user.id, plan);
    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
