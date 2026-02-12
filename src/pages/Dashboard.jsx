import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import StatsCard from "../components/dashboard/StatsCard";
import AchievementBadge from "../components/achievements/AchievementBadge";
import { Target, Flame, Trophy, Clock, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export default function Dashboard() {
  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.filter({ active: true })
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions'],
    queryFn: () => base44.entities.CompletionLog.list('-created_date', 100)
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list('-earned_date', 5)
  });

  // Calculate stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCompletions = completions.filter(c => c.completion_date === today);
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

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
        // Check yesterday if today has no completions
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Weekly completion chart data
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = completions.filter(c => c.completion_date === dateStr).length;
      data.push({
        day: format(date, 'EEE'),
        completions: count
      });
    }
    return data;
  };

  const weeklyData = getLast7DaysData();
  const totalTimeSpent = completions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome Back, Champion! 🎮
          </h1>
          <p className="text-gray-600 mt-2">Let's level up your productivity today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Current Streak"
            value={`${streak} days`}
            icon={Flame}
            color="orange"
            trend={streak > 0 ? "up" : "down"}
            trendValue={streak > 0 ? "Keep it up!" : "Start today"}
          />
          <StatsCard
            title="Today's Progress"
            value={`${todayCompletions.length}/${routines.length}`}
            icon={Target}
            color="green"
          />
          <StatsCard
            title="Active Goals"
            value={activeGoals.length}
            icon={Zap}
            color="purple"
          />
          <StatsCard
            title="Achievements"
            value={achievements.length}
            icon={Trophy}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Progress Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Last 7 Days Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/Today">
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">
                  <Target className="w-4 h-4 mr-2" />
                  Complete Today's Tasks
                </Button>
              </Link>
              <Link to="/AICoach">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Get AI Suggestions
                </Button>
              </Link>
              <Link to="/Progress">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
                <Link to="/Achievements">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {achievements.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} size="md" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m</p>
              <p className="text-sm opacity-90">Total Time Invested</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{completedGoals.length}</p>
              <p className="text-sm opacity-90">Goals Achieved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <Flame className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{completions.length}</p>
              <p className="text-sm opacity-90">Total Completions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}