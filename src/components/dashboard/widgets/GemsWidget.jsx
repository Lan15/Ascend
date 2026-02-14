import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem } from 'lucide-react';

export default function GemsWidget({ user }) {
  return (
    <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Gem className="w-4 h-4 text-purple-500" />
          Gems
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {user?.gems || 0}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Premium currency for special features
        </p>
      </CardContent>
    </Card>
  );
}