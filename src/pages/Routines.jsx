import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import QuickStartButtons from "../components/shared/QuickStartButtons";
import CalendarSync from "../components/routines/CalendarSync";

const categories = ["health", "work", "learning", "personal", "fitness", "mindfulness"];

export default function Routines() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tracking_type: 'time_tracked',
    target_duration_minutes: '',
    category: 'personal',
    active: true
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Routine.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['routines']);
      setShowDialog(false);
      resetForm();
      toast.success("Routine created!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Routine.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['routines']);
      setShowDialog(false);
      resetForm();
      toast.success("Routine updated!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Routine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['routines']);
      toast.success("Routine deleted!");
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tracking_type: 'time_tracked',
      target_duration_minutes: '',
      category: 'personal',
      active: true
    });
    setEditingRoutine(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      target_duration_minutes: formData.target_duration_minutes ? Number(formData.target_duration_minutes) : undefined
    };

    if (editingRoutine) {
      updateMutation.mutate({ id: editingRoutine.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (routine) => {
    setEditingRoutine(routine);
    setFormData({
      title: routine.title,
      description: routine.description || '',
      tracking_type: routine.tracking_type || 'time_tracked',
      target_duration_minutes: routine.target_duration_minutes || '',
      category: routine.category || 'personal',
      active: routine.active ?? true
    });
    setShowDialog(true);
  };

  const toggleActive = (routine) => {
    updateMutation.mutate({
      id: routine.id,
      data: { ...routine, active: !routine.active }
    });
  };

  const handleQuickStart = (item) => {
    if (!item) {
      setShowDialog(true);
      return;
    }
    setFormData({
      title: item.label,
      description: item.description,
      target_duration_minutes: item.duration,
      category: item.category,
      active: true
    });
    setShowDialog(true);
  };

  const categoryColors = {
    health: "bg-red-100 text-red-800 border-red-200",
    work: "bg-blue-100 text-blue-800 border-blue-200",
    learning: "bg-purple-100 text-purple-800 border-purple-200",
    personal: "bg-green-100 text-green-800 border-green-200",
    fitness: "bg-orange-100 text-orange-800 border-orange-200",
    mindfulness: "bg-cyan-100 text-cyan-800 border-cyan-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Daily Routines 🌟
            </h1>
            <p className="text-gray-600 mt-2">Build habits that stick</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Routine
          </Button>
        </div>

        <div className="grid gap-4">
          {routines.map(routine => (
            <Card key={routine.id} className={`${routine.active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{routine.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[routine.category] || categoryColors.personal}`}>
                        {routine.category}
                      </span>
                    </div>
                    {routine.description && (
                      <p className="text-gray-600 mb-2">{routine.description}</p>
                    )}
                    <div className="flex gap-3 items-center text-sm text-gray-500">
                      {routine.tracking_type === 'time_tracked' && routine.target_duration_minutes && (
                        <span>Target: {routine.target_duration_minutes} minutes</span>
                      )}
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {routine.tracking_type === 'time_tracked' ? '⏱️ Time tracked' : '✓ Completion only'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <CalendarSync routine={routine} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(routine)}
                      title={routine.active ? "Deactivate" : "Activate"}
                    >
                      {routine.active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(routine)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this routine?')) {
                          deleteMutation.mutate(routine.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {routines.length === 0 && (
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
                  <p className="text-gray-500">Choose a quick start or create your own custom routine</p>
                </div>
                <QuickStartButtons onSelect={handleQuickStart} type="routine" />
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoutine ? 'Edit Routine' : 'Create New Routine'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Morning meditation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this routine involve?"
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
                    <SelectItem value="time_tracked">⏱️ Time tracked (with timer)</SelectItem>
                    <SelectItem value="completion_only">✓ Completion only (done/not done)</SelectItem>
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
                    placeholder="30"
                    min="1"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingRoutine ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}