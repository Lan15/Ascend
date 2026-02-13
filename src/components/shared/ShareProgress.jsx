import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Facebook, Linkedin, Instagram } from 'lucide-react';
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

  const shareText = `🎯 My Routine Quest Progress!\n\n⚡ ${stats.streak || 0} day streak\n🎖️ ${stats.achievements || 0} achievements unlocked\n✅ ${stats.completions || 0} tasks completed\n⏱️ ${stats.timeSpent || 0} hours invested\n\nJoin me on my productivity journey! #RoutineQuest #ProductivityGoals`;

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
            <h2 className="text-2xl font-bold mb-4">My Routine Quest Progress 🎯</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Streak:</span>
                <span className="font-bold">{stats.streak || 0} days 🔥</span>
              </div>
              <div className="flex justify-between">
                <span>Achievements:</span>
                <span className="font-bold">{stats.achievements || 0} 🏆</span>
              </div>
              <div className="flex justify-between">
                <span>Completions:</span>
                <span className="font-bold">{stats.completions || 0} ✅</span>
              </div>
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