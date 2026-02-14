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

// Widget imports
import StreakWidget from "../components/dashboard/widgets/StreakWidget";
import XPWidget from "../components/dashboard/widgets/XPWidget";
import GoalsWidget from "../components/dashboard/widgets/GoalsWidget";
import RecentCompletionsWidget from "../components/dashboard/widgets/RecentCompletionsWidget";
import AIInsightsWidget from "../components/dashboard/widgets/AIInsightsWidget";
import TaskProgressWidget from "../components/dashboard/widgets/TaskProgressWidget";

const AVAILABLE_WIDGETS = [
  { id: 'streak', name: 'Streak', component: StreakWidget },
  { id: 'xp', name: 'Level & XP', component: XPWidget },
  { id: 'goals', name: 'Goals Progress', component: GoalsWidget },
  { id: 'recent', name: 'Recent Completions', component: RecentCompletionsWidget },
  { id: 'ai', name: 'AI Insights', component: AIInsightsWidget },
  { id: 'tasks', name: 'Task Progress', component: TaskProgressWidget }
];

const DEFAULT_WIDGETS = ['streak', 'xp', 'goals', 'tasks', 'recent', 'ai'];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
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

  useEffect(() => {
    if (user?.dashboard_layouts) {
      setLayouts(user.dashboard_layouts);
      const activeLayout = user.dashboard_layouts.find(
        l => l.name === user.active_dashboard_layout
      );
      if (activeLayout) {
        setWidgets(activeLayout.widgets);
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
    updatedLayouts.push({ name: currentLayoutName, widgets });
    
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

    const updatedLayouts = [...layouts, { name: newLayoutName, widgets }];
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
      setCurrentLayoutName(layoutName);
      updateUserMutation.mutate({ active_dashboard_layout: layoutName });
    }
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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <Mascot pageContext="dashboard" />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">Dashboard: {currentLayoutName}</p>
          </div>
          <div className="flex gap-2">
            {layouts.length > 0 && (
              <select
                value={currentLayoutName}
                onChange={(e) => loadLayout(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AVAILABLE_WIDGETS.map(widget => (
                      <label key={widget.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={widgets.includes(widget.id)}
                          onCheckedChange={() => toggleWidget(widget.id)}
                        />
                        <span className="text-sm">{widget.name}</span>
                      </label>
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {widgets.map((widgetId, index) => {
                  const widgetConfig = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                  if (!widgetConfig) return null;
                  
                  const WidgetComponent = widgetConfig.component;

                  return (
                    <Draggable key={widgetId} draggableId={widgetId} index={index} isDragDisabled={!isCustomizing}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                        >
                          <div className="relative group">
                            {isCustomizing && (
                              <div
                                {...provided.dragHandleProps}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <WidgetComponent
                              user={user}
                              routines={routines}
                              goals={goals}
                              completions={completions}
                            />
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