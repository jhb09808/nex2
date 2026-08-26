import { build } from 'esbuild';
import fs from 'fs';

// Run from anywhere: node base44/functions/verification.test.mjs
const ROOT = new URL('.', import.meta.url).pathname.replace(/\/$/, '');

// Load a Deno entry.ts under Node: strip types, stub the base44 import, and
// hand back the handler that Deno.serve was called with.
async function load(name, { env = {}, stripe = () => ({ ok: true, body: {} }), profiles = [], onUpdate = () => {}, user = { id: 'u_me' } } = {}) {
  const out = await build({
    entryPoints: [`${ROOT}/${name}/entry.ts`],
    bundle: true, write: false, format: 'esm', platform: 'neutral',
    external: ['npm:*'],
  });
  let code = out.outputFiles[0].text;
  code = code.replace(/import\s*\{[^}]*\}\s*from\s*["']npm:@base44\/sdk[^"']*["'];?/, '');

  let handler = null;
  const calls = [];
  const updates = [];
  const sandbox = {
    Deno: { serve: (fn) => { handler = fn; }, env: { get: (k) => env[k] } },
    createClientFromRequest: () => ({
      auth: { me: async () => user },
      asServiceRole: {
        entities: {
          UserProfile: {
            filter: async () => profiles,
            update: async (id, patch) => { updates.push({ id, patch }); onUpdate(id, patch); },
          },
        },
      },
    }),
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      const r = stripe(String(url), init);
      return { ok: r.ok, json: async () => r.body };
    },
    console,
    URL, URLSearchParams, Request, Response, TextEncoder, Date, JSON, String, Number, encodeURIComponent,
  };
  const fn = new Function(...Object.keys(sandbox), `${code}\nreturn undefined;`);
  fn(...Object.values(sandbox));
  return { handler, calls, updates };
}

const post = (body) => new Request('https://app.example.com/fn', { method: 'POST', body: JSON.stringify(body) });
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

const KEY = { STRIPE_SECRET_KEY: 'sk_test_x', APP_ORIGINS: 'https://nex2.app' };
const dobFor = (yearsAgo) => {
  const d = new Date(); d.setUTCFullYear(d.getUTCFullYear() - yearsAgo);
  return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
};
const session = (over) => ({ ok: true, body: { status: 'verified', metadata: { user_id: 'u_me' }, verified_outputs: { dob: dobFor(over) } } });

console.log('\n=== confirmIdVerification ===');
{
  let t = await load('confirmIdVerification', { env: {}, user: null });
  let r = await t.handler(post({ session_id: 'vs_1' }));
  check('unauthenticated -> 401', r.status === 401);

  t = await load('confirmIdVerification', { env: KEY });
  r = await t.handler(post({}));
  check('missing session_id -> 400', r.status === 400);

  t = await load('confirmIdVerification', { env: {} });
  r = await t.handler(post({ session_id: 'vs_1' }));
  check('no stripe key -> 503 not_configured', r.status === 503 && (await r.json()).verification_not_configured === true);

  // The critical guard: a session created for someone else.
  t = await load('confirmIdVerification', { env: KEY, stripe: () => ({ ok: true, body: { status: 'verified', metadata: { user_id: 'u_other' }, verified_outputs: { dob: dobFor(30) } } }) });
  r = await t.handler(post({ session_id: 'vs_1' }));
  check("another account's session -> 403", r.status === 403, `got ${r.status}`);
  check('  and writes nothing', t.updates.length === 0);

  t = await load('confirmIdVerification', { env: KEY, stripe: () => ({ ok: true, body: { status: 'requires_input', metadata: { user_id: 'u_me' }, last_error: { reason: 'document_unverified_other' } } }), profiles: [{ id: 'p1' }] });
  r = await t.handler(post({ session_id: 'vs_1' }));
  let b = await r.json();
  check('unverified session -> verified:false', b.verified === false && b.status === 'requires_input');
  check('  and writes nothing', t.updates.length === 0);

  t = await load('confirmIdVerification', { env: KEY, stripe: () => ({ ok: true, body: { status: 'verified', metadata: { user_id: 'u_me' }, verified_outputs: {} } }), profiles: [{ id: 'p1' }] });
  b = await (await t.handler(post({ session_id: 'vs_1' }))).json();
  check('verified but no dob -> verified:false', b.verified === false && b.status === 'no_dob');
  check('  and writes nothing', t.updates.length === 0);

  t = await load('confirmIdVerification', { env: KEY, stripe: () => session(17), profiles: [{ id: 'p1' }] });
  b = await (await t.handler(post({ session_id: 'vs_1' }))).json();
  check('verified 17yo -> under_age', b.under_age === true && b.verified === false);
  check('  and writes nothing', t.updates.length === 0, JSON.stringify(t.updates));

  t = await load('confirmIdVerification', { env: KEY, stripe: () => session(25), profiles: [{ id: 'p1' }] });
  b = await (await t.handler(post({ session_id: 'vs_1' }))).json();
  check('verified 25yo -> verified:true', b.verified === true && b.age === 25, JSON.stringify(b));
  const patch = t.updates[0]?.patch || {};
  check('  writes id_verified', patch.verification_method === 'id_verified');
  check('  writes is_verified', patch.is_verified === true);
  check('  writes the verified age', patch.age === 25);
  check('  keeps no document data', !('name' in patch) && !('address' in patch) && !('document_number' in patch) && !('dob' in patch), JSON.stringify(patch));
  check('  expands verified_outputs', t.calls[0].url.includes('expand[]=verified_outputs'));

  // A caller trying to assert its own verdict must be ignored.
  t = await load('confirmIdVerification', { env: KEY, stripe: () => ({ ok: true, body: { status: 'requires_input', metadata: { user_id: 'u_me' } } }), profiles: [{ id: 'p1' }] });
  b = await (await t.handler(post({ session_id: 'vs_1', verified: true, verification_method: 'id_verified', is_verified: true, age: 30 }))).json();
  check('client-asserted verdict ignored', b.verified === false && t.updates.length === 0, JSON.stringify(b));

  // Boundary: the day before an 18th birthday must fail, the day of must pass.
  const dobOffsetDays = (days) => { const d = new Date(); d.setUTCFullYear(d.getUTCFullYear() - 18); d.setUTCDate(d.getUTCDate() + days); return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }; };
  t = await load('confirmIdVerification', { env: KEY, stripe: () => ({ ok: true, body: { status: 'verified', metadata: { user_id: 'u_me' }, verified_outputs: { dob: dobOffsetDays(1) } } }), profiles: [{ id: 'p1' }] });
  b = await (await t.handler(post({ session_id: 'vs_1' }))).json();
  check('turns 18 tomorrow -> under_age', b.under_age === true, JSON.stringify(b));
  t = await load('confirmIdVerification', { env: KEY, stripe: () => ({ ok: true, body: { status: 'verified', metadata: { user_id: 'u_me' }, verified_outputs: { dob: dobOffsetDays(0) } } }), profiles: [{ id: 'p1' }] });
  b = await (await t.handler(post({ session_id: 'vs_1' }))).json();
  check('turns 18 today -> verified', b.verified === true && b.age === 18, JSON.stringify(b));

  t = await load('confirmIdVerification', { env: KEY, stripe: () => session(25), profiles: [] });
  b = await (await t.handler(post({ session_id: 'vs_1' }))).json();
  check('no profile yet -> profile_pending', b.profile_pending === true && b.verified === true);
}

console.log('\n=== createVerificationSession ===');
{
  let t = await load('createVerificationSession', { env: {} });
  let r = await t.handler(post({}));
  check('no stripe key -> 503 not_configured', r.status === 503 && (await r.json()).verification_not_configured === true);

  t = await load('createVerificationSession', { env: KEY, stripe: () => ({ ok: true, body: { url: 'https://verify.stripe.com/x', id: 'vs_1' } }) });
  r = await t.handler(post({ origin: 'https://evil.example', return_to: '/onboarding' }));
  const body = await r.json();
  const sent = new URLSearchParams(t.calls[0].init.body);
  check('returns the hosted url', body.url === 'https://verify.stripe.com/x' && body.session_id === 'vs_1');
  check('rejects an unlisted origin', sent.get('return_url').startsWith('https://nex2.app/'), sent.get('return_url'));
  check('stamps metadata.user_id', sent.get('metadata[user_id]') === 'u_me');
  check('requires a matching selfie', sent.get('options[document][require_matching_selfie]') === 'true');
  check('requires live capture', sent.get('options[document][require_live_capture]') === 'true');

  t = await load('createVerificationSession', { env: KEY, stripe: () => ({ ok: true, body: { url: 'u', id: 'i' } }) });
  await t.handler(post({ origin: 'https://nex2.app', return_to: '/onboarding' }));
  check('keeps an allowed origin', new URLSearchParams(t.calls[0].init.body).get('return_url') === 'https://nex2.app/onboarding?verify=return');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
