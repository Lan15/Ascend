import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, TrendingUp, MapPin, Clock, Lightbulb } from "lucide-react";
import { format, subDays } from 'date-fns';
import Mascot from "../components/shared/Mascot";

export default function AICoach() {
  const [insights, setInsights] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Get Personalized Insights</h3>
                <p className="text-sm opacity-90">
                  Our AI analyzes your patterns to suggest optimal times, habit bundles, and more
                </p>
              </div>
              <Button
                onClick={analyzePatterns}
                disabled={analyzing}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Brain className="w-4 h-4 mr-2" />
                {analyzing ? 'Analyzing...' : 'Analyze Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

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