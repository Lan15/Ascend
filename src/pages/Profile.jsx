import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarSelector from "../components/profile/AvatarSelector";
import ThemeSelector from "../components/profile/ThemeSelector";
import { Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [avatar, setAvatar] = useState(user?.avatar || 'user');
  const [themePrimary, setThemePrimary] = useState(user?.theme_primary || 'purple');
  const [themeBackground, setThemeBackground] = useState(user?.theme_background || 'gradient');

  // Update state when user data loads
  React.useEffect(() => {
    if (user) {
      setAvatar(user.avatar || 'user');
      setThemePrimary(user.theme_primary || 'purple');
      setThemeBackground(user.theme_background || 'gradient');
    }
  }, [user]);

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

        <Card className="mb-6">
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
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <AvatarSelector selected={avatar} onSelect={setAvatar} />
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