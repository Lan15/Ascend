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

export default function Mascot({ pageContext }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  useEffect(() => {
    // Show mascot randomly or on specific triggers
    const shouldShow = Math.random() > 0.7; // 30% chance on page load
    if (shouldShow) {
      const randomMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
      setCurrentMessage(randomMessage);
      setIsVisible(true);
    }

    // Also show after 5 seconds of being on the page
    const timer = setTimeout(() => {
      if (!isVisible) {
        const randomMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
        setCurrentMessage(randomMessage);
        setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className="w-8 h-8 text-purple-600" />
                  </motion.div>
                  {/* Eyes */}
                  <div className="absolute top-3 left-4 flex gap-1">
                    <motion.div 
                      className="w-1.5 h-1.5 bg-gray-800 rounded-full"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-1.5 h-1.5 bg-gray-800 rounded-full"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
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