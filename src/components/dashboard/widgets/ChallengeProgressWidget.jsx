import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";

export default function ChallengeProgressWidget() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true }, '-created_date', 10)
  });

  const { data: challengeProgress = [] } = useQuery({
    queryKey: ['challengeProgress'],
    queryFn: () => base44.entities.ChallengeProgress.filter({ user_email: user?.email, completed: false })
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Active Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {challengeProgress.length === 0 ? (
            <p className="text-sm text-gray-500">No active challenges</p>
          ) : (
            challengeProgress.slice(0, 3).map(progress => {
              const challenge = challenges.find(c => c.id === progress.challenge_id);
              if (!challenge) return null;
              const percentage = (progress.current_progress / challenge.target_value) * 100;
              return (
                <div key={progress.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{challenge.title}</span>
                    <span className="text-xs">{progress.current_progress}/{challenge.target_value}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}