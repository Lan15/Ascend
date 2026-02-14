import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Circle, Timer, Trophy, Sparkles, Music, Pause } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "sonner";
import ActivityTimer from "../components/timer/ActivityTimer";
import Mascot from "../components/shared/Mascot";
import ConfettiEffect from "../components/shared/ConfettiEffect";

export default function Today() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [learning, setLearning] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.filter({ active: true })
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.filter({ completed: false })
  });

  const { data: todayCompletions = [] } = useQuery({
    queryKey: ['completions', today],
    queryFn: () => base44.entities.CompletionLog.filter({ completion_date: today })
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const completeMutation = useMutation({
    mutationFn: async ({ item, timeSpent, type }) => {
      // Auto-pause Spotify when completing
      if (user?.spotify_connected && musicPlaying) {
        try {
          await base44.functions.invoke('spotifyAuth', { action: 'pause' });
          setMusicPlaying(false);
        } catch (error) {
          console.error('Failed to pause music:', error);
        }
      }

      await base44.entities.CompletionLog.create({
        routine_id: type === 'routine' ? item.id : undefined,
        goal_id: type === 'goal' ? item.id : undefined,
        completion_date: today,
        time_spent_minutes: timeSpent,
        learning: learning,
        notes: notes
      });

      // Award XP
      const xpGained = type === 'routine' ? 10 : 50;
      const gemsGained = 2;
      await base44.auth.updateMe({
        total_xp: (user?.total_xp || 0) + xpGained,
        gems: (user?.gems || 0) + gemsGained
      });

      if (type === 'goal') {
        await base44.entities.Goal.update(item.id, {
          completed: true,
          completed_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions']);
      queryClient.invalidateQueries(['goals']);
      queryClient.invalidateQueries(['currentUser']);
      setSelectedItem(null);
      setShowTimer(false);
      setLearning('');
      setNotes('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      const xp = selectedItem?.type === 'routine' ? 10 : 50;
      toast.success(`Great job! +${xp} XP +2 💎 | Music paused`);
    }
  });

  const isCompleted = (item, type) => {
    return todayCompletions.some(c => 
      type === 'routine' ? c.routine_id === item.id : c.goal_id === item.id
    );
  };

  const handleComplete = (item, type) => {
    setSelectedItem({ item, type });
    setShowTimer(true);
  };

  const handlePlayMusic = async () => {
    try {
      if (musicPlaying) {
        await base44.functions.invoke('spotifyAuth', { action: 'pause' });
        setMusicPlaying(false);
        toast.success('Music paused');
      } else {
        await base44.functions.invoke('spotifyAuth', { action: 'play' });
        setMusicPlaying(true);
        toast.success('Music playing');
      }
    } catch (error) {
      toast.error('Failed to control music. Make sure Spotify is open on your device.');
    }
  };

  const handleTimerComplete = (timeSpent) => {
    completeMutation.mutate({
      item: selectedItem.item,
      timeSpent,
      type: selectedItem.type
    });
  };

  const routineProgress = routines.length > 0 
    ? Math.round((todayCompletions.filter(c => c.routine_id).length / routines.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Mascot pageContext="today" />
        <ConfettiEffect trigger={showConfetti} />
        
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Today's Quest 🎯
            </h1>
            <p className="text-gray-600 mt-2">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          
          {user?.spotify_connected && (
            <Button
              onClick={handlePlayMusic}
              variant="outline"
              className="gap-2"
            >
              {musicPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Music
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  Play Music
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Daily Progress</span>
              <span className="text-2xl font-bold">{routineProgress}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${routineProgress}%` }}
              />
            </div>
            <p className="text-sm mt-2 opacity-90">
              {todayCompletions.filter(c => c.routine_id).length} of {routines.length} routines completed
            </p>
          </CardContent>
        </Card>

        {/* Daily Routines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Daily Routines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {routines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No routines yet. Create your first routine!</p>
            ) : (
              routines.map(routine => {
                const completed = isCompleted(routine, 'routine');
                return (
                  <div 
                    key={routine.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => !completed && handleComplete(routine, 'routine')}
                      disabled={completed}
                      className={completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}
                    >
                      {completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </Button>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold ${completed ? 'line-through text-gray-500' : ''}`}>
                        {routine.title}
                      </h3>
                      {routine.description && (
                        <p className="text-sm text-gray-500">{routine.description}</p>
                      )}
                      {routine.target_duration_minutes && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Timer className="w-3 h-3" />
                          Target: {routine.target_duration_minutes} minutes
                        </p>
                      )}
                    </div>

                    {completed && (
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        {goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.map(goal => (
                <div 
                  key={goal.id}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 bg-white border-gray-200 hover:border-purple-300 transition-all"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleComplete(goal, 'goal')}
                    className="text-gray-400 hover:text-purple-600"
                  >
                    <Circle className="w-6 h-6" />
                  </Button>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-500">{goal.description}</p>
                    )}
                    {goal.deadline && (
                      <p className="text-xs text-gray-400 mt-1">
                        Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Timer Dialog */}
        <Dialog open={showTimer} onOpenChange={setShowTimer}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Complete: {selectedItem?.item.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <ActivityTimer 
                onComplete={handleTimerComplete}
                targetMinutes={selectedItem?.item.target_duration_minutes}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">What did you learn?</label>
                <Textarea
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="Share your insights and learnings..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}