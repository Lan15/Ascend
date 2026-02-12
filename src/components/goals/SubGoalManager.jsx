import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Check, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

export default function SubGoalManager({ parentGoal }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const { data: subGoals = [] } = useQuery({
    queryKey: ['subgoals', parentGoal.id],
    queryFn: () => base44.entities.Goal.filter({ parent_goal_id: parentGoal.id })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subgoals', parentGoal.id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowDialog(false);
      setFormData({ title: '', description: '' });
      toast.success('Sub-goal added!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subgoals', parentGoal.id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subgoals', parentGoal.id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Sub-goal deleted');
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      parent_goal_id: parentGoal.id,
      category: parentGoal.category
    });
  };

  const toggleComplete = (subGoal) => {
    updateMutation.mutate({
      id: subGoal.id,
      data: {
        ...subGoal,
        completed: !subGoal.completed,
        completed_date: !subGoal.completed ? new Date().toISOString() : null
      }
    });
  };

  const completedCount = subGoals.filter(g => g.completed).length;
  const progress = subGoals.length > 0 ? (completedCount / subGoals.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-purple-600" />
            Sub-Goals ({completedCount}/{subGoals.length})
          </CardTitle>
          <Button onClick={() => setShowDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Step
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
        </div>

        {/* Sub-goals List */}
        <div className="space-y-2">
          {subGoals.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Break down this goal into smaller steps
            </p>
          ) : (
            subGoals.map(subGoal => (
              <div
                key={subGoal.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  subGoal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleComplete(subGoal)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    subGoal.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-purple-500'
                  }`}
                >
                  {subGoal.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${subGoal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {subGoal.title}
                  </p>
                  {subGoal.description && (
                    <p className="text-xs text-gray-500 mt-1">{subGoal.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(subGoal.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Add Sub-Goal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Step Title</label>
              <Input
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Textarea
                placeholder="Add details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.title || createMutation.isPending}
              >
                Add Step
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}