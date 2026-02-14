import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, SkipForward, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function SpotifyMusicPanel() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const playlists = [
    { id: 1, name: "Focus Flow", tracks: 50, emoji: "🎯" },
    { id: 2, name: "Workout Pump", tracks: 75, emoji: "💪" },
    { id: 3, name: "Chill Vibes", tracks: 40, emoji: "😌" },
    { id: 4, name: "Motivation Mix", tracks: 60, emoji: "🔥" },
  ];

  const handleConnect = async () => {
    setConnecting(true);
    setTimeout(() => {
      setConnected(!connected);
      setConnecting(false);
      toast.success(connected ? "Spotify disconnected" : "Spotify connected!");
    }, 1500);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    toast.success(playing ? "Paused" : "Now playing");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-green-600" />
            Music for Focus
          </CardTitle>
          <div className={`flex items-center gap-2 text-sm ${connected ? 'text-green-600' : 'text-gray-400'}`}>
            {connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {connected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
            disabled={connecting}
            variant={connected ? "outline" : "default"}
            className={connected ? "" : "bg-green-600 hover:bg-green-700"}
          >
            {connecting ? "Connecting..." : connected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {connected && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Choose Your Playlist</p>
              <div className="grid grid-cols-2 gap-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedPlaylist(playlist)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPlaylist?.id === playlist.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{playlist.emoji}</span>
                      <span className="font-medium text-sm">{playlist.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{playlist.tracks} tracks</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedPlaylist && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedPlaylist.name}</p>
                  <p className="text-xs text-gray-500">{playing ? 'Now Playing' : 'Ready to play'}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handlePlayPause}
                    className="rounded-full"
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => toast.success('Next track!')}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Listen to curated playlists during routines</p>
          <p>• Music boosts focus and motivation</p>
          <p>• Auto-pause when routine completes</p>
        </div>
      </CardContent>
    </Card>
  );
}