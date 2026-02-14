import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, Target, Clock, Star } from "lucide-react";
import { format } from 'date-fns';

export default function Challenges() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true })
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['challengeProgress'],
    queryFn: () => base44.entities.ChallengeProgress.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const getChallengeProgress = (challengeId) => {
    return progress.find(p => p.challenge_id === challengeId) || { current_progress: 0, completed: false };
  };

  const challengeIcons = {
    streak: Star,
    completion_count: Target,
    time_based: Clock,
    category_specific: Zap
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Active Challenges 🏆
          </h1>
          <p className="text-gray-600 mt-2">Complete challenges to earn bonus rewards!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(challenge => {
            const Icon = challengeIcons[challenge.type];
            const userProgress = getChallengeProgress(challenge.id);
            const progressPercent = (userProgress.current_progress / challenge.target_value) * 100;
            const isCompleted = userProgress.completed;

            return (
              <Card key={challenge.id} className={isCompleted ? "border-2 border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-orange-600" />
                        {challenge.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                    {isCompleted && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ✓ Done
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-bold">{userProgress.current_progress}/{challenge.target_value}</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">+{challenge.reward_xp} XP</span>
                      </div>
                      {challenge.reward_gems > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xl">💎</span>
                          <span className="font-bold">+{challenge.reward_gems}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ends {format(new Date(challenge.end_date), 'MMM d')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {challenges.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No active challenges. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}