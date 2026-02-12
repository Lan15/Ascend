import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

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

export default function WorldClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeInZone = () => {
    try {
      return formatInTimeZone(currentTime, timezone, 'HH:mm:ss');
    } catch {
      return format(currentTime, 'HH:mm:ss');
    }
  };

  const getDateInZone = () => {
    try {
      return formatInTimeZone(currentTime, timezone, 'EEEE, MMMM d, yyyy');
    } catch {
      return format(currentTime, 'EEEE, MMMM d, yyyy');
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
        <div className="text-center mb-4">
          <div className="text-5xl font-bold font-mono mb-2">
            {getTimeInZone()}
          </div>
          <p className="text-sm opacity-90">{getDateInZone()}</p>
        </div>
        
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map(tz => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}