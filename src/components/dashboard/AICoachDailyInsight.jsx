import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { getTheme } from '@/components/shared/themeColors';

const ClocalMascot = () => {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Clock face */}
      <motion.circle
        cx="32"
        cy="32"
        r="22"
        fill="white"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="32" cy="32" r="20" fill="white" />
      <circle cx="32" cy="32" r="18" stroke="#E5E7EB" strokeWidth="1" fill="white" />

      {/* Clock numbers */}
      <text x="32" y="18" textAnchor="middle" fontSize="6" fill="#6B7280" fontWeight="bold">12</text>
      <text x="44" y="35" textAnchor="middle" fontSize="6" fill="#6B7280" fontWeight="bold">3</text>
      <text x="32" y="48" textAnchor="middle" fontSize="6" fill="#6B7280" fontWeight="bold">6</text>
      <text x="20" y="35" textAnchor="middle" fontSize="6" fill="#6B7280" fontWeight="bold">9</text>

      {/* Clock hands */}
      <g>
        <motion.line
          x1="32" y1="32" x2="32" y2="22"
          stroke="#1F2937" strokeWidth="2" strokeLinecap="round"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '32px 32px' }}
        />
        <motion.line
          x1="32" y1="32" x2="32" y2="18"
          stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '32px 32px' }}
        />
        <circle cx="32" cy="32" r="2" fill="#1F2937" />
      </g>

      {/* Calendar pages */}
      <motion.g animate={{ y: [0, -3, 0], rotate: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="8" y="10" width="12" height="14" fill="white" stroke="#3B82F6" strokeWidth="1" rx="1" />
        <rect x="8" y="10" width="12" height="3" fill="#3B82F6" />
        <text x="14" y="18" textAnchor="middle" fontSize="6" fill="#1F2937" fontWeight="bold">15</text>
      </motion.g>

      <motion.g animate={{ y: [0, 3, 0], rotate: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
        <rect x="44" y="42" width="12" height="14" fill="white" stroke="#10B981" strokeWidth="1" rx="1" />
        <rect x="44" y="42" width="12" height="3" fill="#10B981" />
        <text x="50" y="50" textAnchor="middle" fontSize="6" fill="#1F2937" fontWeight="bold">28</text>
      </motion.g>

      {/* Smiley face */}
      <circle cx="28" cy="28" r="1.5" fill="#1F2937" />
      <circle cx="36" cy="28" r="1.5" fill="#1F2937" />
      <motion.path 
        d="M27 36 Q32 39 37 36" 
        stroke="#1F2937" 
        strokeWidth="1.5" 
        fill="none"
        animate={{ d: ["M27 36 Q32 39 37 36", "M27 36 Q32 37 37 36", "M27 36 Q32 39 37 36"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
};

export default function AICoachDailyInsight({ user, completions = [], routines = [], goals = [] }) {
  const [show, setShow] = useState(false);
  const [currentPost, setCurrentPost] = useState(0);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = getTheme(user?.theme_primary || 'purple');

  const posts = [
    { 
      title: 'Suggestions', 
      icon: Lightbulb,
      type: 'suggestions',
      color: 'text-yellow-500'
    },
    { 
      title: 'Improvements', 
      icon: TrendingUp,
      type: 'improvements',
      color: 'text-blue-500'
    },
    { 
      title: 'Possibilities', 
      icon: Sparkles,
      type: 'possibilities',
      color: 'text-purple-500'
    }
  ];

  useEffect(() => {
    const checkAndShow = async () => {
      const lastShown = localStorage.getItem('aiCoachLastShown');
      const today = new Date().toDateString();

      if (lastShown !== today) {
        // Generate insights
        await generateInsights();
        setShow(true);
        localStorage.setItem('aiCoachLastShown', today);
      } else {
        setLoading(false);
      }
    };

    checkAndShow();
  }, []);

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setCurrentPost((prev) => (prev + 1) % 3);
    }, 8000); // Auto-advance every 8 seconds

    return () => clearInterval(timer);
  }, [show]);

  const generateInsights = async () => {
    try {
      // Calculate stats
      const last7Days = completions.filter(c => {
        const date = new Date(c.completion_date);
        const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      });

      const activeRoutines = routines.filter(r => r.active).length;
      const activeGoals = goals.filter(g => !g.completed && !g.is_lost).length;
      const completionRate = last7Days.length / 7;

      const prompt = `Based on this user's progress data, provide personalized coaching insights:
- Active routines: ${activeRoutines}
- Active goals: ${activeGoals}
- Weekly completions: ${last7Days.length}
- Completion rate: ${(completionRate * 100).toFixed(0)}%

Generate exactly 3 insights in JSON format:
{
  "suggestions": "A specific, actionable suggestion to help them improve (2-3 sentences)",
  "improvements": "An area where they can improve based on their data (2-3 sentences)",
  "possibilities": "An exciting new possibility or challenge they could explore (2-3 sentences)"
}

Make it motivational, specific, and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "string" },
            improvements: { type: "string" },
            possibilities: { type: "string" }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Fallback insights
      setInsights({
        suggestions: "Keep building your daily habits! Consistency is key to long-term success.",
        improvements: "Try tracking your time spent on activities to identify areas for optimization.",
        possibilities: "Consider adding a new challenge to push yourself beyond your comfort zone!"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  const handlePrev = () => {
    setCurrentPost((prev) => (prev - 1 + 3) % 3);
  };

  const handleNext = () => {
    setCurrentPost((prev) => (prev + 1) % 3);
  };

  if (!show || loading) return null;

  const currentPostData = posts[currentPost];
  const Icon = currentPostData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl"
        >
          <Card className="relative overflow-hidden">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Header */}
            <div className={`bg-gradient-to-r ${theme.from} ${theme.to} p-6 text-white`}>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16">
                  <ClocalMascot />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">CloCal's Daily Insight</h2>
                  <p className="text-white/80 text-sm">Your personal productivity companion</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPost}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className={`w-8 h-8 ${currentPostData.color}`} />
                    <h3 className="text-2xl font-bold">{currentPostData.title}</h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {insights?.[currentPostData.type]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="border-t p-4 flex items-center justify-between">
              <div className="flex gap-2">
                {posts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPost(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentPost === index 
                        ? `${theme.bg} w-8` 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}