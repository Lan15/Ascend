import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function EnhancedStreakCard({ currentStreak, longestStreak = 0 }) {
  const maxFlames = 7;
  const flameCount = Math.min(currentStreak, maxFlames);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-10 rounded-full transform translate-x-12 -translate-y-12" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Current Streak</p>
            <p className="text-4xl font-bold mt-2">{currentStreak}</p>
            <p className="text-sm text-gray-600 mt-1">
              {currentStreak === 0 ? "Start your journey!" : `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'} 🔥`}
            </p>
          </div>
          <div className="p-3 bg-orange-500 bg-opacity-20 rounded-xl">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        {/* Flame Bar */}
        <div className="mb-3">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: maxFlames }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: i < flameCount ? 1 : 0.3 }}
                transition={{ delay: i * 0.1 }}
                className={`flex-1 h-2 rounded-full ${
                  i < flameCount ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {currentStreak > 0 ? "🔥 Keep the fire burning!" : "Complete a task to start your streak"}
          </p>
        </div>

        {/* Longest Streak */}
        {longestStreak > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t">
            <TrendingUp className="w-4 h-4" />
            <span>Longest streak: <strong>{longestStreak} days</strong></span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}