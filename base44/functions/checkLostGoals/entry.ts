import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all time-bounded, incomplete, non-lost goals
    const goals = await base44.asServiceRole.entities.Goal.filter({
      is_time_bounded: true,
      completed: false,
      is_lost: false
    });

    const now = new Date();
    const lostGoals = [];

    for (const goal of goals) {
      if (goal.time_bound_date) {
        const timeBound = new Date(goal.time_bound_date);
        if (now > timeBound) {
          // Mark goal as lost
          await base44.asServiceRole.entities.Goal.update(goal.id, {
            is_lost: true,
            lost_date: now.toISOString()
          });
          lostGoals.push(goal);
        }
      }
    }

    return Response.json({
      message: `Checked ${goals.length} goals, marked ${lostGoals.length} as lost`,
      lostGoals: lostGoals.map(g => ({ id: g.id, title: g.title }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});