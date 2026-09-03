import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { format, startOfWeek } from 'npm:date-fns';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

    // Get this week's completions
    const completions = await base44.entities.CompletionLog.filter({
      created_by: user.email
    });

    const weeklyCompletions = completions.filter(c => c.completion_date >= weekStart);
    const weeklyXP = weeklyCompletions.length * 10;

    // Check if entry exists
    const existing = await base44.entities.Leaderboard.filter({
      week_start: weekStart,
      user_email: user.email
    });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.Leaderboard.update(existing[0].id, {
        weekly_xp: weeklyXP,
        weekly_completions: weeklyCompletions.length,
        user_name: user.full_name || user.email
      });
    } else {
      await base44.asServiceRole.entities.Leaderboard.create({
        week_start: weekStart,
        user_email: user.email,
        user_name: user.full_name || user.email,
        weekly_xp: weeklyXP,
        weekly_completions: weeklyCompletions.length
      });
    }

    return Response.json({ success: true, weeklyXP, weeklyCompletions: weeklyCompletions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});