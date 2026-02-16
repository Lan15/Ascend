import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import PrestigeBadge from "../components/achievements/PrestigeBadge";
import ShareProgress from "../components/shared/ShareProgress";
import Mascot from "../components/shared/Mascot";
import { getTheme } from "../components/shared/themeColors";

export default function Achievements() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

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

  const shareStats = {
    streak: 0,
    achievements: achievements.length,
    completions: completions.length,
    timeSpent: 0
  };

  const theme = getTheme(user?.theme_primary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Mascot pageContext="achievements" user={user} />
        
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.from600} ${theme.to600} bg-clip-text text-transparent flex items-center gap-3`}>
                <span>Achievements & Medals</span>
                <span className="text-4xl">🏆</span>
              </h1>
              <p className="text-gray-600 mt-2">Your journey to greatness</p>
            </div>
            <ShareProgress 
              trigger={
                <Button variant="outline" className={`gap-2 border-2 hover:bg-gradient-to-r hover:${theme.from} hover:${theme.to} hover:text-white hover:border-transparent`}>
                  <Share2 className="w-4 h-4" />
                  Share Achievements
                </Button>
              }
              stats={shareStats}
            />
          </div>
        </div>

        {/* Level Card */}
        <Card className={`mb-8 bg-gradient-to-r ${theme.from} ${theme.to} text-white`}>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center border-2 border-dashed">
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Star className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="font-semibold mb-1">First Steps</h4>
                  <p className="text-sm text-gray-500 mb-3">Complete your first routine</p>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">🔒 Locked</span>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-dashed">
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="font-semibold mb-1">On Fire!</h4>
                  <p className="text-sm text-gray-500 mb-3">Maintain a 3-day streak</p>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">🔒 Locked</span>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-dashed">
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="font-semibold mb-1">Goal Getter</h4>
                  <p className="text-sm text-gray-500 mb-3">Complete your first goal</p>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">🔒 Locked</span>
                </CardContent>
              </Card>
            </div>
            
            {achievements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Earned Achievements ({achievements.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {achievements.map((achievement, idx) => (
                    <div key={achievement.id} className="text-center">
                      <PrestigeBadge 
                        level={achievement.badge}
                        size="lg"
                        rank={idx + 1}
                        animated={true}
                      />
                      <p className="font-semibold mt-3">{achievement.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
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