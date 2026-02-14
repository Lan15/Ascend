import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Star, TrendingUp, Award } from 'lucide-react';
import { Card } from "@/components/ui/card";

const mascotMessages = [
  { type: 'tip', icon: Lightbulb, message: "Did you know? Consistency is more important than perfection. Small daily actions lead to big results!" },
  { type: 'motivation', icon: Star, message: "You're doing amazing! Every step forward counts, no matter how small." },
  { type: 'achievement', icon: Award, message: "Congratulations on your progress! Your dedication is truly inspiring." },
  { type: 'wisdom', icon: TrendingUp, message: "The secret to success: Start small, stay consistent, and never give up!" },
  { type: 'tip', icon: Lightbulb, message: "Pro tip: Break big goals into smaller tasks. It makes them less overwhelming and more achievable!" },
  { type: 'motivation', icon: Star, message: "Remember: Progress, not perfection. You're building lasting habits!" },
  { type: 'wisdom', icon: TrendingUp, message: "Discipline is choosing between what you want now and what you want most." }
];

// Pencil mascot activities
const pencilActivities = [
  { id: 'writing', svg: (
    <g>
      <rect x="18" y="30" width="24" height="16" fill="#FCD34D" rx="2" />
      <rect x="22" y="32" width="16" height="2" fill="#92400E" />
      <rect x="22" y="36" width="12" height="2" fill="#92400E" />
      <rect x="22" y="40" width="14" height="2" fill="#92400E" />
    </g>
  )},
  { id: 'gym', svg: (
    <g>
      <rect x="14" y="36" width="4" height="16" fill="#6B7280" rx="1" />
      <rect x="42" y="36" width="4" height="16" fill="#6B7280" rx="1" />
      <rect x="18" y="42" width="24" height="4" fill="#6B7280" rx="1" />
      <circle cx="12" cy="44" r="4" fill="#374151" />
      <circle cx="48" cy="44" r="4" fill="#374151" />
    </g>
  )},
  { id: 'music', svg: (
    <g>
      <ellipse cx="24" cy="46" rx="6" ry="4" fill="#8B5CF6" />
      <rect x="23" y="32" width="2" height="14" fill="#8B5CF6" />
      <path d="M25 32 L34 30 L34 44 L25 46 Z" fill="#A78BFA" />
      <ellipse cx="34" cy="44" rx="6" ry="4" fill="#8B5CF6" />
    </g>
  )},
  { id: 'thinking', svg: (
    <g>
      <circle cx="28" cy="24" r="3" fill="#E5E7EB" opacity="0.6" />
      <circle cx="36" cy="20" r="4" fill="#E5E7EB" opacity="0.8" />
      <circle cx="42" cy="16" r="5" fill="#E5E7EB" />
    </g>
  )},
  { id: 'reading', svg: (
    <g>
      <path d="M30 36 L30 48 L22 44 L22 32 Z" fill="#EC4899" />
      <path d="M30 36 L30 48 L38 44 L38 32 Z" fill="#F472B6" />
      <line x1="30" y1="36" x2="30" y2="48" stroke="#BE185D" strokeWidth="1" />
    </g>
  )}
];

const ClockCalendarMascot = ({ activity = 'time' }) => {
        return (
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            {/* Clock face */}
            <motion.circle
              cx="32"
              cy="32"
              r="22"
              fill="#3B82F6"
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
            <motion.line
              x1="32"
              y1="32"
              x2="32"
              y2="22"
              stroke="#1F2937"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '32px 32px' }}
            />
            <motion.line
              x1="32"
              y1="32"
              x2="32"
              y2="18"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ rotate: [0, 30] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '32px 32px' }}
            />
            <circle cx="32" cy="32" r="2" fill="#1F2937" />

            {/* Calendar pages floating around */}
            <motion.g
              animate={{ 
                y: [0, -3, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <rect x="8" y="10" width="12" height="14" fill="white" stroke="#3B82F6" strokeWidth="1" rx="1" />
              <rect x="8" y="10" width="12" height="3" fill="#3B82F6" />
              <text x="14" y="18" textAnchor="middle" fontSize="6" fill="#1F2937" fontWeight="bold">15</text>
            </motion.g>

            <motion.g
              animate={{ 
                y: [0, 3, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <rect x="44" y="42" width="12" height="14" fill="white" stroke="#10B981" strokeWidth="1" rx="1" />
              <rect x="44" y="42" width="12" height="3" fill="#10B981" />
              <text x="50" y="50" textAnchor="middle" fontSize="6" fill="#1F2937" fontWeight="bold">28</text>
            </motion.g>

            {/* Smiley face on clock */}
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

export default function Mascot({ pageContext }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [activity, setActivity] = useState('writing');

  useEffect(() => {
    // Determine activity based on page context
    const activityMap = {
      'today': 'writing',
      'routines': 'gym',
      'goals': 'thinking',
      'progress': 'reading',
      'dashboard': 'music'
    };
    setActivity(activityMap[pageContext] || 'writing');

    const shouldShow = Math.random() > 0.7;
    if (shouldShow) {
      const randomMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
      setCurrentMessage(randomMessage);
      setIsVisible(true);
    }

    const timer = setTimeout(() => {
      if (!isVisible) {
        const randomMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
        setCurrentMessage(randomMessage);
        setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [pageContext]);

  if (!currentMessage) return null;

  const Icon = currentMessage.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 max-w-sm"
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 shadow-2xl">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex gap-3">
              {/* Mascot Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <ClockCalendarMascot activity={activity} />
                </div>
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">
                  {currentMessage.message}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}