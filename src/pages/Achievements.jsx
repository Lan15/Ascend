import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star } from "lucide-react";
import { format } from 'date-fns';
import AchievementBadge from "../components/achievements/AchievementBadge";

export default function Achievements() {
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list('-earned_date')
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions'],
    queryFn: () => base44.entities.CompletionLog.list()
  });

  // Calculate level based on total completions
  const calculateLevel = () => {
    const total = completions.length;
    return Math.floor(total / 10) + 1;
  };

  const level = calculateLevel();
  const currentLevelProgress = completions.length % 10;
  const progressToNextLevel = (currentLevelProgress / 10) * 100;

  const badgeTypes = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const achievementsByBadge = badgeTypes.map(badge => ({
    badge,
    count: achievements.filter(a => a.badge === badge).length
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Achievements & Medals 🏆
          </h1>
          <p className="text-gray-600 mt-2">Your journey to greatness</p>
        </div>

        {/* Level Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">Level {level}</h2>
                <p className="opacity-90">Keep crushing it!</p>
              </div>
              <Trophy className="w-16 h-16 opacity-80" />
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{currentLevelProgress}/10 completions</span>
                <span>Next: Level {level + 1}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {achievementsByBadge.map(({ badge, count }) => {
            const colors = {
              bronze: "from-orange-400 to-orange-600",
              silver: "from-gray-300 to-gray-500",
              gold: "from-yellow-400 to-yellow-600",
              platinum: "from-cyan-400 to-blue-600",
              diamond: "from-purple-400 to-pink-600"
            };

            return (
              <Card key={badge} className="text-center">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${colors[badge]} flex items-center justify-center`}>
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{badge}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              All Achievements ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No achievements yet. Keep completing tasks to earn your first medal!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="text-center">
                    <AchievementBadge achievement={achievement} size="lg" />
                    <p className="text-sm text-gray-600 mt-3">{achievement.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Types Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                Streak Medals
              </h3>
              <p className="text-sm text-gray-600">
                Earned by maintaining consecutive days of activity. The longer your streak, the better the medal!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600" />
                Completion Medals
              </h3>
              <p className="text-sm text-gray-600">
                Awarded for hitting completion milestones. Complete more tasks to unlock higher tiers!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Time-Based Medals
              </h3>
              <p className="text-sm text-gray-600">
                Earned by meeting or exceeding time targets on your goals and routines.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}