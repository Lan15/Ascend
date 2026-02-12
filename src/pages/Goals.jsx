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
import { Plus, Edit, Trash2, Target, CheckCircle2, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "sonner";

const categories = ["health", "work", "learning", "personal", "fitness", "mindfulness"];

export default function Goals() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_duration_minutes: '',
    category: 'personal',
    deadline: ''
  });

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
      target_duration_minutes: '',
      category: 'personal',
      deadline: ''
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
      target_duration_minutes: goal.target_duration_minutes || '',
      category: goal.category || 'personal',
      deadline: goal.deadline || ''
    });
    setShowDialog(true);
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const categoryColors = {
    health: "bg-red-100 text-red-800 border-red-200",
    work: "bg-blue-100 text-blue-800 border-blue-200",
    learning: "bg-purple-100 text-purple-800 border-purple-200",
    personal: "bg-green-100 text-green-800 border-green-200",
    fitness: "bg-orange-100 text-orange-800 border-orange-200",
    mindfulness: "bg-cyan-100 text-cyan-800 border-cyan-200"
  };

  const GoalCard = ({ goal }) => (
    <Card className={goal.completed ? 'bg-green-50' : 'bg-white'}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {goal.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              <h3 className={`text-xl font-semibold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                {goal.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[goal.category] || categoryColors.personal}`}>
                {goal.category}
              </span>
            </div>
            {goal.description && (
              <p className="text-gray-600 mb-2">{goal.description}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-500">
              {goal.target_duration_minutes && (
                <span>Target: {goal.target_duration_minutes} minutes</span>
              )}
              {goal.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(goal.deadline), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            {goal.completed && goal.completed_date && (
              <p className="text-xs text-green-600 mt-2">
                Completed on {format(new Date(goal.completed_date), 'MMM d, yyyy')}
              </p>
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
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Goals & Achievements 🎯
            </h1>
            <p className="text-gray-600 mt-2">Set goals and conquer them</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No active goals. Set your first goal to get started!</p>
                </CardContent>
              </Card>
            ) : (
              activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
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
                <label className="block text-sm font-medium mb-2">Target Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.target_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, target_duration_minutes: e.target.value })}
                  placeholder="60"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

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