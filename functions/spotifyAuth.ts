import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const REDIRECT_URI = `${Deno.env.get('BASE44_APP_URL')}/api/spotify-callback`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, code, playlistUri, trackUris, deviceId, query } = body;

    // Get authorization URL
    if (action === 'getAuthUrl') {
      const scopes = [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-top-read',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'playlist-read-private',
        'playlist-read-collaborative'
      ].join(' ');

      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${SPOTIFY_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=${user.email}`;

      return Response.json({ authUrl });
    }

    // Exchange code for token
    if (action === 'exchangeCode') {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI
        })
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const tokens = await tokenResponse.json();

      // Save tokens to user record
      await base44.asServiceRole.entities.User.update(user.id, {
        spotify_access_token: tokens.access_token,
        spotify_refresh_token: tokens.refresh_token,
        spotify_token_expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      });

      return Response.json({ success: true });
    }

    // Get fresh access token
    const getAccessToken = async () => {
      if (!user.spotify_refresh_token) {
        throw new Error('No refresh token available');
      }

      // Check if token is expired
      const expiresAt = new Date(user.spotify_token_expires);
      if (expiresAt > new Date()) {
        return user.spotify_access_token;
      }

      // Refresh token
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.spotify_refresh_token
        })
      });

      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await refreshResponse.json();

      // Update tokens
      await base44.asServiceRole.entities.User.update(user.id, {
        spotify_access_token: tokens.access_token,
        spotify_token_expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      });

      return tokens.access_token;
    };

    const accessToken = await getAccessToken();

    // Get user profile
    if (action === 'getProfile') {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to get profile');

      const profile = await response.json();
      return Response.json(profile);
    }

    // Get playlists
    if (action === 'getPlaylists') {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to get playlists');

      const data = await response.json();
      return Response.json(data);
    }

    // Get top tracks
    if (action === 'getTopTracks') {
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to get top tracks');

      const data = await response.json();
      return Response.json(data);
    }

    // Search tracks
    if (action === 'search') {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,playlist&limit=20`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to search');

      const data = await response.json();
      return Response.json(data);
    }

    // Play music
    if (action === 'play') {
      const body = playlistUri
        ? { context_uri: playlistUri }
        : { uris: trackUris };

      const response = await fetch(
        deviceId
          ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
          : 'https://api.spotify.com/v1/me/player/play',
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) throw new Error('Failed to play');

      return Response.json({ success: true });
    }

    // Pause music
    if (action === 'pause') {
      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok && response.status !== 204) throw new Error('Failed to pause');

      return Response.json({ success: true });
    }

    // Disconnect
    if (action === 'disconnect') {
      await base44.asServiceRole.entities.User.update(user.id, {
        spotify_access_token: null,
        spotify_refresh_token: null,
        spotify_token_expires: null
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Spotify error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});