import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function CalendarWidget({ completions }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasCompletion = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return completions.some(c => c.completion_date === dateStr);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          {format(today, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-xs text-gray-500 text-center font-semibold">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, idx) => (
            <div
              key={idx}
              className={`text-xs text-center py-1 rounded ${
                hasCompletion(day)
                  ? 'bg-green-500 text-white font-bold'
                  : isToday(day)
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700'
              }`}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}