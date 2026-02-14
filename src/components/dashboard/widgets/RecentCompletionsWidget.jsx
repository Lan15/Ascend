import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function RecentCompletionsWidget({ completions, routines, goals }) {
  const recentCompletions = completions.slice(0, 5);

  const getItemTitle = (completion) => {
    if (completion.routine_id) {
      const routine = routines.find(r => r.id === completion.routine_id);
      return routine?.title || 'Unknown Routine';
    }
    if (completion.goal_id) {
      const goal = goals.find(g => g.id === completion.goal_id);
      return goal?.title || 'Unknown Goal';
    }
    return 'Activity';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Recent Completions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentCompletions.length === 0 ? (
            <p className="text-sm text-gray-500">No completions yet</p>
          ) : (
            recentCompletions.map((completion, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{getItemTitle(completion)}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {format(new Date(completion.completion_date), 'MMM d')}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}