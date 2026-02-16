import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Gem } from "lucide-react";

export default function StreakSaverDialog({ 
  open, 
  onClose, 
  onConfirm, 
  streakDays, 
  gemCost = 50 
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flame className="w-6 h-6 text-orange-500" />
            Save Your Streak!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Oh no! You're about to lose your {streakDays}-day streak. 
            Use gems to save it and keep your progress alive!
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 my-4">
          <div className="text-center">
            <div className="text-6xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {streakDays} Day Streak
            </div>
            <p className="text-gray-600">Don't let it slip away!</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-purple-600 mb-4">
          <Gem className="w-5 h-5" />
          Cost: {gemCost} Gems
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Let it go
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Gem className="w-4 h-4 mr-2" />
            Save Streak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}