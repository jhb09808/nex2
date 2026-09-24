import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Narrow AI helpers for the app. Each action builds its own fixed prompt from
// short, capped fields — callers can't send a free-form prompt.

const clip = (s, n) => String(s || '').replace(/[\r\n]+/g, ' ').slice(0, n);
const list = (a, max = 12) => (Array.isArray(a) ? a : []).slice(0, max).map((x) => clip(x, 50)).filter(Boolean);

function person(p) {
  return { username: clip(p?.username, 30), bio: clip(p?.bio, 160), interests: list(p?.interests) };
}

async function autocomplete(llm, body) {
  const field = body.field === 'I Provide' ? 'I Provide' : 'Looking For';
  const query = clip(body.query, 80);
  const res = await llm({
    prompt: `You are an autocomplete engine for a professional networking app.
The user is typing in the "${field}" field. Based on what they've typed so far, predict 3-5 likely completions.

Input so far: "${query}"

Return a JSON object with a "suggestions" array of short phrases (2-6 words each) that complete or relate to what the user is typing. Make them specific and practical. Do not include the input text itself — just the completions.`,
    response_json_schema: { type: 'object', properties: { suggestions: { type: 'array', items: { type: 'string' } } } },
  });
  return { suggestions: list(res?.suggestions, 5) };
}

async function chatIcebreaker(llm, body) {
  const mine = list(body.my_interests);
  const theirs = list(body.their_interests);
  const shared = mine.filter((i) => theirs.includes(i));
  const res = await llm({
    prompt: `You are a witty, friendly conversation starter for a social networking app called NEX2.

User A's interests: ${mine.join(', ') || 'not specified'}
User B's interests: ${theirs.join(', ') || 'not specified'}
Shared interests: ${shared.join(', ') || 'none directly shared'}

Generate ONE short, casual icebreaker message that User A could send to User B to start a conversation.

Rules:
- Keep it under 2 sentences, natural and casual (like a real text message)
- If there are shared interests, reference one naturally
- If there are no shared interests, find a creative, playful connection between their different interests
- Be warm and engaging, NOT cheesy, cringey, or formal
- Don't use hashtags or emojis
- Don't start with "Hey" or "Hi" — be specific and interesting
- Speak as User A talking TO User B

Return ONLY the message text.`,
    response_json_schema: { type: 'object', properties: { message: { type: 'string' } } },
  });
  return { message: clip(res?.message, 400) };
}

async function profileIcebreaker(llm, body) {
  const them = person(body.user);
  const res = await llm({
    prompt: `Generate a personalized icebreaker message from the user to ${them.username}.

Their interests: ${them.interests.join(', ')}
Their bio: ${them.bio || 'No bio'}

Find a specific, natural common ground. Make it feel authentic, not generic. Reference something specific about their profile. Keep it under 2 sentences.`,
    response_json_schema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'string' } } },
  });
  return { message: clip(res?.message, 400), context: clip(res?.context, 120) };
}

async function matchInsight(llm, body) {
  const me = person(body.me);
  const them = person(body.user);
  const res = await llm({
    prompt: `You are NEX AI. A user (${me.username || 'User'}, interests: ${me.interests.join(', ')}) wants to connect with ${them.username} (bio: ${them.bio.slice(0, 100)}, interests: ${them.interests.join(', ')}).

Generate:
1. A one-sentence reason WHY they should connect (specific, referencing shared interests).
2. A natural, personalized icebreaker message (1-2 sentences, conversational, not cheesy).
3. Their likely profession/role (short, 2-3 words).`,
    response_json_schema: { type: 'object', properties: { reason: { type: 'string' }, icebreaker: { type: 'string' }, profession: { type: 'string' } } },
  });
  return { reason: clip(res?.reason, 300), icebreaker: clip(res?.icebreaker, 400), profession: clip(res?.profession, 40) };
}

async function opportunityInsight(llm, body, base44) {
  // Profile is read server-side — the caller only names which one.
  const profile = await base44.asServiceRole.entities.UserProfile.get(String(body.profile_id || ''));
  if (!profile) throw new Error('Profile not found');
  const generalData = {
    username: profile.username,
    i_am: profile.i_am,
    available_for: profile.available_for || [],
    looking_for: profile.looking_for || [],
    provides: profile.provides || [],
    industry: profile.industry,
    company_name: profile.company_name,
    interests: profile.interests || [],
  };
  return await llm({
    prompt: `You are an AI opportunity matcher for NEX2, a proximity-based professional network.
Analyze this user profile and generate a concise, GENERAL opportunity insight.

Profile:
${JSON.stringify(generalData, null, 2)}

IMPORTANT: Keep the insight broad and general. Do NOT focus on funding, investment amounts, or financial specifics. Focus on what this person does, what they offer, and what they're open to. Funding and hiring details are revealed separately on demand.

Generate a JSON response with:
1. "offer_summary": One punchy sentence (max 15 words) describing what this person offers to others nearby.
2. "need_summary": One punchy sentence (max 15 words) describing what this person is looking for.
3. "top_opportunities": Array of exactly 3 opportunity objects, each with:
   - "title": Short title (max 5 words)
   - "description": One sentence (max 20 words) describing a general opportunity this person presents to others nearby.
   - "icon": One of these exact values: "briefcase", "trending", "handshake"
4. "connection_pitch": One compelling sentence (max 25 words) explaining why someone nearby should connect with this person.

Be specific to their role and industry, but stay general — no funding amounts or financial details. Everyone has something to offer. Be encouraging and specific, not generic.`,
    response_json_schema: {
      type: 'object',
      properties: {
        offer_summary: { type: 'string' },
        need_summary: { type: 'string' },
        top_opportunities: {
          type: 'array',
          items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, icon: { type: 'string' } } },
        },
        connection_pitch: { type: 'string' },
      },
    },
  });
}

const ACTIONS = { autocomplete, chatIcebreaker, profileIcebreaker, matchInsight, opportunityInsight };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const run = ACTIONS[body?.action];
    if (!run) return Response.json({ error: 'Unknown action' }, { status: 400 });

    const llm = (args) => base44.asServiceRole.integrations.Core.InvokeLLM(args);
    return Response.json(await run(llm, body, base44));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});