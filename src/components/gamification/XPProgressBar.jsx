import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Star, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function XPProgressBar({ totalXp = 0, compact = false }) {
  // Calculate level and progress (100 XP per level, exponential growth)
  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100));
  };

  const level = calculateLevel(totalXp);
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  const getLevelBadge = () => {
    if (level < 5) return { icon: Zap, color: 'from-gray-400 to-gray-600', name: 'Beginner' };
    if (level < 10) return { icon: Star, color: 'from-blue-400 to-blue-600', name: 'Intermediate' };
    if (level < 20) return { icon: Award, color: 'from-purple-400 to-purple-600', name: 'Advanced' };
    return { icon: Award, color: 'from-yellow-400 to-yellow-600', name: 'Master' };
  };

  const badge = getLevelBadge();
  const Icon = badge.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white font-bold shadow-lg`}>
          {level}
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{totalXp.toLocaleString()} XP</span>
            <span className="text-gray-500">{xpNeededForNextLevel - xpInCurrentLevel} to Lv {level + 1}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.color} flex flex-col items-center justify-center text-white shadow-xl border-4 border-white`}
          >
            <span className="text-2xl font-bold">{level}</span>
            <span className="text-xs opacity-90">Level</span>
          </motion.div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold">{badge.name}</h3>
                <p className="text-sm text-gray-500">{totalXp.toLocaleString()} Total XP</p>
              </div>
              <Icon className={`w-8 h-8 text-transparent bg-gradient-to-br ${badge.color} bg-clip-text`} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{xpInCurrentLevel}/{xpNeededForNextLevel} XP</span>
                <span className="text-gray-500">{xpNeededForNextLevel - xpInCurrentLevel} to Level {level + 1}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-600 border-t pt-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>+10 XP per routine</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span>+50 XP per achievement</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}