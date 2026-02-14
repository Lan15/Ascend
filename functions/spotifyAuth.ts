import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, playlistUri, trackUris, deviceId } = await req.json();

    // Get Spotify access token from app connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('spotify');

    // Get user's Spotify profile
    if (action === 'getProfile') {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to get Spotify profile');
      
      const profile = await response.json();
      
      await base44.asServiceRole.entities.User.update(user.id, {
        spotify_connected: true,
        spotify_user_id: profile.id
      });
      
      return Response.json({ profile });
    }

    // Get user's playlists
    if (action === 'getPlaylists') {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to get playlists');
      
      const data = await response.json();
      return Response.json({ playlists: data.items });
    }

    // Get user's saved tracks (library)
    if (action === 'getSavedTracks') {
      const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to get saved tracks');
      
      const data = await response.json();
      return Response.json({ tracks: data.items });
    }

    // Get user's top tracks
    if (action === 'getTopTracks') {
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=short_term', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to get top tracks');
      
      const data = await response.json();
      return Response.json({ tracks: data.items });
    }

    // Search tracks
    if (action === 'search') {
      const { query } = await req.json();
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,playlist&limit=20`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to search');
      
      const data = await response.json();
      return Response.json(data);
    }

    // Get available devices
    if (action === 'getDevices') {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to get devices');
      
      const data = await response.json();
      return Response.json({ devices: data.devices });
    }

    // Play playlist or tracks
    if (action === 'play') {
      const body = {};
      if (playlistUri) {
        body.context_uri = playlistUri;
      } else if (trackUris) {
        body.uris = trackUris;
      }
      
      const url = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play';
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.status !== 204 && !response.ok) {
        throw new Error('Failed to play music');
      }
      
      return Response.json({ success: true, playing: true });
    }

    // Pause playback
    if (action === 'pause') {
      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.status !== 204 && !response.ok) {
        throw new Error('Failed to pause music');
      }
      
      return Response.json({ success: true, playing: false });
    }

    // Get current playback
    if (action === 'getCurrentPlayback') {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.status === 204) {
        return Response.json({ playing: false });
      }
      
      if (!response.ok) throw new Error('Failed to get playback state');
      
      const data = await response.json();
      return Response.json(data);
    }

    // Disconnect Spotify
    if (action === 'disconnect') {
      await base44.asServiceRole.entities.User.update(user.id, {
        spotify_connected: false,
        spotify_user_id: null
      });
      
      return Response.json({ success: true, disconnected: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});