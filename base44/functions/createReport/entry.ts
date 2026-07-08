import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const HIGH_SEVERITY_REASONS = ['stalking', 'underage_suspicion', 'threat'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { reported_user_id, reason, description, conversation_id } = await req.json();

    if (!reported_user_id || !reason) {
      return Response.json({ error: 'reported_user_id and reason required' }, { status: 400 });
    }

    const isHighSeverity = HIGH_SEVERITY_REASONS.includes(reason);
    const requiresManualReview = isHighSeverity;

    const report = await base44.asServiceRole.entities.Report.create({
      reporter_id: user.id,
      reported_user_id,
      reason,
      description: description || '',
      status: 'pending',
      is_high_severity: isHighSeverity,
      requires_manual_review: requiresManualReview,
      conversation_id: conversation_id || null,
    });

    // If underage suspicion, flag the reported user for re-verification
    if (reason === 'underage_suspicion') {
      const reportedProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: reported_user_id });
      if (reportedProfiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(reportedProfiles[0].id, {
          requires_reverification: true,
        });
      }
    }

    return Response.json({ report, routed_to_manual_review: requiresManualReview });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});