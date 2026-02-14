import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function XPWidget({ user }) {
  const currentLevel = Math.floor(Math.sqrt((user?.total_xp || 0) / 100));
  const currentLevelXP = currentLevel * currentLevel * 100;
  const nextLevelXP = (currentLevel + 1) * (currentLevel + 1) * 100;
  const progressInLevel = ((user?.total_xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Level & XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-purple-600">
          Level {currentLevel}
        </div>
        <Progress value={progressInLevel} className="mt-2 h-2" />
        <p className="text-xs text-gray-500 mt-1">
          {user?.total_xp || 0} / {nextLevelXP} XP
        </p>
      </CardContent>
    </Card>
  );
}