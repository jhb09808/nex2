import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversation_id, accept, responder_contact_method, responder_contact_value } = await req.json();
    if (!conversation_id) {
      return Response.json({ error: 'conversation_id required' }, { status: 400 });
    }

    const convo = await base44.asServiceRole.entities.Conversation.get(conversation_id);
    if (!convo) return Response.json({ error: 'Conversation not found' }, { status: 404 });
    if (!convo.participants?.includes(user.id)) {
      return Response.json({ error: 'Not a participant' }, { status: 403 });
    }

    if (convo.contact_exchange_status !== 'pending') {
      return Response.json({ error: 'No pending contact exchange' }, { status: 400 });
    }

    if (convo.contact_exchange_requested_by === user.id) {
      return Response.json({ error: 'Cannot respond to your own request' }, { status: 400 });
    }

    if (accept) {
      const updateData = {
        contact_exchange_status: 'accepted',
      };
      if (responder_contact_method && responder_contact_value?.trim()) {
        updateData.responder_contact_method = responder_contact_method;
        updateData.responder_contact_value = responder_contact_value.trim();
      }
      await base44.asServiceRole.entities.Conversation.update(conversation_id, updateData);
      return Response.json({ status: 'accepted' });
    } else {
      await base44.asServiceRole.entities.Conversation.update(conversation_id, {
        contact_exchange_status: 'declined',
        requester_contact_method: null,
        requester_contact_value: null,
      });
      return Response.json({ status: 'declined' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}