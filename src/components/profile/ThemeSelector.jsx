import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

const themes = [
  { id: 'purple', name: 'Purple Dream', from: 'from-purple-500', to: 'to-pink-500' },
  { id: 'blue', name: 'Ocean Blue', from: 'from-blue-500', to: 'to-cyan-500' },
  { id: 'green', name: 'Nature Green', from: 'from-green-500', to: 'to-emerald-500' },
  { id: 'orange', name: 'Sunset Orange', from: 'from-orange-500', to: 'to-red-500' },
  { id: 'pink', name: 'Rose Pink', from: 'from-pink-500', to: 'to-rose-500' },
  { id: 'red', name: 'Ruby Red', from: 'from-red-500', to: 'to-pink-500' },
  { id: 'teal', name: 'Teal Wave', from: 'from-teal-500', to: 'to-blue-500' },
  { id: 'indigo', name: 'Indigo Night', from: 'from-indigo-500', to: 'to-purple-500' },
];

const backgrounds = [
  { id: 'gradient', name: 'Gradient', class: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50' },
  { id: 'solid-light', name: 'Light', class: 'bg-gray-50' },
  { id: 'solid-dark', name: 'Dark', class: 'bg-gray-900' },
  { id: 'pattern', name: 'Pattern', class: 'bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px]' },
];

export default function ThemeSelector({ primaryColor, background, onPrimaryChange, onBackgroundChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Primary Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => onPrimaryChange(theme.id)}
                className={`p-3 rounded-lg transition-all ${
                  primaryColor === theme.id
                    ? 'ring-2 ring-purple-500'
                    : 'hover:scale-105'
                }`}
              >
                <div className={`h-16 rounded-lg bg-gradient-to-br ${theme.from} ${theme.to} mb-2`} />
                <p className="text-xs font-medium text-center">{theme.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {backgrounds.map(bg => (
              <button
                key={bg.id}
                onClick={() => onBackgroundChange(bg.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  background === bg.id
                    ? 'border-purple-500'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className={`h-16 rounded-lg ${bg.class} border border-gray-300`} />
                <p className="text-xs font-medium text-center mt-2">{bg.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}