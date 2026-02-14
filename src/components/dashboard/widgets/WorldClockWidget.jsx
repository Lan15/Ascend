import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';
import { format } from 'date-fns';

export default function WorldClockWidget() {
  const [times, setTimes] = useState({});

  useEffect(() => {
    const updateTimes = () => {
      setTimes({
        local: format(new Date(), 'HH:mm:ss'),
        nyc: format(new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })), 'HH:mm'),
        london: format(new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })), 'HH:mm'),
        tokyo: format(new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })), 'HH:mm')
      });
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" />
          World Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Local</span>
            <span className="text-lg font-bold text-blue-600">{times.local}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">NYC</span>
            <span className="font-semibold">{times.nyc}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">London</span>
            <span className="font-semibold">{times.london}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tokyo</span>
            <span className="font-semibold">{times.tokyo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}