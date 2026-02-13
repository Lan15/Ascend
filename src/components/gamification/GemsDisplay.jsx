import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function GemsDisplay({ gems = 0, streakFreezes = 0, onUseFreeze }) {
  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gem className="w-8 h-8 text-cyan-600" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-600">Your Gems</p>
              <p className="text-3xl font-bold text-cyan-600">{gems}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-xl">{streakFreezes}</span>
            </div>
            <p className="text-xs text-gray-500">Streak Freezes</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            disabled={gems < 50}
          >
            <span>Buy Streak Freeze</span>
            <span className="flex items-center gap-1">
              <Gem className="w-4 h-4" />
              50
            </span>
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Earn gems by completing routines (+2 💎) and achievements (+10 💎)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}