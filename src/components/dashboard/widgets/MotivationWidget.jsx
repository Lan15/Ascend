import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';

const quotes = [
  "Small steps every day lead to big changes.",
  "Consistency beats perfection every time.",
  "Your only limit is you.",
  "Progress, not perfection.",
  "The best time to start was yesterday. The next best time is now.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "Discipline is choosing between what you want now and what you want most."
];

export default function MotivationWidget() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <Card className="h-full bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Daily Motivation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 italic leading-relaxed">
          "{quote}"
        </p>
      </CardContent>
    </Card>
  );
}