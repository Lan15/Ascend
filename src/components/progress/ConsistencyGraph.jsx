import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from 'date-fns';
import { TrendingUp } from "lucide-react";

export default function ConsistencyGraph({ routines, goals, completions, theme }) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState('all');
  const [timeframe, setTimeframe] = useState('week');

  const getConsistencyData = () => {
    const now = new Date();
    let intervals = [];
    let formatString = '';

    if (timeframe === 'week') {
      intervals = eachDayOfInterval({ start: subDays(now, 6), end: now });
      formatString = 'EEE';
    } else if (timeframe === 'month') {
      intervals = eachWeekOfInterval({ start: subDays(now, 29), end: now });
      formatString = 'MMM d';
    } else if (timeframe === 'year') {
      intervals = eachMonthOfInterval({ start: subDays(now, 364), end: now });
      formatString = 'MMM';
    }

    return intervals.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let dayCompletions;

      if (timeframe === 'week') {
        dayCompletions = completions.filter(c => c.completion_date === dateStr);
      } else if (timeframe === 'month') {
        const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
        const weekEnd = format(subDays(startOfWeek(date), -6), 'yyyy-MM-dd');
        dayCompletions = completions.filter(c => 
          c.completion_date >= weekStart && c.completion_date <= weekEnd
        );
      } else {
        const monthStr = format(date, 'yyyy-MM');
        dayCompletions = completions.filter(c => 
          format(new Date(c.completion_date), 'yyyy-MM') === monthStr
        );
      }

      // Filter by selected item
      if (selectedType === 'routine' && selectedItemId !== 'all') {
        dayCompletions = dayCompletions.filter(c => c.routine_id === selectedItemId);
      } else if (selectedType === 'goal' && selectedItemId !== 'all') {
        dayCompletions = dayCompletions.filter(c => c.goal_id === selectedItemId);
      } else if (selectedType === 'routine') {
        dayCompletions = dayCompletions.filter(c => c.routine_id);
      } else if (selectedType === 'goal') {
        dayCompletions = dayCompletions.filter(c => c.goal_id);
      }

      return {
        date: format(date, formatString),
        completions: dayCompletions.length,
        consistency: dayCompletions.length > 0 ? 100 : 0
      };
    });
  };

  const consistencyData = getConsistencyData();
  const avgConsistency = Math.round(
    consistencyData.reduce((sum, d) => sum + d.consistency, 0) / consistencyData.length
  );

  const items = selectedType === 'routine' ? routines : selectedType === 'goal' ? goals : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Consistency Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={selectedType} onValueChange={(val) => {
            setSelectedType(val);
            setSelectedItemId('all');
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="routine">Routines</SelectItem>
              <SelectItem value="goal">Goals</SelectItem>
            </SelectContent>
          </Select>

          {(selectedType === 'routine' || selectedType === 'goal') && (
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="flex-1 min-w-[200px]">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {selectedType === 'routine' ? 'Routines' : 'Goals'}</SelectItem>
                {items.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`p-4 rounded-lg bg-gradient-to-r ${theme?.from || 'from-purple-500'} ${theme?.to || 'to-pink-500'} text-white`}>
          <p className="text-sm opacity-90">Average Consistency</p>
          <p className="text-3xl font-bold">{avgConsistency}%</p>
          <p className="text-xs opacity-80 mt-1">
            {consistencyData.filter(d => d.completions > 0).length} / {consistencyData.length} {
              timeframe === 'week' ? 'days' : timeframe === 'month' ? 'weeks' : 'months'
            } active
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={consistencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke={theme?.bg?.includes('purple') ? '#8b5cf6' : 
                     theme?.bg?.includes('blue') ? '#3b82f6' : 
                     theme?.bg?.includes('green') ? '#10b981' : 
                     theme?.bg?.includes('orange') ? '#f97316' : 
                     theme?.bg?.includes('pink') ? '#ec4899' : 
                     theme?.bg?.includes('red') ? '#ef4444' : 
                     theme?.bg?.includes('teal') ? '#14b8a6' : 
                     theme?.bg?.includes('indigo') ? '#6366f1' : '#8b5cf6'} 
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}