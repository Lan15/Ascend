import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Square, Plus, Trash2, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "sonner";
import { getTheme } from "../components/shared/themeColors";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date')
  });

  const theme = getTheme(user?.theme_primary || 'purple');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowDialog(false);
      resetForm();
      toast.success("Task added!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success("Task updated!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success("Task deleted!");
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const toggleComplete = (task) => {
    updateMutation.mutate({
      id: task.id,
      data: {
        ...task,
        completed: !task.completed,
        completed_date: !task.completed ? format(new Date(), 'yyyy-MM-dd') : null
      }
    });
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.from600} ${theme.to600} bg-clip-text text-transparent`} style={{
              WebkitTextStroke: '0.5px rgba(255,255,255,0.4)',
              paintOrder: 'stroke fill'
            }}>
              Tasks <span className="text-4xl">✓</span>
            </h1>
            <p className="text-gray-600 mt-2">Simple checklist for quick tasks</p>
          </div>
          <Button 
            onClick={() => setShowDialog(true)}
            className={`bg-gradient-to-r ${theme.from600} ${theme.to600}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Active Tasks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className={`w-5 h-5 ${theme.bg.replace('bg-', 'text-')}`} />
              Active Tasks ({activeTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active tasks. Add one to get started!</p>
            ) : (
              activeTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-start gap-3 p-4 rounded-lg border-2 bg-white border-gray-200 hover:border-purple-300 transition-all group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleComplete(task)}
                    className="text-gray-400 hover:text-green-600 mt-1"
                  >
                    <Square className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 items-center mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        deleteMutation.mutate(task.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <CheckSquare className="w-5 h-5" />
                Completed ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 opacity-60 group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleComplete(task)}
                    className="text-green-600 mt-1"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold line-through text-gray-600">{task.title}</h3>
                    {task.completed_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed on {format(new Date(task.completed_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        deleteMutation.mutate(task.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add Task Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={`bg-gradient-to-r ${theme.from600} ${theme.to600}`}>
                  Add Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}