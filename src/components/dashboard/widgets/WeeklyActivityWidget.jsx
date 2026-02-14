import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function WeeklyActivityWidget({ completions }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE'),
      count: 0
    };
  });

  completions.forEach(c => {
    const day = last7Days.find(d => d.date === c.completion_date);
    if (day) day.count++;
  });

  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          Weekly Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-1 h-32">
          {last7Days.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '20%' : '4px' }}
              />
              <span className="text-xs text-gray-500">{day.label}</span>
              <span className="text-xs font-semibold text-gray-700">{day.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}