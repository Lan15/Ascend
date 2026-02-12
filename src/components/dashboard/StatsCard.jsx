import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    yellow: "bg-yellow-500"
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 ${colorClasses[color]} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 ${colorClasses[color]} bg-opacity-20 rounded-xl`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}