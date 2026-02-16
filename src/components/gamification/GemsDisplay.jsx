import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Shield, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { differenceInDays, startOfDay } from 'date-fns';

export default function GemsDisplay({ gems = 0, streakFreezes = 0, onUseFreeze, user }) {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const saveStreakMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      await base44.auth.updateMe({
        gems: (user?.gems || 0) - 50,
        last_activity_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success(`🔥 Streak saved! ${user?.current_streak} days maintained.`);
      setShowConfirm(false);
    },
    onError: () => {
      toast.error('Failed to save streak');
    }
  });

  const checkStreakBreak = () => {
    if (!user?.last_activity_date || !user?.current_streak) return false;
    const lastActivity = startOfDay(new Date(user.last_activity_date));
    const today = startOfDay(new Date());
    const daysSince = differenceInDays(today, lastActivity);
    return daysSince > 1;
  };

  const isStreakAtRisk = checkStreakBreak();
  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gem className="w-8 h-8 text-cyan-600" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-600">Your Gems</p>
              <p className="text-3xl font-bold text-cyan-600">{gems}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-xl">{streakFreezes}</span>
            </div>
            <p className="text-xs text-gray-500">Streak Freezes</p>
          </div>
        </div>

        <div className="space-y-2">
          {isStreakAtRisk && user?.current_streak > 0 && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-2 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-bold text-orange-900">
                  {user.current_streak}-day streak at risk!
                </span>
              </div>
              {!showConfirm ? (
                <Button 
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={gems < 50}
                >
                  <Gem className="w-4 h-4 mr-2" />
                  Save Streak (50 gems)
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-orange-900">Are you sure? This will cost 50 gems.</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => saveStreakMutation.mutate()}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={saveStreakMutation.isPending}
                    >
                      Yes, Save
                    </Button>
                    <Button 
                      onClick={() => setShowConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 text-center">
            Earn gems by completing routines (+2 💎) and goals (+50 💎)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}