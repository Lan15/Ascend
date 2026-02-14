import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Brain, TrendingUp, MapPin, Clock, Lightbulb, Send, Loader2 } from "lucide-react";
import { format, subDays } from 'date-fns';
import { toast } from "sonner";
import Mascot from "../components/shared/Mascot";

export default function AICoach() {
  const [insights, setInsights] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [gettingSuggestion, setGettingSuggestion] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions'],
    queryFn: () => base44.entities.CompletionLog.list('-created_date', 100)
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const askAICoach = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setGettingSuggestion(true);
    setAiResponse(null);

    try {
      // Prepare context about user's data
      const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
      const recentCompletions = completions.filter(c => last7Days.includes(c.completion_date));
      const activeDays = last7Days.filter(day => completions.some(c => c.completion_date === day)).length;

      const context = {
        user_stats: {
          total_xp: user?.total_xp || 0,
          current_streak: user?.current_streak || 0,
          longest_streak: user?.longest_streak || 0,
          active_days_last_week: activeDays
        },
        routines: routines.map(r => ({
          title: r.title,
          category: r.category,
          target_duration: r.target_duration_minutes
        })),
        goals: goals.map(g => ({
          title: g.title,
          category: g.category,
          completed: g.completed
        })),
        recent_completions: recentCompletions.length,
        total_achievements: achievements.length
      };

      const prompt = `You are an expert habit coach and personal development advisor. Based on the user's data and question, provide actionable, personalized advice.

User Question: ${question}

User Context:
- Current streak: ${context.user_stats.current_streak} days
- Active days (last week): ${context.user_stats.active_days_last_week}/7
- Total XP: ${context.user_stats.total_xp}
- Active routines: ${context.routines.length}
- Goals: ${context.goals.length} (${context.goals.filter(g => g.completed).length} completed)
- Recent completions: ${context.recent_completions}
- Achievements: ${context.total_achievements}

Routines: ${JSON.stringify(context.routines, null, 2)}
Goals: ${JSON.stringify(context.goals, null, 2)}

Provide a concise, actionable response (2-3 paragraphs max) with specific suggestions based on their data.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAiResponse(response);
      setQuestion('');
    } catch (error) {
      console.error('AI Coach error:', error);
      toast.error('Failed to get AI suggestion');
    } finally {
      setGettingSuggestion(false);
    }
  };

  const analyzePatterns = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const newInsights = [];

      // Analyze completion times
      const completionsByHour = {};
      completions.forEach(c => {
        const hour = new Date(c.created_date).getHours();
        completionsByHour[hour] = (completionsByHour[hour] || 0) + 1;
      });
      
      const peakHour = Object.entries(completionsByHour).sort((a, b) => b[1] - a[1])[0];
      if (peakHour) {
        const hour = parseInt(peakHour[0]);
        const timeStr = hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
        newInsights.push({
          type: 'energy_peak',
          icon: Clock,
          title: 'Peak Performance Time',
          message: `Your energy peaks at ${timeStr}—schedule important tasks then!`,
          action: 'Schedule high-priority routines'
        });
      }

      // Analyze consistency
      const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
      const activeDays = last7Days.filter(day => completions.some(c => c.completion_date === day)).length;
      
      if (activeDays < 3) {
        newInsights.push({
          type: 'low_streak',
          icon: TrendingUp,
          title: 'Build Consistency',
          message: 'Low streak detected. Try starting with 5-minute routines to build momentum!',
          action: 'Start small routine'
        });
      }

      // Suggest habit bundles
      const hasWorkout = routines.some(r => r.category === 'fitness');
      const hasJournal = routines.some(r => r.category === 'mindfulness');
      
      if (hasWorkout && !hasJournal) {
        newInsights.push({
          type: 'habit_bundle',
          icon: Lightbulb,
          title: 'Recommended Habit Bundle',
          message: 'Fitness + Journal = Better sleep! Add a 5-min reflection after workouts.',
          action: 'Add journal routine'
        });
      }

      // Location-based suggestion (mock)
      newInsights.push({
        type: 'location',
        icon: MapPin,
        title: 'Location Reminder',
        message: 'Near gym? Perfect time to log your workout!',
        action: 'Log workout now'
      });

      setInsights(newInsights);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Mascot pageContext="coach" />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Coach 🧠
          </h1>
          <p className="text-gray-600 mt-2">Personalized insights powered by your patterns</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Ask Your AI Coach</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Ask anything... e.g., 'How can I build better morning routines?' or 'Why am I losing my streak?'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askAICoach();
                  }
                }}
              />
              <div className="flex gap-3">
                <Button
                  onClick={askAICoach}
                  disabled={gettingSuggestion}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  {gettingSuggestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Get Suggestion
                    </>
                  )}
                </Button>
                <Button
                  onClick={analyzePatterns}
                  disabled={analyzing}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {analyzing ? 'Analyzing...' : 'Auto-Analyze Patterns'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {aiResponse && (
          <Card className="mb-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="w-5 h-5" />
                AI Coach Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className="border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{insight.title}</h3>
                      <p className="text-gray-600 mb-4">{insight.message}</p>
                      <Button size="sm" variant="outline">
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {insights.length === 0 && !analyzing && (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Click "Analyze Now" to get personalized insights!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}