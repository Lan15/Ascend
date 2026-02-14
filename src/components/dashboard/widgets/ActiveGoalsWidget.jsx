import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ActiveGoalsWidget({ goals }) {
  const activeGoals = goals.filter(g => !g.completed).slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeGoals.length === 0 ? (
            <p className="text-sm text-gray-500">No active goals</p>
          ) : (
            activeGoals.map(goal => (
              <div key={goal.id} className="border-l-2 border-blue-500 pl-2">
                <p className="text-sm font-medium truncate">{goal.title}</p>
                {goal.deadline && (
                  <p className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {format(new Date(goal.deadline), 'MMM d')}
                  </p>
                )}
              </div>
            ))
          )}
          <Link to="/Goals" className="text-xs text-blue-600 hover:underline block mt-2">
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}