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

    if (reported_user_id === user.id) {
      return Response.json({ error: 'You cannot report yourself' }, { status: 400 });
    }

    // One open report per reporter/reported pair — stops queue flooding.
    const openReports = await base44.asServiceRole.entities.Report.filter({
      reporter_id: user.id,
      reported_user_id,
      status: 'pending',
    });
    if (openReports.length > 0) {
      return Response.json({ report: openReports[0], routed_to_manual_review: openReports[0].requires_manual_review, duplicate: true });
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

    // Underage suspicion is high severity → manual review. A moderator decides
    // whether to require re-verification; a report alone never flags the user.

    return Response.json({ report, routed_to_manual_review: requiresManualReview });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});