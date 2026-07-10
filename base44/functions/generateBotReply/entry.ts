import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conversation_id, bot_user_id, bot_profile, recent_messages } = body;

    if (!conversation_id || !bot_user_id) {
      return Response.json({ error: 'conversation_id and bot_user_id are required' }, { status: 400 });
    }

    // Build conversation history for the LLM
    const history = (recent_messages || []).map((m) => {
      const role = m.sender_id === user.id ? 'Them' : (bot_profile?.username || 'The other person');
      return `${role}: ${m.content}`;
    }).join('\n');

    const botName = bot_profile?.username || 'this person';
    const interests = bot_profile?.interests?.join(', ') || 'various topics';
    const bio = bot_profile?.bio || '';

    const prompt = `You are roleplaying as ${botName}, a real person on a social networking app called NEX2. You are NOT an AI or assistant — you are a human chatting casually.

Your profile:
- Interests: ${interests}
- Bio: ${bio || 'N/A'}

Conversation so far:
${history || '(just started)'}

Respond naturally as ${botName} would — casual, friendly, brief (1-2 sentences). Keep it human and authentic. Don't mention you're an AI or bot. Just reply to the last message.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
    });

    const reply = typeof llmRes === 'string' ? llmRes.trim() : (llmRes?.response || llmRes?.text || JSON.stringify(llmRes)).trim();

    // Create the bot's reply message
    const msg = await base44.asServiceRole.entities.Message.create({
      conversation_id,
      sender_id: bot_user_id,
      content: reply,
      type: 'text',
    });

    await base44.asServiceRole.entities.Conversation.update(conversation_id, {
      last_message: reply,
      last_message_at: new Date().toISOString(),
    });

    return Response.json({ success: true, reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});