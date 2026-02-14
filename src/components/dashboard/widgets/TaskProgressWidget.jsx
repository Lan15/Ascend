import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function TaskProgressWidget({ completions, routines, goals }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCompletions = completions.filter(c => c.completion_date === today);
  
  const routineCompletionsToday = todayCompletions.filter(c => c.routine_id).length;
  const goalCompletionsToday = todayCompletions.filter(c => c.goal_id).length;
  
  const activeRoutines = routines.filter(r => r.active).length;
  
  // Count active goals shown on Today page (not completed, not sub-goals, not long-term)
  const activeGoals = goals.filter(g => !g.completed && !g.parent_goal_id && !g.is_long_term).length;

  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const weeklyCompletions = completions.filter(c => last7Days.includes(c.completion_date)).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-500" />
          Task Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                Routines: {routineCompletionsToday}/{activeRoutines}
              </div>
              <p className="text-xs text-gray-500">completed today</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                Goals: {goalCompletionsToday}/{activeGoals}
              </div>
              <p className="text-xs text-gray-500">completed today</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="text-lg font-semibold text-gray-700">
              {weeklyCompletions}
            </div>
            <p className="text-xs text-gray-500">this week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}