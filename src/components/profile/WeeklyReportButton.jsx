import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WeeklyReportButton() {
  const [sending, setSending] = useState(false);

  const handleSendReport = async () => {
    setSending(true);
    try {
      const response = await base44.functions.invoke('sendWeeklyReport', {});

      if (response.data.success) {
        toast.success('Weekly report sent to your email!');
      }
    } catch (error) {
      toast.error('Failed to send report. Please connect Gmail first.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      onClick={handleSendReport}
      disabled={sending}
      variant="outline"
      className="w-full gap-2"
    >
      <Mail className="w-4 h-4" />
      {sending ? 'Sending...' : 'Send Weekly Report via Email'}
    </Button>
  );
}