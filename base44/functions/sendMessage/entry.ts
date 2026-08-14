import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MAX_MESSAGES = 20;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversation_id, content, type, media_url } = await req.json();
    if (!conversation_id || (!content?.trim() && !media_url)) {
      return Response.json({ error: 'conversation_id and content or media_url required' }, { status: 400 });
    }
    const msgType = type || (media_url ? 'image' : 'text');
    const body = content?.trim() || (msgType === 'voice' ? 'Voice message' : 'Photo');

    const convo = await base44.asServiceRole.entities.Conversation.get(conversation_id);
    if (!convo) return Response.json({ error: 'Conversation not found' }, { status: 404 });
    if (!convo.participants?.includes(user.id)) {
      return Response.json({ error: 'Not a participant' }, { status: 403 });
    }

    if (convo.ended_by) {
      return Response.json({ error: 'Conversation has ended', ended: true }, { status: 403 });
    }

    const allMsgs = await base44.asServiceRole.entities.Message.filter({ conversation_id });
    const sentCount = allMsgs.filter(
      (m) => m.sender_id === user.id && m.type !== 'system'
    ).length;

    if (sentCount >= MAX_MESSAGES) {
      return Response.json({
        error: 'Message limit reached',
        limit_reached: true,
        sent_count: sentCount,
        max: MAX_MESSAGES,
      }, { status: 403 });
    }

    const msg = await base44.asServiceRole.entities.Message.create({
      conversation_id,
      sender_id: user.id,
      content: body,
      type: msgType,
      ...(media_url ? { media_url } : {}),
    });

    await base44.asServiceRole.entities.Conversation.update(conversation_id, {
      last_message: body,
      last_message_at: new Date().toISOString(),
    });

    return Response.json({
      message: msg,
      sent_count: sentCount + 1,
      max: MAX_MESSAGES,
      limit_reached: sentCount + 1 >= MAX_MESSAGES,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}