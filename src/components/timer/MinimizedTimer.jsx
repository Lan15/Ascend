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

  const startTimeRef = React.useRef(Date.now());
  const lastTickRef = React.useRef(seconds);

  React.useEffect(() => {
    if (!isRunning || !onTimerTick) return;
    
    startTimeRef.current = Date.now();
    lastTickRef.current = seconds;
    
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const expectedSeconds = lastTickRef.current + elapsedSeconds;
      
      if (expectedSeconds > seconds) {
        onTimerTick();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, onTimerTick, seconds]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 z-50 w-80"
    >
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl border-none">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={onMaximize}
              className="text-white hover:bg-white/20 h-9 w-9 flex-shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate mb-2">{itemTitle}</div>
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 flex-shrink-0" />
                <span className="font-mono font-bold text-2xl">{formatTime(seconds)}</span>
                {targetMinutes && (
                  <span className="text-sm opacity-90">
                    / {formatTime(targetMinutes * 60)}
                  </span>
                )}
              </div>
              {targetMinutes && (
                <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={onPause}
                className="text-white hover:bg-white/20 h-9 w-9 p-0"
              >
                <span className="text-xl">{isRunning ? '⏸' : '▶'}</span>
              </Button>
              <Button
                size="sm"
                onClick={onComplete}
                className="bg-white text-purple-600 hover:bg-white/90 h-9 px-3 font-medium"
              >
                ✓ Done
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}