import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Activity, Heart, Footprints, Zap, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function HealthSyncPanel() {
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setSyncing(true);
    // Placeholder for actual health integration
    setTimeout(() => {
      setConnected(!connected);
      setSyncing(false);
      toast.success(connected ? "Health sync disconnected" : "Health sync connected!");
    }, 1500);
  };

  const healthMetrics = [
    { icon: Footprints, label: "Steps", value: connected ? "8,432 today" : "Not synced", enabled: connected },
    { icon: Activity, label: "Workouts", value: connected ? "2 this week" : "Not synced", enabled: connected },
    { icon: Heart, label: "Heart Rate", value: connected ? "72 bpm avg" : "Not synced", enabled: connected },
    { icon: Zap, label: "Active Minutes", value: connected ? "45 min" : "Not synced", enabled: connected },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Health Sync
          </CardTitle>
          <div className={`flex items-center gap-2 text-sm ${connected ? 'text-green-600' : 'text-gray-400'}`}>
            {connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Apple Health / Google Fit</p>
            <p className="text-sm text-gray-500">Auto-log workouts and steps</p>
          </div>
          <Button 
            onClick={handleConnect}
            disabled={syncing}
            variant={connected ? "outline" : "default"}
            className={connected ? "" : "bg-green-600 hover:bg-green-700"}
          >
            {syncing ? "Connecting..." : connected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {connected && (
          <div className="grid grid-cols-2 gap-3">
            {healthMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <p className="text-lg font-bold">{metric.value}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Auto-complete routines when workouts detected</p>
          <p>• Earn bonus XP for step goals (+5 XP per 5k steps)</p>
          <p>• Sync requires iOS 14+ or Android 8+</p>
        </div>
      </CardContent>
    </Card>
  );
}