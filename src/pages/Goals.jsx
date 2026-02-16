import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Target, CheckCircle2, Calendar, Repeat, Layers, X, AlertCircle, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { toast } from "sonner";
import SubGoalManager from "../components/goals/SubGoalManager";
import Mascot from "../components/shared/Mascot";
import { getTheme } from "../components/shared/themeColors";

const categories = ["health", "work", "learning", "personal", "fitness", "mindfulness", "career", "finance", "social"];

export default function Goals() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tracking_type: 'completion_only',
    target_duration_minutes: '',
    category: 'personal',
    deadline: '',
    is_time_bounded: false,
    time_bound_date: '',
    is_recurring: false,
    recurrence_pattern: 'daily',
    recurrence_days: [],
    is_long_term: false
  });
  const [expandedGoal, setExpandedGoal] = useState(null);

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setShowDialog(false);
      resetForm();
      toast.success("Goal created!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setShowDialog(false);
      resetForm();
      toast.success("Goal updated!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success("Goal deleted!");
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tracking_type: 'completion_only',
      target_duration_minutes: '',
      category: 'personal',
      deadline: '',
      is_time_bounded: false,
      time_bound_date: '',
      is_recurring: false,
      recurrence_pattern: 'daily',
      recurrence_days: [],
      is_long_term: false
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      target_duration_minutes: formData.target_duration_minutes ? Number(formData.target_duration_minutes) : undefined
    };

    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      tracking_type: goal.tracking_type || 'completion_only',
      target_duration_minutes: goal.target_duration_minutes || '',
      category: goal.category || 'personal',
      deadline: goal.deadline || '',
      is_time_bounded: goal.is_time_bounded || false,
      time_bound_date: goal.time_bound_date || '',
      is_recurring: goal.is_recurring || false,
      recurrence_pattern: goal.recurrence_pattern || 'daily',
      recurrence_days: goal.recurrence_days || [],
      is_long_term: goal.is_long_term || false
    });
    setShowDialog(true);
  };

  const activeGoals = goals.filter(g => !g.completed && !g.parent_goal_id && !g.is_lost);
  const completedGoals = goals.filter(g => g.completed && !g.parent_goal_id);
  const longTermGoals = goals.filter(g => g.is_long_term && !g.completed && !g.is_lost);
  const lostGoals = goals.filter(g => g.is_lost);

  const categoryColors = {
    health: "bg-red-100 text-red-800 border-red-200",
    work: "bg-blue-100 text-blue-800 border-blue-200",
    learning: "bg-purple-100 text-purple-800 border-purple-200",
    personal: "bg-green-100 text-green-800 border-green-200",
    fitness: "bg-orange-100 text-orange-800 border-orange-200",
    mindfulness: "bg-cyan-100 text-cyan-800 border-cyan-200",
    career: "bg-indigo-100 text-indigo-800 border-indigo-200",
    finance: "bg-yellow-100 text-yellow-800 border-yellow-200",
    social: "bg-pink-100 text-pink-800 border-pink-200"
  };

  const GoalCard = ({ goal }) => (
    <Card className={goal.completed ? 'bg-green-50' : 'bg-white'}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {goal.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              <h3 className={`text-xl font-semibold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                {goal.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[goal.category] || categoryColors.personal}`}>
                {goal.category}
              </span>
              {goal.is_recurring && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {goal.recurrence_pattern?.replace('_', ' ')}
                </span>
              )}
              {goal.is_long_term && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Long-term
                </span>
              )}
              {goal.is_time_bounded && !goal.is_lost && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time-bound
                </span>
              )}
            </div>
            {goal.description && (
              <p className="text-gray-600 mb-2">{goal.description}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-500 flex-wrap items-center">
              {goal.tracking_type === 'time_tracked' && goal.target_duration_minutes && (
                <span>Target: {goal.target_duration_minutes} minutes</span>
              )}
              <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                {goal.tracking_type === 'time_tracked' ? '⏱️ Time tracked' : '✓ Done/Not done'}
              </span>
              {goal.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(goal.deadline), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            {goal.is_time_bounded && goal.time_bound_date && !goal.is_lost && (
              <p className="text-sm text-orange-600 font-semibold flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4" />
                Must complete by: {format(new Date(goal.time_bound_date), 'MMM d, yyyy h:mm a')}
              </p>
            )}
            {goal.completed && goal.completed_date && (
              <p className="text-xs text-green-600 mt-2">
                Completed on {format(new Date(goal.completed_date), 'MMM d, yyyy')}
              </p>
            )}
            
            {/* Sub-goals Section */}
            {goal.is_long_term && !goal.completed && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  {expandedGoal === goal.id ? 'Hide' : 'Show'} Sub-Goals
                </Button>
              </div>
            )}
          </div>
          
          {!goal.completed && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(goal)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm('Delete this goal?')) {
                    deleteMutation.mutate(goal.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
        
        {expandedGoal === goal.id && (
          <div className="mt-4 pt-4 border-t">
            <SubGoalManager parentGoal={goal} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const theme = getTheme(user?.theme_primary);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <Mascot pageContext="goals" user={user} />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.from600} ${theme.to600} bg-clip-text text-transparent flex items-center gap-3`}>
              <span>Goals & Achievements</span>
              <span className="text-4xl">🎯</span>
            </h1>
            <p className="text-gray-600 mt-2">Set goals and conquer them</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className={`bg-gradient-to-r ${theme.from600} ${theme.to600} hover:opacity-90`}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="longterm" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Long-term ({longTermGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="lost" className="flex items-center gap-2 text-red-600">
              <X className="w-4 h-4" />
              Lost ({lostGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.filter(g => !g.is_long_term).length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                    <h3 className="text-xl font-semibold mb-2">Set Your First Goal</h3>
                    <p className="text-gray-500 mb-6">Quick starts to help you get going</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center gap-2 p-4 hover:border-purple-500 hover:bg-purple-50"
                      onClick={() => {
                        setFormData({ ...formData, title: "Lose 10 pounds", category: "health" });
                        setShowDialog(true);
                      }}
                    >
                      <span className="text-2xl">💪</span>
                      <span className="text-sm font-medium">Get Fit</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center gap-2 p-4 hover:border-purple-500 hover:bg-purple-50"
                      onClick={() => {
                        setFormData({ ...formData, title: "Learn a new skill", category: "learning" });
                        setShowDialog(true);
                      }}
                    >
                      <span className="text-2xl">📚</span>
                      <span className="text-sm font-medium">Learn</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-center gap-2 p-4 hover:border-purple-500 hover:bg-purple-50"
                      onClick={() => {
                        resetForm();
                        setShowDialog(true);
                      }}
                    >
                      <Plus className="w-6 h-6 text-purple-600" />
                      <span className="text-sm font-medium">Custom</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeGoals.filter(g => !g.is_long_term).map(goal => <GoalCard key={goal.id} goal={goal} />)
            )}
          </TabsContent>

          <TabsContent value="longterm" className="space-y-4">
            {longTermGoals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No long-term goals. Create one and break it down into sub-goals!</p>
                </CardContent>
              </Card>
            ) : (
              longTermGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No completed goals yet. Keep working on your active goals!</p>
                </CardContent>
              </Card>
            ) : (
              completedGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
            )}
          </TabsContent>

          <TabsContent value="lost" className="space-y-4">
            {lostGoals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No lost goals - great job staying on track!</p>
                </CardContent>
              </Card>
            ) : (
              lostGoals.map(goal => (
                <Card key={goal.id} className="border-2 border-red-300 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <X className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xl text-red-700 line-through">{goal.title}</span>
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Missed Deadline</span>
                          </div>
                        </div>
                        {goal.description && (
                          <p className="text-gray-600 mb-3">{goal.description}</p>
                        )}
                        {goal.lost_date && (
                          <p className="text-sm text-red-700 font-semibold">
                            Time limit expired: {format(new Date(goal.lost_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this lost goal?')) {
                            deleteMutation.mutate(goal.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Learn a new skill"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What do you want to achieve?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tracking Type</label>
                <Select value={formData.tracking_type} onValueChange={(value) => setFormData({ ...formData, tracking_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion_only">✓ Completion only (done/not done)</SelectItem>
                    <SelectItem value="time_tracked">⏱️ Time tracked (with timer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tracking_type === 'time_tracked' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Target Duration (minutes)</label>
                  <Input
                    type="number"
                    value={formData.target_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, target_duration_minutes: e.target.value })}
                    placeholder="60"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.is_time_bounded}
                    onCheckedChange={(checked) => setFormData({...formData, is_time_bounded: checked})}
                    id="time-bounded"
                  />
                  <label htmlFor="time-bounded" className="text-sm font-medium cursor-pointer">
                    Time-bounded (strict deadline with exact time)
                  </label>
                </div>
                
                {formData.is_time_bounded && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Exact Deadline (Date & Time) *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.time_bound_date}
                      onChange={(e) => setFormData({...formData, time_bound_date: e.target.value})}
                      required={formData.is_time_bounded}
                    />
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Goal will be marked as lost if not completed by this time
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  />
                  <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                    Recurring Goal
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="longterm"
                    checked={formData.is_long_term}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_long_term: checked })}
                  />
                  <label htmlFor="longterm" className="text-sm font-medium cursor-pointer">
                    Long-term Goal
                  </label>
                </div>
              </div>

              {formData.is_recurring && (
                <div>
                  <label className="block text-sm font-medium mb-2">Recurrence Pattern</label>
                  <Select 
                    value={formData.recurrence_pattern} 
                    onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every_other_day">Every Other Day</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingGoal ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}