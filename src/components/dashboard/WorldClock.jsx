import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

const timezones = [
  { label: 'Local Time', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEDT)', value: 'Australia/Sydney' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
];

export default function WorldClock({ savedTimezones = [] }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezones, setSelectedTimezones] = useState(
    savedTimezones.length > 0 
      ? savedTimezones 
      : [Intl.DateTimeFormat().resolvedOptions().timeZone]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeInZone = (tz) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleTimeString('en-US', { hour12: false });
    }
  };

  const getTimezoneLabel = (tz) => {
    const found = timezones.find(t => t.value === tz);
    return found ? found.label : tz;
  };

  const addTimezone = (tz) => {
    if (!selectedTimezones.includes(tz) && selectedTimezones.length < 4) {
      setSelectedTimezones([...selectedTimezones, tz]);
    }
  };

  const removeTimezone = (tz) => {
    if (selectedTimezones.length > 1) {
      setSelectedTimezones(selectedTimezones.filter(t => t !== tz));
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="w-5 h-5" />
          World Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {selectedTimezones.map((tz, idx) => (
            <div key={tz} className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs opacity-75">{getTimezoneLabel(tz)}</span>
                {selectedTimezones.length > 1 && (
                  <button
                    onClick={() => removeTimezone(tz)}
                    className="text-xs opacity-75 hover:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-3xl font-bold font-mono">
                {getTimeInZone(tz)}
              </div>
            </div>
          ))}
        </div>
        
        {selectedTimezones.length < 4 && (
          <Select onValueChange={addTimezone}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Add timezone..." />
            </SelectTrigger>
            <SelectContent>
              {timezones
                .filter(tz => !selectedTimezones.includes(tz.value))
                .map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}