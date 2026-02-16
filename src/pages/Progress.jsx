import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Clock, Award, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import StatsCard from "../components/dashboard/StatsCard";
import ConsistencyGraph from "../components/progress/ConsistencyGraph";
import { getTheme } from "../components/shared/themeColors";

export default function Progress() {
  const [timeframe, setTimeframe] = useState('week');

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions'],
    queryFn: () => base44.entities.CompletionLog.list('-created_date', 500)
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Calculate consistency score
  const calculateConsistency = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      return completions.some(c => c.completion_date === date);
    });
    return Math.round((last30Days.filter(Boolean).length / 30) * 100);
  };

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const hasCompletion = completions.some(c => c.completion_date === dateStr);
      if (hasCompletion) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else if (i === 0) {
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Get time-based data
  const getTimeframeData = () => {
    const now = new Date();
    let intervals = [];
    let formatString = '';

    if (timeframe === 'week') {
      intervals = eachDayOfInterval({ start: subDays(now, 6), end: now });
      formatString = 'EEE';
    } else if (timeframe === 'month') {
      intervals = eachDayOfInterval({ start: subDays(now, 29), end: now });
      formatString = 'MMM d';
    } else if (timeframe === 'year') {
      intervals = eachMonthOfInterval({ start: subDays(now, 364), end: now });
      formatString = 'MMM';
    }

    return intervals.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions.filter(c => {
        if (timeframe === 'year') {
          return format(new Date(c.completion_date), 'yyyy-MM') === format(date, 'yyyy-MM');
        }
        return c.completion_date === dateStr;
      });
      
      return {
        date: format(date, formatString),
        completions: dayCompletions.length,
        timeSpent: dayCompletions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0)
      };
    });
  };

  // Category breakdown
  const getCategoryData = () => {
    const categoryMap = {};
    completions.forEach(completion => {
      const routine = routines.find(r => r.id === completion.routine_id);
      const goal = goals.find(g => g.id === completion.goal_id);
      const category = routine?.category || goal?.category || 'other';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  const timeframeData = getTimeframeData();
  const categoryData = getCategoryData();
  const consistency = calculateConsistency();
  const streak = calculateStreak();
  const totalTime = completions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0);
  const completedGoals = goals.filter(g => g.completed).length;

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${getTheme(user?.theme_primary).from600} ${getTheme(user?.theme_primary).to600} bg-clip-text text-transparent`} style={{
            WebkitTextStroke: '0.5px rgba(255,255,255,0.4)',
            paintOrder: 'stroke fill'
          }}>
            Progress Analytics <span className="text-4xl">📊</span>
          </h1>
          <p className="text-gray-600 mt-2">Track your journey and improvements</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Consistency Score"
            value={`${consistency}%`}
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard
            title="Current Streak"
            value={`${streak} days`}
            icon={Award}
            color="orange"
          />
          <StatsCard
            title="Total Time"
            value={`${Math.floor(totalTime / 60)}h ${totalTime % 60}m`}
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Goals Completed"
            value={completedGoals}
            icon={Target}
            color="green"
          />
        </div>

        <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Completions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeframeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time Spent Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Time Invested (minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeframeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="timeSpent" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </Tabs>

        {/* Consistency Tracker */}
        <div className="mb-8">
          <ConsistencyGraph 
            routines={routines}
            goals={goals}
            completions={completions}
            theme={getTheme(user?.theme_primary)}
          />
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={300} className="lg:w-1/2">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 lg:w-1/2">
                {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium capitalize">{cat.name}</span>
                    </div>
                    <span className="text-gray-600">{cat.value} completions</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}