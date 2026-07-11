import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiver_id, message } = await req.json();
    if (!receiver_id) return Response.json({ error: 'receiver_id required' }, { status: 400 });

    // Prevent waving yourself
    if (receiver_id === user.id) {
      return Response.json({ error: 'Cannot wave at yourself' }, { status: 400 });
    }

    // Get sender profile
    const senderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    if (senderProfiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const sender = senderProfiles[0];

    // Block: cannot wave if you're blocked by receiver, or if you blocked them
    const receiverProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: receiver_id });
    if (receiverProfiles.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const receiver = receiverProfiles[0];

    if (receiver.blocked_users?.includes(user.id) || sender.blocked_users?.includes(receiver_id)) {
      return Response.json({ error: 'Cannot send wave' }, { status: 403 });
    }

    // Rate limit: max 10 waves in first 24h (account age)
    const accountAgeHours = (Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60);
    if (accountAgeHours < 24) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentWaves = await base44.asServiceRole.entities.Wave.filter({
        sender_id: user.id,
      });
      const recentCount = recentWaves.filter((w) => new Date(w.created_date) > new Date(oneDayAgo)).length;
      if (recentCount >= 10) {
        return Response.json({
          error: 'Daily wave limit reached. New accounts can send up to 10 waves in their first 24 hours.',
          limit: 10,
        }, { status: 429 });
      }
    }

    // Check for existing wave
    const existingWaves = await base44.asServiceRole.entities.Wave.filter({ sender_id: user.id });
    const alreadyWaved = existingWaves.find(
      (w) => w.receiver_id === receiver_id && (w.status === 'pending' || w.status === 'accepted')
    );
    if (alreadyWaved) {
      return Response.json({
        wave: alreadyWaved,
        message: 'You already have a pending wave with this user',
      });
    }

    // Check if the other person already waved us → mutual match → auto-accept
    const incomingWaves = await base44.asServiceRole.entities.Wave.filter({ receiver_id: user.id });
    const mutualWave = incomingWaves.find(
      (w) => w.sender_id === receiver_id && w.status === 'pending'
    );

    if (mutualWave) {
      // Create conversation
      const convo = await base44.asServiceRole.entities.Conversation.create({
        participants: [user.id, receiver_id],
        last_message: '',
        is_active: true,
      });
      // Update both waves to accepted
      await base44.asServiceRole.entities.Wave.update(mutualWave.id, {
        status: 'accepted',
        conversation_id: convo.id,
      });
      // Create the outgoing wave as accepted too
      const newWave = await base44.asServiceRole.entities.Wave.create({
        sender_id: user.id,
        receiver_id: receiver_id,
        status: 'accepted',
        message: message || '',
        conversation_id: convo.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Increment connection count for both users on mutual match
      await base44.asServiceRole.entities.UserProfile.updateMany(
        { created_by_id: user.id },
        { $inc: { connections_count: 1 } }
      );
      await base44.asServiceRole.entities.UserProfile.updateMany(
        { created_by_id: receiver_id },
        { $inc: { connections_count: 1 } }
      );

      return Response.json({
        wave: newWave,
        mutual_match: true,
        conversation_id: convo.id,
      });
    }

    // Create pending wave (expires in 24h)
    const newWave = await base44.asServiceRole.entities.Wave.create({
      sender_id: user.id,
      receiver_id: receiver_id,
      status: 'pending',
      message: message || '',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Notify the receiver that someone wants to connect
    await base44.asServiceRole.entities.Notification.create({
      user_id: receiver_id,
      type: 'match',
      title: 'New chat request',
      body: `${sender.username || 'Someone nearby'} wants to connect with you`,
      related_id: newWave.id,
      sender_id: user.id,
    });

    return Response.json({ wave: newWave, mutual_match: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});