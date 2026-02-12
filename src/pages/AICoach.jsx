import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { format, subDays } from 'date-fns';

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI productivity coach. I can help you with:\n\n- Analyzing your progress and patterns\n- Suggesting improvements to your routines\n- Providing motivation and accountability tips\n- Helping you set realistic goals\n\nWhat would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions'],
    queryFn: () => base44.entities.CompletionLog.list('-created_date', 100)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextData = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    
    const recentCompletions = completions.filter(c => last7Days.includes(c.completion_date));
    const todayCompletions = completions.filter(c => c.completion_date === today);
    
    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (completions.some(c => c.completion_date === dateStr)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else if (i === 0) {
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return {
      totalRoutines: routines.length,
      activeRoutines: routines.filter(r => r.active).length,
      totalGoals: goals.length,
      activeGoals: goals.filter(g => !g.completed).length,
      completedGoals: goals.filter(g => g.completed).length,
      todayCompletions: todayCompletions.length,
      last7DaysCompletions: recentCompletions.length,
      currentStreak: streak,
      totalCompletions: completions.length,
      recentLearnings: completions.filter(c => c.learning).slice(0, 5).map(c => c.learning)
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const contextData = getContextData();
      
      const prompt = `You are a productivity and habit-building coach. The user is tracking their daily routines and goals in a gamified productivity app.

Here's their current data:
- Active routines: ${contextData.activeRoutines} out of ${contextData.totalRoutines}
- Active goals: ${contextData.activeGoals}, Completed: ${contextData.completedGoals}
- Today's completions: ${contextData.todayCompletions}
- Completions in last 7 days: ${contextData.last7DaysCompletions}
- Current streak: ${contextData.currentStreak} days
- Total completions: ${contextData.totalCompletions}

Recent learnings they've captured:
${contextData.recentLearnings.join('\n')}

User's question: ${userMessage}

Provide helpful, encouraging, and actionable advice. Be specific and reference their data when relevant. Keep responses concise but valuable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-cyan-600" />
            AI Productivity Coach
          </h1>
          <p className="text-gray-600 mt-2">Get personalized suggestions and insights</p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => (
              <div 
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask for suggestions, motivation, or insights..."
                rows={2}
                className="resize-none"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            onClick={() => {
              setInput("How can I improve my consistency?");
            }}
          >
            <span className="font-semibold mb-1">💪 Improve Consistency</span>
            <span className="text-xs text-gray-500">Get tips on staying consistent</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            onClick={() => {
              setInput("Analyze my progress this week");
            }}
          >
            <span className="font-semibold mb-1">📈 Progress Analysis</span>
            <span className="text-xs text-gray-500">Review your recent performance</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            onClick={() => {
              setInput("Suggest new routines for me");
            }}
          >
            <span className="font-semibold mb-1">✨ Routine Ideas</span>
            <span className="text-xs text-gray-500">Get personalized suggestions</span>
          </Button>
        </div>
      </div>
    </div>
  );
}