import React from 'react';
import { Award, Zap, Target, TrendingUp, Star } from "lucide-react";

export default function AchievementBadge({ achievement, size = "md" }) {
  const badgeColors = {
    bronze: "from-orange-400 to-orange-600",
    silver: "from-gray-300 to-gray-500",
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-cyan-400 to-blue-600",
    diamond: "from-purple-400 to-pink-600"
  };

  const icons = {
    streak: TrendingUp,
    completion: Target,
    time_based: Zap,
    milestone: Star,
    consistency: Award
  };

  const Icon = icons[achievement.type] || Award;
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${badgeColors[achievement.badge]} flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform relative`}>
        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse" />
        <Icon className="w-1/2 h-1/2 text-white" />
      </div>
      <div className="text-center">
        <p className="font-bold text-sm">{achievement.title}</p>
        <p className="text-xs text-gray-500 capitalize">{achievement.badge}</p>
      </div>
    </div>
  );
}