import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from "sonner";
import Mascot from "../components/shared/Mascot";
import { getTheme } from "../components/shared/themeColors";
import AICoachDailyInsight from "../components/dashboard/AICoachDailyInsight";

// Widget imports
import StreakWidget from "../components/dashboard/widgets/StreakWidget";
import XPWidget from "../components/dashboard/widgets/XPWidget";
import GoalsWidget from "../components/dashboard/widgets/GoalsWidget";
import RecentCompletionsWidget from "../components/dashboard/widgets/RecentCompletionsWidget";
import AIInsightsWidget from "../components/dashboard/widgets/AIInsightsWidget";
import TaskProgressWidget from "../components/dashboard/widgets/TaskProgressWidget";
import WorldClockWidget from "../components/dashboard/widgets/WorldClockWidget";
import QuickActionsWidget from "../components/dashboard/widgets/QuickActionsWidget";
import ActiveGoalsWidget from "../components/dashboard/widgets/ActiveGoalsWidget";
import AchievementsWidget from "../components/dashboard/widgets/AchievementsWidget";
import GemsWidget from "../components/dashboard/widgets/GemsWidget";
import CalendarWidget from "../components/dashboard/widgets/CalendarWidget";
import WeeklyActivityWidget from "../components/dashboard/widgets/WeeklyActivityWidget";
import HabitStrengthWidget from "../components/dashboard/widgets/HabitStrengthWidget";
import ChallengeProgressWidget from "../components/dashboard/widgets/ChallengeProgressWidget";
import LeaderboardWidget from "../components/dashboard/widgets/LeaderboardWidget";
import MotivationWidget from "../components/dashboard/widgets/MotivationWidget";
import FocusTimerWidget from "../components/dashboard/widgets/FocusTimerWidget";

const AVAILABLE_WIDGETS = [
  { id: 'streak', name: 'Streak', component: StreakWidget, defaultSpan: 1 },
  { id: 'xp', name: 'Level & XP', component: XPWidget, defaultSpan: 1 },
  { id: 'goals', name: 'Goals Progress', component: GoalsWidget, defaultSpan: 1 },
  { id: 'recent', name: 'Recent Completions', component: RecentCompletionsWidget, defaultSpan: 1 },
  { id: 'ai', name: 'AI Insights', component: AIInsightsWidget, defaultSpan: 2 },
  { id: 'tasks', name: 'Progress', component: TaskProgressWidget, defaultSpan: 1 },
  { id: 'worldclock', name: 'World Clock', component: WorldClockWidget, defaultSpan: 1 },
  { id: 'quickactions', name: 'Quick Actions', component: QuickActionsWidget, defaultSpan: 1 },
  { id: 'activegoals', name: 'Active Goals', component: ActiveGoalsWidget, defaultSpan: 1 },
  { id: 'achievements', name: 'Achievements', component: AchievementsWidget, defaultSpan: 1 },
  { id: 'gems', name: 'Your Gems', component: GemsWidget, defaultSpan: 1 },
  { id: 'calendar', name: 'Calendar', component: CalendarWidget, defaultSpan: 2 },
  { id: 'weeklyactivity', name: 'Weekly Activity Graph', component: WeeklyActivityWidget, defaultSpan: 2 },
  { id: 'habitstrength', name: 'Habit Strength', component: HabitStrengthWidget, defaultSpan: 1 },
  { id: 'challengeprogress', name: 'Challenge Progress', component: ChallengeProgressWidget, defaultSpan: 1 },
  { id: 'leaderboard', name: 'Leaderboard Rank', component: LeaderboardWidget, defaultSpan: 1 },
  { id: 'motivation', name: 'Daily Motivation', component: MotivationWidget, defaultSpan: 2 },
  { id: 'focustimer', name: 'Focus Timer', component: FocusTimerWidget, defaultSpan: 1 }
];

const DEFAULT_WIDGETS = ['streak', 'xp', 'goals', 'tasks', 'recent', 'ai'];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [widgetSpans, setWidgetSpans] = useState({});
  const [layouts, setLayouts] = useState([]);
  const [currentLayoutName, setCurrentLayoutName] = useState('Default');
  const [newLayoutName, setNewLayoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions'],
    queryFn: () => base44.entities.CompletionLog.list('-created_date', 50)
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list('-created_date', 20)
  });

  useEffect(() => {
    if (user?.dashboard_layouts) {
      setLayouts(user.dashboard_layouts);
      const activeLayout = user.dashboard_layouts.find(
        l => l.name === user.active_dashboard_layout
      );
      if (activeLayout) {
        setWidgets(activeLayout.widgets);
        setWidgetSpans(activeLayout.widgetSpans || {});
        setCurrentLayoutName(activeLayout.name);
      }
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Dashboard saved!');
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setWidgets(items);
  };

  const toggleWidget = (widgetId) => {
    setWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const saveCurrentLayout = () => {
    const updatedLayouts = layouts.filter(l => l.name !== currentLayoutName);
    updatedLayouts.push({ name: currentLayoutName, widgets, widgetSpans });
    
    updateUserMutation.mutate({
      dashboard_layouts: updatedLayouts,
      active_dashboard_layout: currentLayoutName
    });
    setLayouts(updatedLayouts);
    setIsCustomizing(false);
  };

  const saveAsNewLayout = () => {
    if (!newLayoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    const updatedLayouts = [...layouts, { name: newLayoutName, widgets, widgetSpans }];
    updateUserMutation.mutate({
      dashboard_layouts: updatedLayouts,
      active_dashboard_layout: newLayoutName
    });
    setLayouts(updatedLayouts);
    setCurrentLayoutName(newLayoutName);
    setNewLayoutName('');
    setShowSaveDialog(false);
    setIsCustomizing(false);
    toast.success(`Layout "${newLayoutName}" saved!`);
  };

  const loadLayout = (layoutName) => {
    const layout = layouts.find(l => l.name === layoutName);
    if (layout) {
      setWidgets(layout.widgets);
      setWidgetSpans(layout.widgetSpans || {});
      setCurrentLayoutName(layoutName);
      updateUserMutation.mutate({ active_dashboard_layout: layoutName });
    }
  };

  const updateWidgetSpan = (widgetId, span) => {
    setWidgetSpans(prev => ({ ...prev, [widgetId]: span }));
  };

  const deleteLayout = (layoutName) => {
    if (layoutName === 'Default') {
      toast.error('Cannot delete default layout');
      return;
    }
    const updatedLayouts = layouts.filter(l => l.name !== layoutName);
    updateUserMutation.mutate({ dashboard_layouts: updatedLayouts });
    setLayouts(updatedLayouts);
    if (currentLayoutName === layoutName) {
      setCurrentLayoutName('Default');
      setWidgets(DEFAULT_WIDGETS);
    }
    toast.success('Layout deleted');
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Mascot pageContext="dashboard" user={user} />
        <AICoachDailyInsight 
          user={user} 
          completions={completions}
          routines={routines}
          goals={goals}
        />
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              Welcome back, {user?.full_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">Dashboard: {currentLayoutName}</p>
          </div>
          <div className="flex gap-2">
            {layouts.length > 0 && (
              <select
                value={currentLayoutName}
                onChange={(e) => loadLayout(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 ${user?.theme_primary ? `focus:ring-${user.theme_primary}-500 focus:border-${user.theme_primary}-500` : 'focus:ring-purple-500 focus:border-purple-500'}`}
              >
                {layouts.map(layout => (
                  <option key={layout.name} value={layout.name}>
                    {layout.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => setIsCustomizing(!isCustomizing)}
              variant={isCustomizing ? "default" : "outline"}
              className={isCustomizing ? `bg-gradient-to-r ${getTheme(user?.theme_primary).from600} ${getTheme(user?.theme_primary).to600} text-white` : ''}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isCustomizing ? 'Done' : 'Customize'}
            </Button>
          </div>
        </div>

        {isCustomizing && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Customize Your Dashboard</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Select widgets to display:</p>
                  <div className="space-y-2">
                    {AVAILABLE_WIDGETS.map(widget => (
                      <div key={widget.id} className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={widgets.includes(widget.id)}
                            onCheckedChange={() => toggleWidget(widget.id)}
                          />
                          <span className="text-sm">{widget.name}</span>
                        </label>
                        {widgets.includes(widget.id) && (
                          <select
                            value={widgetSpans[widget.id] || widget.defaultSpan}
                            onChange={(e) => updateWidgetSpan(widget.id, parseInt(e.target.value))}
                            className="text-xs px-2 py-1 border rounded"
                          >
                            <option value={1}>1 column</option>
                            <option value={2}>2 columns</option>
                            <option value={3}>3 columns</option>
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveCurrentLayout} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Save as New Layout
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save New Layout</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Layout name..."
                          value={newLayoutName}
                          onChange={(e) => setNewLayoutName(e.target.value)}
                        />
                        <Button onClick={saveAsNewLayout} className="w-full">
                          Save Layout
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {layouts.length > 1 && currentLayoutName !== 'Default' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLayout(currentLayoutName)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Layout
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto"
              >
                {widgets.map((widgetId, index) => {
                  const widgetConfig = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                  if (!widgetConfig) return null;
                  
                  const WidgetComponent = widgetConfig.component;
                  const span = widgetSpans[widgetId] || widgetConfig.defaultSpan;
                  const colSpanClass = span === 3 ? 'lg:col-span-3' : span === 2 ? 'lg:col-span-2' : '';

                  return (
                    <Draggable key={widgetId} draggableId={widgetId} index={index} isDragDisabled={!isCustomizing}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'opacity-50' : ''} ${colSpanClass} flex items-stretch`}
                        >
                          <div className="relative group flex-1 flex flex-col">
                            {isCustomizing && (
                              <div
                                {...provided.dragHandleProps}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col">
                              <WidgetComponent
                                user={user}
                                routines={routines}
                                goals={goals}
                                completions={completions}
                                achievements={achievements}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}