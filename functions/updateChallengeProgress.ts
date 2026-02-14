import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId } = await req.json();

    // Get challenge details
    const challenge = await base44.entities.Challenge.filter({ id: challengeId });
    if (challenge.length === 0) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const challengeData = challenge[0];

    // Calculate progress based on challenge type
    let currentProgress = 0;

    if (challengeData.type === 'completion_count') {
      const completions = await base44.entities.CompletionLog.filter({
        created_by: user.email
      });
      const recentCompletions = completions.filter(c => 
        c.completion_date >= challengeData.start_date && c.completion_date <= challengeData.end_date
      );
      currentProgress = recentCompletions.length;
    }

    if (challengeData.type === 'time_based') {
      const completions = await base44.entities.CompletionLog.filter({
        created_by: user.email
      });
      const recentCompletions = completions.filter(c => 
        c.completion_date >= challengeData.start_date && c.completion_date <= challengeData.end_date
      );
      currentProgress = recentCompletions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0);
    }

    const completed = currentProgress >= challengeData.target_value;

    // Update or create progress
    const existing = await base44.entities.ChallengeProgress.filter({
      challenge_id: challengeId,
      user_email: user.email
    });

    const progressData = {
      challenge_id: challengeId,
      user_email: user.email,
      current_progress: currentProgress,
      completed: completed,
      completed_date: completed ? new Date().toISOString() : null
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.ChallengeProgress.update(existing[0].id, progressData);
    } else {
      await base44.asServiceRole.entities.ChallengeProgress.create(progressData);
    }

    // Award rewards if completed
    if (completed && existing.length === 0) {
      await base44.auth.updateMe({
        total_xp: (user.total_xp || 0) + challengeData.reward_xp,
        gems: (user.gems || 0) + (challengeData.reward_gems || 0)
      });
    }

    return Response.json({ 
      success: true, 
      currentProgress, 
      completed,
      rewarded: completed && existing.length === 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});