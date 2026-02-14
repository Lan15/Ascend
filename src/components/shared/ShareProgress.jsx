import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Facebook, Linkedin, Instagram, Trophy } from 'lucide-react';
import { toast } from "sonner";
import html2canvas from 'html2canvas';

export default function ShareProgress({ trigger, stats }) {
  const [open, setOpen] = useState(false);

  const generateShareImage = async () => {
    const shareCard = document.getElementById('share-card');
    if (!shareCard) return;

    try {
      const canvas = await html2canvas(shareCard, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'routine-quest-progress.png';
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Image downloaded!');
      });
    } catch (error) {
      toast.error('Failed to generate image');
    }
  };

  const getBadgeEmoji = (badge) => {
    const badges = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '👑'
    };
    return badges[badge] || '🏅';
  };

  const shareText = `🎯 My Routine Quest Progress!\n\n${stats.badge ? getBadgeEmoji(stats.badge) + ' ' + stats.badge.charAt(0).toUpperCase() + stats.badge.slice(1) + ' Badge\n' : ''}⭐ Level ${stats.level || 0}\n⚡ ${stats.streak || 0} day streak\n📋 ${stats.routines || 0} routines | 🎯 ${stats.goals || 0} goals\n✅ ${stats.completions || 0} tasks completed\n${stats.consistency ? '📊 ' + stats.consistency + '% consistency\n' : ''}⏱️ ${stats.timeSpent || 0} hours invested\n\nJoin me on my productivity journey! #RoutineQuest #ProductivityGoals`;

  const shareToSocial = (platform) => {
    let url = '';
    const text = encodeURIComponent(shareText);
    
    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${text}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareText);
        toast.info('Text copied! Open Instagram to share');
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Progress</DialogTitle>
          </DialogHeader>

          {/* Preview Card */}
          <div id="share-card" className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Routine Quest Progress 🎯</h2>
              {stats.badge && (
                <div className="text-3xl">
                  {getBadgeEmoji(stats.badge)}
                </div>
              )}
            </div>
            
            <div className="bg-white/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">Level {stats.level || 0}</div>
                  <div className="text-sm opacity-90">{stats.badge ? stats.badge.charAt(0).toUpperCase() + stats.badge.slice(1) : 'Beginner'} Badge</div>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Streak:</span>
                <span className="font-bold">{stats.streak || 0} days 🔥</span>
              </div>
              <div className="flex justify-between">
                <span>Routines:</span>
                <span className="font-bold">{stats.routines || 0} 📋</span>
              </div>
              <div className="flex justify-between">
                <span>Goals:</span>
                <span className="font-bold">{stats.goals || 0} 🎯</span>
              </div>
              <div className="flex justify-between">
                <span>Completions:</span>
                <span className="font-bold">{stats.completions || 0} ✅</span>
              </div>
              {stats.consistency !== undefined && (
                <div className="flex justify-between">
                  <span>Consistency:</span>
                  <span className="font-bold">{stats.consistency}% 📊</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Time Invested:</span>
                <span className="font-bold">{stats.timeSpent || 0}h ⏱️</span>
              </div>
            </div>
            <p className="text-sm mt-4 text-center opacity-90">Building better habits every day!</p>
          </div>

          {/* Share Options */}
          <div className="space-y-3 mt-4">
            <Button onClick={generateShareImage} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download as Image
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => shareToSocial('whatsapp')} 
                variant="outline"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                WhatsApp
              </Button>
              <Button 
                onClick={() => shareToSocial('instagram')} 
                variant="outline"
                style={{ background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)', color: 'white' }}
              >
                Instagram
              </Button>
              <Button onClick={() => shareToSocial('facebook')} variant="outline">
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button onClick={() => shareToSocial('linkedin')} variant="outline">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareText);
                toast.success('Copied to clipboard!');
              }}
              variant="outline"
              className="w-full"
            >
              Copy Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}