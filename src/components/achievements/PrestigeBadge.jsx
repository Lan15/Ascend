import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Swords, Crown, Star, Zap, Flame } from "lucide-react";

const prestigeLevels = {
  bronze: { name: 'Bronze', color: 'from-orange-400 to-orange-600', icon: Shield, glow: 'shadow-orange-500/50' },
  silver: { name: 'Silver', color: 'from-gray-300 to-gray-500', icon: Swords, glow: 'shadow-gray-500/50' },
  gold: { name: 'Gold', color: 'from-yellow-400 to-yellow-600', icon: Star, glow: 'shadow-yellow-500/50' },
  platinum: { name: 'Platinum', color: 'from-cyan-400 to-blue-600', icon: Crown, glow: 'shadow-blue-500/50' },
  diamond: { name: 'Diamond', color: 'from-purple-400 via-pink-500 to-blue-500', icon: Zap, glow: 'shadow-purple-500/50' }
};

export default function PrestigeBadge({ level = 'bronze', size = 'md', rank = 1, animated = true }) {
  const prestige = prestigeLevels[level] || prestigeLevels.bronze;
  const Icon = prestige.icon;
  
  const sizes = {
    sm: { container: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-32 h-32', icon: 'w-12 h-12', text: 'text-sm' },
    lg: { container: 'w-40 h-40', icon: 'w-16 h-16', text: 'text-base' }
  };

  const sizeClass = sizes[size];

  return (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="relative flex flex-col items-center"
    >
      {/* Badge Container */}
      <div className={`${sizeClass.container} relative`}>
        {/* Glow Effect */}
        <motion.div
          animate={animated ? {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${prestige.color} blur-xl ${prestige.glow}`}
        />
        
        {/* Badge */}
        <div className={`relative ${sizeClass.container} rounded-full bg-gradient-to-br ${prestige.color} flex items-center justify-center shadow-2xl border-4 border-white`}>
          {/* Shine Effect */}
          <motion.div
            animate={animated ? {
              rotate: [0, 360]
            } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)'
            }}
          />
          
          {/* Icon */}
          <Icon className={`${sizeClass.icon} text-white z-10`} />
          
          {/* Rank Number */}
          {rank && (
            <div className="absolute bottom-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {rank}
            </div>
          )}
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-2 text-center">
        <p className={`font-bold ${sizeClass.text} bg-gradient-to-r ${prestige.color} bg-clip-text text-transparent`}>
          {prestige.name}
        </p>
      </div>
    </motion.div>
  );
}