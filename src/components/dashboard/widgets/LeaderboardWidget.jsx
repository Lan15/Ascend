import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, TrendingUp } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from 'date-fns';

export default function LeaderboardWidget() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', weekStart],
    queryFn: () => base44.entities.Leaderboard.filter({ week_start: weekStart }, 'rank', 10)
  });

  const myRank = leaderboard.find(l => l.user_email === user?.email);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          Your Rank
        </CardTitle>
      </CardHeader>
      <CardContent>
        {myRank ? (
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">
              #{myRank.rank}
            </div>
            <p className="text-sm text-gray-600 mt-1">This week</p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weekly XP</span>
                <span className="font-semibold">{myRank.weekly_xp}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Completions</span>
                <span className="font-semibold">{myRank.weekly_completions}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">No ranking yet this week</p>
        )}
      </CardContent>
    </Card>
  );
}