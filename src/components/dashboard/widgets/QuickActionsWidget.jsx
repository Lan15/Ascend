import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickActionsWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/Routines">
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="w-4 h-4 mr-1" />
              Routine
            </Button>
          </Link>
          <Link to="/Goals">
            <Button variant="outline" size="sm" className="w-full">
              <Target className="w-4 h-4 mr-1" />
              Goal
            </Button>
          </Link>
          <Link to="/Challenges">
            <Button variant="outline" size="sm" className="w-full">
              <Trophy className="w-4 h-4 mr-1" />
              Challenge
            </Button>
          </Link>
          <Link to="/Today">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Log Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}