import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Crown, Medal, TrendingUp } from "lucide-react";
import { startOfWeek, format } from 'date-fns';

export default function Leaderboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', weekStart],
    queryFn: async () => {
      const entries = await base44.entities.Leaderboard.filter({ week_start: weekStart });
      return entries.sort((a, b) => b.weekly_xp - a.weekly_xp);
    }
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-600 font-bold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Weekly Leaderboard 🏆
          </h1>
          <p className="text-gray-600 mt-2">Compete with friends this week</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Your Position</p>
                <p className="text-3xl font-bold">
                  #{leaderboard.findIndex(l => l.user_email === user?.email) + 1 || '-'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Weekly XP</p>
                <p className="text-3xl font-bold">
                  {leaderboard.find(l => l.user_email === user?.email)?.weekly_xp || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.user_email === user?.email ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-bold">{entry.user_name}</p>
                      <p className="text-sm text-gray-600">{entry.weekly_completions} completions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.weekly_xp} XP</p>
                    <p className="text-xs text-gray-500">{entry.weekly_streak} day streak</p>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No entries yet. Be the first!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}