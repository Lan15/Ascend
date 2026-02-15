import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function MiniCalendar({ completions = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before month starts
  const emptyCells = Array(firstDayOfWeek).fill(null);

  const hasCompletion = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return completions.some(c => c.completion_date === dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            Calendar
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {format(currentMonth, 'MMMM yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square" />
          ))}
          
          {daysInMonth.map((date, idx) => {
            const isToday = isSameDay(date, today);
            const hasActivity = hasCompletion(date);
            
            return (
              <Link
                key={idx}
                to={isToday ? '/Today' : '#'}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                  isToday
                    ? 'bg-purple-600 text-white font-bold cursor-pointer hover:bg-purple-700'
                    : hasActivity
                    ? 'bg-green-100 text-green-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!isToday ? 'pointer-events-none' : ''}`}
              >
                {format(date, 'd')}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-600" />
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100" />
            <span className="text-gray-600">Activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}