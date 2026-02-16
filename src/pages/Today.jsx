import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Circle, Timer, Trophy, Sparkles, Music, Pause } from "lucide-react";
import { format, differenceInDays, startOfDay } from 'date-fns';
import { toast } from "sonner";
import ActivityTimer from "../components/timer/ActivityTimer";
import MinimizedTimer from "../components/timer/MinimizedTimer";
import StreakSaverDialog from "../components/shared/StreakSaverDialog";
import Mascot from "../components/shared/Mascot";
import { getTheme } from "../components/shared/themeColors";
import ConfettiEffect from "../components/shared/ConfettiEffect";

export default function Today() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(() => {
    const saved = localStorage.getItem('timerState');
    return saved ? JSON.parse(saved).selectedItem : null;
  });
  const [showTimer, setShowTimer] = useState(() => {
    const saved = localStorage.getItem('timerState');
    return saved ? JSON.parse(saved).showTimer : false;
  });
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('timerState');
    return saved ? JSON.parse(saved).isMinimized : false;
  });
  const [timerSeconds, setTimerSeconds] = useState(() => {
    const saved = localStorage.getItem('timerState');
    if (!saved) return 0;
    
    const state = JSON.parse(saved);
    const lastUpdate = parseInt(localStorage.getItem('lastTimerUpdate') || Date.now().toString());
    
    // If timer was running, calculate elapsed time since last update
    if (state.isTimerRunning) {
      const elapsed = Math.floor((Date.now() - lastUpdate) / 1000);
      return state.timerSeconds + elapsed;
    }
    
    return state.timerSeconds;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    const saved = localStorage.getItem('timerState');
    return saved ? JSON.parse(saved).isTimerRunning : true;
  });
  const [learning, setLearning] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showStreakSaver, setShowStreakSaver] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');

  // Persist timer state
  useEffect(() => {
    if (showTimer) {
      localStorage.setItem('timerState', JSON.stringify({
        selectedItem,
        showTimer,
        isMinimized,
        timerSeconds,
        isTimerRunning
      }));
    } else {
      localStorage.removeItem('timerState');
    }
  }, [selectedItem, showTimer, isMinimized, timerSeconds, isTimerRunning]);

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

  // Check for streak break and offer gem save
  useEffect(() => {
    const checkStreakBreak = async () => {
      if (user?.current_streak > 0 && user?.last_activity_date) {
        const lastActivity = startOfDay(new Date(user.last_activity_date));
        const today = startOfDay(new Date());
        const daysSince = differenceInDays(today, lastActivity);
        
        // If more than 1 day has passed, offer to save streak
        if (daysSince > 1 && user.gems >= 50 && todayCompletions.length === 0) {
          setShowStreakSaver(true);
        }
      }
    };
    
    checkStreakBreak();
  }, [user, todayCompletions]);

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

      // Calculate streak
      const allCompletions = await base44.entities.CompletionLog.list('-completion_date', 365);
      const uniqueDates = [...new Set(allCompletions.map(c => c.completion_date))].sort().reverse();
      
      let streak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      for (const dateStr of uniqueDates) {
        const completionDate = new Date(dateStr);
        completionDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((checkDate - completionDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      }

      // Award XP
      const xpGained = type === 'routine' ? 10 : 50;
      const gemsGained = 2;
      await base44.auth.updateMe({
        total_xp: (user?.total_xp || 0) + xpGained,
        gems: (user?.gems || 0) + gemsGained,
        current_streak: streak
      });

      if (type === 'goal') {
        await base44.entities.Goal.update(item.id, {
          completed: true,
          completed_date: new Date().toISOString()
        });
      }

      // Update backend calculations
      if (type === 'routine') {
        base44.functions.invoke('updateHabitStrength', { routineId: item.id }).catch(e => console.error(e));
      }
      base44.functions.invoke('updateLeaderboard', {}).catch(e => console.error(e));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions']);
      queryClient.invalidateQueries(['goals']);
      queryClient.invalidateQueries(['currentUser']);
      const xp = selectedItem?.type === 'routine' ? 10 : 50;
      setSelectedItem(null);
      setShowTimer(false);
      setTimerSeconds(0);
      setIsMinimized(false);
      setLearning('');
      setNotes('');
      localStorage.removeItem('timerState');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success(`Great job! +${xp} XP +2 💎 | Music paused`);
    }
  });

  const isCompleted = (item, type) => {
    return todayCompletions.some(c => 
      type === 'routine' ? c.routine_id === item.id : c.goal_id === item.id
    );
  };

  const handleComplete = (item, type) => {
    // For completion-only items, complete immediately without timer
    if (item.tracking_type === 'completion_only') {
      completeMutation.mutate({
        item,
        timeSpent: 0,
        type
      });
    } else {
      setSelectedItem({ item, type });
      setShowTimer(true);
    }
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
    setIsMinimized(false);
    setShowTimer(false);
    setTimerSeconds(0);
    localStorage.removeItem('timerState');
    completeMutation.mutate({
      item: selectedItem.item,
      timeSpent,
      type: selectedItem.type
    });
  };

  const handleSaveStreak = async () => {
    try {
      await base44.auth.updateMe({
        gems: (user?.gems || 0) - 50,
        last_activity_date: format(new Date(), 'yyyy-MM-dd')
      });
      queryClient.invalidateQueries(['currentUser']);
      setShowStreakSaver(false);
      toast.success(`🔥 Streak saved! ${user?.current_streak} days maintained.`);
    } catch (error) {
      toast.error('Failed to save streak');
    }
  };

  const handleDialogOpenChange = (open) => {
    if (!open && showTimer && timerSeconds > 0) {
      // Minimize instead of closing
      setIsMinimized(true);
    } else {
      setShowTimer(false);
      setIsMinimized(false);
    }
  };

  const handleMinimizedPause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleMinimizedComplete = () => {
    const minutes = Math.floor(timerSeconds / 60);
    handleTimerComplete(minutes);
  };

  const routineProgress = routines.length > 0 
    ? Math.min(100, Math.round((todayCompletions.filter(c => c.routine_id).length / routines.length) * 100))
    : 0;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Mascot pageContext="today" user={user} />
        <ConfettiEffect trigger={showConfetti} />
        
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${getTheme(user?.theme_primary).from600} ${getTheme(user?.theme_primary).to600} bg-clip-text text-transparent`} style={{
              WebkitTextStroke: '0.5px rgba(255,255,255,0.4)',
              paintOrder: 'stroke fill'
            }}>
              Today's Quest <span className="text-4xl" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.4)', paintOrder: 'stroke fill' }}>🎯</span>
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
        <Card className={`mb-8 bg-gradient-to-r ${getTheme(user?.theme_primary).from} ${getTheme(user?.theme_primary).to} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Daily Progress</span>
              <span className="text-2xl font-bold">{routineProgress}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, routineProgress)}%` }}
              />
            </div>
            <p className="text-sm mt-2 opacity-90">
              {Math.min(todayCompletions.filter(c => c.routine_id).length, routines.length)} of {routines.length} routines completed
            </p>
          </CardContent>
        </Card>

        {/* Daily Routines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${getTheme(user?.theme_primary).bg.replace('bg-', 'text-')}`} />
              Daily Routines <span className="text-xl">🌟</span>
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
                      {routine.tracking_type === 'time_tracked' && routine.target_duration_minutes && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Timer className="w-3 h-3" />
                          Target: {routine.target_duration_minutes} minutes
                        </p>
                      )}
                      {routine.tracking_type === 'completion_only' && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Mark as complete
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
        <Dialog open={showTimer && !isMinimized} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Complete: {selectedItem?.item.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <ActivityTimer 
                onComplete={handleTimerComplete}
                targetMinutes={selectedItem?.item.target_duration_minutes}
                initialSeconds={timerSeconds}
                initialRunning={isTimerRunning}
                onTimerUpdate={(seconds, running) => {
                  setTimerSeconds(seconds);
                  setIsTimerRunning(running);
                }}
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

        {/* Minimized Timer */}
        {showTimer && isMinimized && selectedItem && (
          <MinimizedTimer
            seconds={timerSeconds}
            isRunning={isTimerRunning}
            targetMinutes={selectedItem.item.target_duration_minutes}
            itemTitle={selectedItem.item.title}
            onPause={handleMinimizedPause}
            onComplete={handleMinimizedComplete}
            onMaximize={() => setIsMinimized(false)}
            theme={getTheme(user?.theme_primary)}
            onTimerTick={() => {
              setTimerSeconds(prev => prev + 1);
              localStorage.setItem('timerSeconds', (timerSeconds + 1).toString());
              localStorage.setItem('lastTimerUpdate', Date.now().toString());
            }}
          />
        )}

        {/* Streak Saver Dialog */}
        <StreakSaverDialog
          open={showStreakSaver}
          onClose={() => setShowStreakSaver(false)}
          onConfirm={handleSaveStreak}
          streakDays={user?.current_streak || 0}
          gemCost={50}
        />
      </div>
    </div>
  );
}