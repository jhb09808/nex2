import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversation_id } = await req.json();
    if (!conversation_id) {
      return Response.json({ error: 'conversation_id required' }, { status: 400 });
    }

    const convo = await base44.asServiceRole.entities.Conversation.get(conversation_id);
    if (!convo) return Response.json({ error: 'Conversation not found' }, { status: 404 });
    if (!convo.participants?.includes(user.id)) {
      return Response.json({ error: 'Not a participant' }, { status: 403 });
    }

    if (convo.ended_by) {
      return Response.json({ error: 'Conversation already ended' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Conversation.update(conversation_id, {
      ended_by: user.id,
      ended_at: new Date().toISOString(),
      is_active: false,
    });

    const otherId = convo.participants.find((id) => id !== user.id);
    if (otherId) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: otherId,
        type: 'system',
        title: 'Connection ended',
        body: 'Your chat connection has been ended',
        related_id: conversation_id,
        sender_id: user.id,
      });
    }

    return Response.json({ status: 'ended' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}