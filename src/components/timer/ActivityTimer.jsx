import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Square, Timer } from "lucide-react";

export default function ActivityTimer({ onComplete, targetMinutes }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsRunning(false);
    const minutes = Math.floor(seconds / 60);
    onComplete(minutes);
    setSeconds(0);
  };

  const progress = targetMinutes ? Math.min((seconds / (targetMinutes * 60)) * 100, 100) : 0;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Activity Timer</h3>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-5xl font-bold font-mono text-gray-800">
            {formatTime(seconds)}
          </div>
          {targetMinutes && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Target: {targetMinutes} minutes
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button onClick={() => setIsRunning(true)} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={() => setIsRunning(false)} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={handleStop} variant="destructive" disabled={seconds === 0}>
            <Square className="w-4 h-4 mr-2" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}