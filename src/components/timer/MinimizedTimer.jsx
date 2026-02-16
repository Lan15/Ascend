import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MinimizedTimer({ 
  seconds, 
  isRunning, 
  onPause, 
  onComplete, 
  onMaximize, 
  targetMinutes,
  itemTitle,
  onTimerTick
}) {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = targetMinutes ? Math.min((seconds / (targetMinutes * 60)) * 100, 100) : 0;
  const remainingSeconds = targetMinutes ? Math.max(0, (targetMinutes * 60) - seconds) : 0;

  React.useEffect(() => {
    if (!isRunning || !onTimerTick) return;
    
    const interval = setInterval(() => {
      onTimerTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimerTick]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl p-3 w-72">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onMaximize}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
            <div className="text-xs opacity-90 truncate mb-1">{itemTitle}</div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">{formatTime(seconds)}</span>
              {targetMinutes && (
                <span className="text-xs opacity-75">
                  / {formatTime(targetMinutes * 60)}
                </span>
              )}
            </div>
            {targetMinutes && (
              <div className="mt-1 bg-white/20 rounded-full h-1">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onPause}
              className="text-white hover:bg-white/20 h-8 px-2 text-xs"
            >
              {isRunning ? '⏸' : '▶'}
            </Button>
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-white text-purple-600 hover:bg-white/90 h-8 px-3 text-xs"
            >
              ✓ Done
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}