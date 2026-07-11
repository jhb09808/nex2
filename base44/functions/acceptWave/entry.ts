import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { wave_id } = await req.json();
    if (!wave_id) return Response.json({ error: 'wave_id required' }, { status: 400 });

    // Fetch the wave
    const wave = await base44.asServiceRole.entities.Wave.get(wave_id);
    if (!wave) return Response.json({ error: 'Wave not found' }, { status: 404 });

    // Only the receiver can accept
    if (wave.receiver_id !== user.id) {
      return Response.json({ error: 'Only the receiver can accept this wave' }, { status: 403 });
    }

    // Already accepted?
    if (wave.status === 'accepted') {
      return Response.json({ conversation_id: wave.conversation_id, already_accepted: true });
    }

    if (wave.status !== 'pending') {
      return Response.json({ error: 'Wave is no longer pending' }, { status: 400 });
    }

    // Create the conversation
    const convo = await base44.asServiceRole.entities.Conversation.create({
      participants: [user.id, wave.sender_id],
      last_message: '',
      is_active: true,
    });

    // Mark the wave as accepted
    await base44.asServiceRole.entities.Wave.update(wave_id, {
      status: 'accepted',
      conversation_id: convo.id,
    });

    // Notify the sender that their wave was accepted
    await base44.asServiceRole.entities.Notification.create({
      user_id: wave.sender_id,
      type: 'message',
      title: 'Chat request accepted!',
      body: 'Your chat request was accepted. Say hello!',
      related_id: convo.id,
      sender_id: user.id,
    });

    return Response.json({ conversation_id: convo.id, wave_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});