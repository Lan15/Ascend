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

const PencilMascot = ({ activity = 'writing' }) => {
  const currentActivity = pencilActivities.find(a => a.id === activity) || pencilActivities[0];
  
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Pencil Body */}
      <motion.g
        animate={{ 
          rotate: activity === 'gym' ? [0, -5, 5, 0] : [0, 2, -2, 0],
          y: activity === 'gym' ? [0, -2, 0] : 0
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Wood body */}
        <path d="M32 8 L24 52 L40 52 L32 8 Z" fill="#FCD34D" />
        <path d="M32 8 L28 52 L32 52 Z" fill="#FBBF24" />
        
        {/* Eraser */}
        <rect x="28" y="52" width="8" height="6" fill="#F87171" rx="1" />
        <rect x="28" y="52" width="4" height="6" fill="#EF4444" rx="1" />
        
        {/* Metal ferrule */}
        <rect x="27" y="50" width="10" height="3" fill="#9CA3AF" />
        <rect x="27" y="50" width="5" height="3" fill="#6B7280" />
        
        {/* Pencil tip */}
        <path d="M32 8 L26 16 L38 16 Z" fill="#92400E" />
        <path d="M32 8 L29 16 L32 16 Z" fill="#78350F" />
        
        {/* Lead point */}
        <path d="M32 2 L30 8 L34 8 Z" fill="#1F2937" />
        
        {/* Face */}
        <circle cx="28" cy="30" r="1.5" fill="#1F2937" />
        <circle cx="36" cy="30" r="1.5" fill="#1F2937" />
        
        {/* Happy smile */}
        <motion.path 
          d="M28 36 Q32 40 36 36" 
          stroke="#1F2937" 
          strokeWidth="1.5" 
          fill="none"
          animate={{ d: ["M28 36 Q32 40 36 36", "M28 36 Q32 38 36 36", "M28 36 Q32 40 36 36"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Blinking animation */}
        <motion.g
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <ellipse cx="28" cy="30" rx="2" ry="1" fill="#1F2937" opacity="0.3" />
          <ellipse cx="36" cy="30" rx="2" ry="1" fill="#1F2937" opacity="0.3" />
        </motion.g>
      </motion.g>
      
      {/* Activity overlay */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentActivity.svg}
      </motion.g>
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
                  <PencilMascot activity={activity} />
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