import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function AIInsightsWidget({ completions, user }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const activeDays = last7Days.filter(day => completions.some(c => c.completion_date === day)).length;

  const getInsight = () => {
    if (activeDays >= 5) {
      return { icon: TrendingUp, message: "Amazing consistency! You're on fire this week!", color: "text-green-600" };
    }
    if (activeDays >= 3) {
      return { icon: Sparkles, message: "Good progress! Try to hit 5 days this week.", color: "text-blue-600" };
    }
    return { icon: Sparkles, message: "Let's build momentum! Start with one small task today.", color: "text-orange-600" };
  };

  const insight = getInsight();
  const Icon = insight.icon;

  return (
    <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          AI Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-1`} />
          <p className="text-sm text-gray-700">{insight.message}</p>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          {activeDays}/7 active days this week
        </div>
      </CardContent>
    </Card>
  );
}