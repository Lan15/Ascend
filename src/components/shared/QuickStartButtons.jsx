import React from 'react';
import { Button } from "@/components/ui/button";
import { Dumbbell, BookOpen, Coffee, Droplet, Edit, Plus } from "lucide-react";

const quickStarts = [
  { icon: Dumbbell, label: "Daily Workout", description: "5-minute exercise", category: "fitness", duration: 5 },
  { icon: BookOpen, label: "Read 10 Pages", description: "Build reading habit", category: "learning", duration: 15 },
  { icon: Droplet, label: "Drink Water", description: "8 glasses daily", category: "health", duration: 2 },
  { icon: Coffee, label: "Morning Journal", description: "Reflect & plan", category: "mindfulness", duration: 10 },
];

export default function QuickStartButtons({ onSelect, type = "routine" }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickStarts.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.label}
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4 hover:border-purple-500 hover:bg-purple-50 transition-all"
            onClick={() => onSelect(item)}
          >
            <Icon className="w-8 h-8 text-purple-600" />
            <div className="text-center">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </Button>
        );
      })}
      <Button
        variant="outline"
        className="h-auto flex flex-col items-center gap-2 p-4 hover:border-purple-500 hover:bg-purple-50 transition-all"
        onClick={() => onSelect(null)}
      >
        <Plus className="w-8 h-8 text-purple-600" />
        <div className="text-center">
          <p className="font-semibold text-sm">Custom</p>
          <p className="text-xs text-gray-500">Create your own</p>
        </div>
      </Button>
    </div>
  );
}