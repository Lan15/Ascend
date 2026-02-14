import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { format, subDays } from 'npm:date-fns';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { routineId } = await req.json();

    // Get completions for this routine in last 30 days
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const completions = await base44.entities.CompletionLog.filter({
      routine_id: routineId,
      created_by: user.email
    });

    const recentCompletions = completions.filter(c => c.completion_date >= thirtyDaysAgo);
    const consistencyRate = (recentCompletions.length / 30) * 100;
    const strengthScore = Math.min(100, consistencyRate * 1.2);

    // Calculate longest streak
    const sortedDates = completions.map(c => c.completion_date).sort();
    let longestStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime() === 86400000) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // Update or create habit strength
    const existing = await base44.entities.HabitStrength.filter({ routine_id: routineId });

    const data = {
      routine_id: routineId,
      strength_score: Math.round(strengthScore),
      consistency_rate: Math.round(consistencyRate),
      longest_streak: longestStreak,
      last_completed: completions[0]?.completion_date || null,
      total_completions: completions.length
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.HabitStrength.update(existing[0].id, data);
    } else {
      await base44.asServiceRole.entities.HabitStrength.create(data);
    }

    return Response.json({ success: true, strengthScore: Math.round(strengthScore) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});