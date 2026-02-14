import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";

export default function HabitStrengthWidget() {
  const { data: habitStrengths = [] } = useQuery({
    queryKey: ['habitStrengths'],
    queryFn: () => base44.entities.HabitStrength.list('-strength_score', 3)
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list()
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-orange-500" />
          Habit Strength
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habitStrengths.length === 0 ? (
            <p className="text-sm text-gray-500">No habit data yet</p>
          ) : (
            habitStrengths.map(strength => {
              const routine = routines.find(r => r.id === strength.routine_id);
              return (
                <div key={strength.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{routine?.title || 'Habit'}</span>
                    <span className="font-semibold">{strength.strength_score}/100</span>
                  </div>
                  <Progress value={strength.strength_score} className="h-2" />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}