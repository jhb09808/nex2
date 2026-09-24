import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Demo bots are the generated "bot-N" profiles; replies may only ever be
// posted under one of those ids, never a real user's.
const BOT_ID_RE = /^bot-\d{1,3}$/;

const clip = (s, n) => String(s || '').replace(/[\r\n]+/g, ' ').slice(0, n);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversation_id, bot_user_id, bot_profile } = await req.json();

    if (!conversation_id || !bot_user_id) {
      return Response.json({ error: 'conversation_id and bot_user_id are required' }, { status: 400 });
    }
    if (!BOT_ID_RE.test(String(bot_user_id))) {
      return Response.json({ error: 'Not a bot conversation' }, { status: 403 });
    }

    const convo = await base44.asServiceRole.entities.Conversation.get(conversation_id);
    const participants = convo?.participants || [];
    if (!participants.includes(user.id) || !participants.includes(bot_user_id)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // History comes from the database, not the request.
    const recent = await base44.asServiceRole.entities.Message.filter({ conversation_id }, '-created_date', 12);
    const botName = clip(bot_profile?.username, 30) || 'this person';
    const history = recent.reverse().map((m) =>
      `${m.sender_id === bot_user_id ? botName : 'Them'}: ${clip(m.content, 300)}`
    ).join('\n');

    const interests = (Array.isArray(bot_profile?.interests) ? bot_profile.interests : [])
      .slice(0, 8).map((i) => clip(i, 40)).join(', ') || 'various topics';
    const bio = clip(bot_profile?.bio, 160);

    const prompt = `You are roleplaying as ${botName}, a real person on a social networking app called NEX2. You are NOT an AI or assistant — you are a human chatting casually.

Your profile:
- Interests: ${interests}
- Bio: ${bio || 'N/A'}

Conversation so far:
${history || '(just started)'}

Respond naturally as ${botName} would — casual, friendly, brief (1-2 sentences). Keep it human and authentic. Don't mention you're an AI or bot. Just reply to the last message.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const reply = clip(typeof llmRes === 'string' ? llmRes.trim() : (llmRes?.response || llmRes?.text || ''), 500).trim();
    if (!reply) return Response.json({ error: 'No reply generated' }, { status: 502 });

    await base44.asServiceRole.entities.Message.create({
      conversation_id,
      sender_id: bot_user_id,
      content: reply,
      type: 'text',
    });

    try {
      await base44.asServiceRole.entities.Conversation.update(conversation_id, {
        last_message: reply,
        last_message_at: new Date().toISOString(),
      });
    } catch (e) {
      // Message is already created; real-time subscription will deliver it
    }

    return Response.json({ success: true, reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});