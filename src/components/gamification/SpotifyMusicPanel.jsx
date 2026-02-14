import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Play, Pause, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SpotifyMusicPanel() {
  const queryClient = useQueryClient();
  const [playing, setPlaying] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['spotifyPlaylists'],
    queryFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'getPlaylists' });
      return res.data.playlists || [];
    },
    enabled: !!user?.spotify_connected,
    retry: false
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'getProfile' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['spotifyPlaylists']);
      toast.success('Spotify connected!');
    },
    onError: () => {
      toast.error('Failed to connect. Please authorize Spotify in Settings.');
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'disconnect' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setPlaying(false);
      setSelectedPlaylist(null);
      toast.success('Spotify disconnected');
    }
  });

  const playMutation = useMutation({
    mutationFn: async (playlistUri) => {
      const res = await base44.functions.invoke('spotifyAuth', { 
        action: 'play',
        playlistUri 
      });
      return res.data;
    },
    onSuccess: () => {
      setPlaying(true);
      toast.success('Playing on Spotify');
    },
    onError: () => {
      toast.error('Failed to play. Make sure Spotify is open on your device.');
    }
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'pause' });
      return res.data;
    },
    onSuccess: () => {
      setPlaying(false);
      toast.success('Paused');
    }
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handlePlayPause = () => {
    if (playing) {
      pauseMutation.mutate();
    } else {
      playMutation.mutate(selectedPlaylist);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-green-600" />
            Music for Focus
          </CardTitle>
          <div className={`flex items-center gap-2 text-sm ${user?.spotify_connected ? 'text-green-600' : 'text-gray-400'}`}>
            {user?.spotify_connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {user?.spotify_connected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user?.spotify_connected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">Spotify</p>
                  <p className="text-sm text-gray-500">Focus music for routines</p>
                </div>
              </div>
              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Connect your Spotify account to play music during routines
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium">Spotify Connected</p>
                  <p className="text-xs text-gray-600">Choose a playlist to play</p>
                </div>
              </div>
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>

            {playlists.length > 0 && (
              <>
                <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.uri}>
                        {playlist.name} ({playlist.tracks?.total || 0} tracks)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handlePlayPause}
                  disabled={!selectedPlaylist || playMutation.isPending || pauseMutation.isPending}
                  className="w-full"
                  variant={playing ? "outline" : "default"}
                >
                  {playing ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Music
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play Music
                    </>
                  )}
                </Button>
              </>
            )}

            {playlists.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                No playlists found. Create playlists in Spotify first.
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Play your playlists during routines</p>
          <p>• Music boosts focus and motivation</p>
          <p>• Auto-pause when routine completes</p>
        </div>
      </CardContent>
    </Card>
  );
}