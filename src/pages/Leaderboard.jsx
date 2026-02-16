import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Crown, Medal, TrendingUp, UserPlus, Copy, Check } from "lucide-react";
import { startOfWeek, format } from 'date-fns';
import { toast } from "sonner";
import { getTheme } from "../components/shared/themeColors";

export default function Leaderboard() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const theme = getTheme(user?.theme_primary || 'purple');
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', weekStart],
    queryFn: async () => {
      const entries = await base44.entities.Leaderboard.filter({ week_start: weekStart });
      return entries.sort((a, b) => b.weekly_xp - a.weekly_xp);
    }
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-600 font-bold">#{rank}</span>;
  };

  const inviteLink = `${window.location.origin}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.from600} ${theme.to600} bg-clip-text text-transparent`} style={{
              WebkitTextStroke: '0.5px rgba(255,255,255,0.4)',
              paintOrder: 'stroke fill'
            }}>
                Weekly Leaderboard <span className="text-4xl">🏆</span>
              </h1>
              <p className="text-gray-600 mt-2">Compete with friends this week</p>
            </div>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className={`bg-gradient-to-r ${theme.from600} ${theme.to600}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        </div>

        <Card className={`mb-6 bg-gradient-to-br ${theme.from} ${theme.to} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Your Position</p>
                <p className="text-3xl font-bold">
                  #{leaderboard.findIndex(l => l.user_email === user?.email) + 1 || '-'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Weekly XP</p>
                <p className="text-3xl font-bold">
                  {leaderboard.find(l => l.user_email === user?.email)?.weekly_xp || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.user_email === user?.email ? `${theme.bg.replace('bg-', 'bg-')}-100 border-2 ${theme.border}` : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-bold">{entry.user_name}</p>
                      <p className="text-sm text-gray-600">{entry.weekly_completions} completions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.weekly_xp} XP</p>
                    <p className="text-xs text-gray-500">{entry.weekly_streak} day streak</p>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No entries yet. Be the first!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Friends to Routine Quest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Share this link with friends and compete together on the leaderboard!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                />
                <Button onClick={copyInviteLink} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3">Share via:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`https://wa.me/?text=Join me on Routine Quest! ${encodeURIComponent(inviteLink)}`, '_blank');
                    }}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`mailto:?subject=Join Routine Quest&body=Join me on Routine Quest! ${inviteLink}`, '_blank');
                    }}
                  >
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}