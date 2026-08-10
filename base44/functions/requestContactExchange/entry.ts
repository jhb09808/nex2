import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversation_id, contact_method, contact_value } = await req.json();
    if (!conversation_id || !contact_method || !contact_value?.trim()) {
      return Response.json({ error: 'conversation_id, contact_method, and contact_value required' }, { status: 400 });
    }

    const convo = await base44.asServiceRole.entities.Conversation.get(conversation_id);
    if (!convo) return Response.json({ error: 'Conversation not found' }, { status: 404 });
    if (!convo.participants?.includes(user.id)) {
      return Response.json({ error: 'Not a participant' }, { status: 403 });
    }

    if (convo.contact_exchange_status === 'pending') {
      return Response.json({ error: 'A contact exchange is already pending' }, { status: 400 });
    }
    if (convo.contact_exchange_status === 'accepted') {
      return Response.json({ error: 'Contact info already exchanged' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Conversation.update(conversation_id, {
      contact_exchange_requested_by: user.id,
      contact_exchange_status: 'pending',
      requester_contact_method: contact_method,
      requester_contact_value: contact_value.trim(),
    });

    const otherId = convo.participants.find((id) => id !== user.id);
    if (otherId) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: otherId,
        type: 'system',
        title: 'Contact request',
        body: 'Someone wants to share their contact info with you',
        related_id: conversation_id,
        sender_id: user.id,
      });
    }

    return Response.json({ status: 'pending' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}