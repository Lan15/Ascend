import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Smile, Heart, Star, Zap, Trophy, Target, Rocket, Crown, Sparkles } from "lucide-react";

const avatars = [
  { id: 'user', Icon: User, color: 'bg-gray-500' },
  { id: 'smile', Icon: Smile, color: 'bg-yellow-500' },
  { id: 'heart', Icon: Heart, color: 'bg-pink-500' },
  { id: 'star', Icon: Star, color: 'bg-purple-500' },
  { id: 'zap', Icon: Zap, color: 'bg-blue-500' },
  { id: 'trophy', Icon: Trophy, color: 'bg-yellow-600' },
  { id: 'target', Icon: Target, color: 'bg-green-500' },
  { id: 'rocket', Icon: Rocket, color: 'bg-indigo-500' },
  { id: 'crown', Icon: Crown, color: 'bg-orange-500' },
  { id: 'sparkles', Icon: Sparkles, color: 'bg-pink-400' },
];

export default function AvatarSelector({ selected, onSelect }) {
  const selectedAvatar = avatars.find(a => a.id === selected) || avatars[0];
  const Icon = selectedAvatar.Icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full ${selectedAvatar.color} flex items-center justify-center`}>
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {avatars.map(({ id, Icon, color }) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`p-3 rounded-lg transition-all ${
                selected === id
                  ? 'ring-2 ring-purple-500 bg-purple-50'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}