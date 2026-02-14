import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AvatarSelector from "../components/profile/AvatarSelector";
import ThemeSelector from "../components/profile/ThemeSelector";
import XPProgressBar from "../components/gamification/XPProgressBar";
import HealthSyncPanel from "../components/gamification/HealthSyncPanel";
import WeeklyReportButton from "../components/profile/WeeklyReportButton";
import { Save, User as UserIcon, Upload, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [avatar, setAvatar] = useState(user?.avatar || 'user');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [themePrimary, setThemePrimary] = useState(user?.theme_primary || 'purple');
  const [themeBackground, setThemeBackground] = useState(user?.theme_background || 'gradient');
  const [uploading, setUploading] = useState(false);

  // Update state when user data loads
  React.useEffect(() => {
    if (user) {
      setAvatar(user.avatar || 'user');
      setAvatarUrl(user.avatar_url || '');
      setThemePrimary(user.theme_primary || 'purple');
      setThemeBackground(user.theme_background || 'gradient');
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully!');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      avatar,
      avatar_url: avatarUrl,
      theme_primary: themePrimary,
      theme_background: themeBackground
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Customize Your Profile
          </h1>
          <p className="text-gray-600 mt-2">Personalize your Routine Quest experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Name:</span> {user?.full_name || 'User'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Role:</span> {user?.role || 'user'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => {
                    const data = { user, completions: [], goals: [] };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'routine-quest-data.json';
                    a.click();
                    toast.success('Data exported!');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data (JSON)
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <XPProgressBar totalXp={user?.total_xp || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HealthSyncPanel />
          <Card>
            <CardHeader>
              <CardTitle>Email Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Get your weekly progress summary delivered to your inbox
              </p>
              <WeeklyReportButton />
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload Custom Avatar</label>
                <div className="flex items-center gap-4">
                  {avatarUrl && (
                    <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-purple-500" />
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Icon Avatars */}
              <div>
                <label className="block text-sm font-medium mb-2">Or Choose an Icon</label>
                <AvatarSelector selected={avatar} onSelect={(id) => {
                  setAvatar(id);
                  setAvatarUrl(''); // Clear custom image when selecting icon
                }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <ThemeSelector
            primaryColor={themePrimary}
            background={themeBackground}
            onPrimaryChange={setThemePrimary}
            onBackgroundChange={setThemeBackground}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}