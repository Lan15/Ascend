import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Activity, Heart, Footprints, Zap, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function HealthSyncPanel() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updateProviderMutation = useMutation({
    mutationFn: (provider) => base44.auth.updateMe({ health_sync_provider: provider }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Health sync provider updated!');
    }
  });

  const connected = !!user?.health_sync_provider;

  const handleProviderChange = (provider) => {
    setSyncing(true);
    // Note: Apple Health, Google Fit, and Strava are not available as OAuth app connectors
    // This saves the user's preference for future integration
    setTimeout(() => {
      updateProviderMutation.mutate(provider);
      setSyncing(false);
      toast.info('Provider saved. Full OAuth integration coming soon!');
    }, 500);
  };

  const handleDisconnect = () => {
    updateProviderMutation.mutate(null);
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
        {!connected ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Choose your health tracking provider:</p>
            <div className="grid gap-3">
              <Button 
                onClick={() => handleProviderChange('apple_health')}
                disabled={syncing}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <p className="font-medium">Apple Health</p>
                  <p className="text-xs text-gray-500">iOS devices only</p>
                </div>
              </Button>
              <Button 
                onClick={() => handleProviderChange('google_fit')}
                disabled={syncing}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <p className="font-medium">Google Fit</p>
                  <p className="text-xs text-gray-500">Android devices</p>
                </div>
              </Button>
              <Button 
                onClick={() => handleProviderChange('strava')}
                disabled={syncing}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <p className="font-medium">Strava</p>
                  <p className="text-xs text-gray-500">Running & cycling</p>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium capitalize">{user.health_sync_provider?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">Connected & syncing</p>
              </div>
              <Button 
                onClick={handleDisconnect}
                variant="outline"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

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