import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AchievementsWidget({ achievements }) {
  const recentAchievements = achievements.slice(0, 3);
  
  const badgeColors = {
    bronze: 'text-orange-700',
    silver: 'text-gray-500',
    gold: 'text-yellow-500',
    platinum: 'text-blue-400',
    diamond: 'text-purple-500'
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentAchievements.length === 0 ? (
            <p className="text-sm text-gray-500">No achievements yet</p>
          ) : (
            recentAchievements.map(achievement => (
              <div key={achievement.id} className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${badgeColors[achievement.badge]}`} />
                <span className="text-sm truncate">{achievement.title}</span>
              </div>
            ))
          )}
          <div className="text-2xl font-bold text-gray-900 mt-3">
            {achievements.length} <span className="text-sm font-normal text-gray-500">earned</span>
          </div>
          <Link to="/Achievements" className="text-xs text-blue-600 hover:underline block">
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}