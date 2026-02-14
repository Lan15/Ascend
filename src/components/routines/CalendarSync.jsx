import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CalendarSync({ routine }) {
  const [syncing, setSyncing] = useState(false);

  const handleAddToCalendar = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('addRoutineToCalendar', {
        routineTitle: routine.title,
        description: routine.description,
        date: new Date().toISOString(),
        duration: routine.target_duration_minutes || 30
      });

      if (response.data.success) {
        toast.success('Added to Google Calendar!');
      }
    } catch (error) {
      toast.error('Failed to add to calendar. Please connect Google Calendar first.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAddToCalendar}
      disabled={syncing}
      className="gap-2"
    >
      <Calendar className="w-4 h-4" />
      {syncing ? 'Adding...' : 'Add to Calendar'}
    </Button>
  );
}