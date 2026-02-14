import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Play, Pause, CheckCircle2, XCircle, Search, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SpotifyMusicPanel() {
  const queryClient = useQueryClient();
  const [playing, setPlaying] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: topTracks = [] } = useQuery({
    queryKey: ['spotifyTopTracks'],
    queryFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'getTopTracks' });
      return res.data.tracks || [];
    },
    enabled: !!user?.spotify_connected,
    retry: false
  });

  const { data: searchResults, refetch: searchMusic } = useQuery({
    queryKey: ['spotifySearch', searchQuery],
    queryFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'search', query: searchQuery });
      return res.data || { tracks: { items: [] }, playlists: { items: [] } };
    },
    enabled: false
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('spotifyAuth', { action: 'getProfile' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['spotifyPlaylists']);
      queryClient.invalidateQueries(['spotifyTopTracks']);
      toast.success('Spotify connected!');
    },
    onError: () => {
      toast.error('Failed to connect. Please authorize Spotify first.');
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
      setSelectedItem(null);
      toast.success('Spotify disconnected');
    }
  });

  const playMutation = useMutation({
    mutationFn: async ({ uri, isTrack }) => {
      const payload = isTrack 
        ? { action: 'play', trackUris: [uri] }
        : { action: 'play', playlistUri: uri };
      const res = await base44.functions.invoke('spotifyAuth', payload);
      return res.data;
    },
    onSuccess: () => {
      setPlaying(true);
      toast.success('Playing on Spotify');
    },
    onError: () => {
      toast.error('Make sure Spotify is open on your device.');
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMusic();
    }
  };

  const handlePlay = (uri, isTrack) => {
    setSelectedItem(uri);
    playMutation.mutate({ uri, isTrack });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-green-600" />
            Spotify Music Library
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
                  <p className="text-sm text-gray-500">Connect to browse your music</p>
                </div>
              </div>
              <Button 
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Browse Your Music</p>
              <Button onClick={() => disconnectMutation.mutate()} variant="outline" size="sm">
                Disconnect
              </Button>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Search tracks or playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="playlists">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
                <TabsTrigger value="tracks">Top Tracks</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
              </TabsList>

              <TabsContent value="playlists" className="space-y-2 max-h-80 overflow-y-auto">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{playlist.name}</p>
                      <p className="text-xs text-gray-500">{playlist.tracks?.total || 0} tracks</p>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedItem === playlist.uri && playing ? "outline" : "default"}
                      onClick={() => handlePlay(playlist.uri, false)}
                    >
                      {selectedItem === playlist.uri && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tracks" className="space-y-2 max-h-80 overflow-y-auto">
                {topTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                    {track.album?.images?.[2] && (
                      <img src={track.album.images[2].url} alt="" className="w-10 h-10 rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artists?.[0]?.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedItem === track.uri && playing ? "outline" : "default"}
                      onClick={() => handlePlay(track.uri, true)}
                    >
                      {selectedItem === track.uri && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="search" className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults?.tracks?.items?.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                    {track.album?.images?.[2] && (
                      <img src={track.album.images[2].url} alt="" className="w-10 h-10 rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artists?.[0]?.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedItem === track.uri && playing ? "outline" : "default"}
                      onClick={() => handlePlay(track.uri, true)}
                    >
                      {selectedItem === track.uri && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            {playing && (
              <Button onClick={() => pauseMutation.mutate()} variant="outline" className="w-full">
                <Pause className="w-4 h-4 mr-2" />
                Pause Playback
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}