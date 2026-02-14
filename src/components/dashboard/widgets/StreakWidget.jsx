import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from 'lucide-react';

export default function StreakWidget({ user }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-orange-500">
          {user?.current_streak || 0}
          <span className="text-sm text-gray-500 ml-2">days</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Best: {user?.longest_streak || 0} days
        </p>
      </CardContent>
    </Card>
  );
}