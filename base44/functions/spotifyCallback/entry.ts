import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const REDIRECT_URI = `${Deno.env.get('BASE44_APP_URL')}/api/spotify-callback`;

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // user email
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Spotify Connection Failed</title></head>
          <body>
            <h1>Connection Failed</h1>
            <p>${error}</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    // Exchange code for token
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
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    // Find user by email (from state) and save tokens
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.filter({ email: state });
    
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    await base44.asServiceRole.entities.User.update(user.id, {
      spotify_access_token: tokens.access_token,
      spotify_refresh_token: tokens.refresh_token,
      spotify_token_expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    });

    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Connected!</title>
          <style>
            body { 
              font-family: system-ui; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #1DB954; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0 0 1.5rem 0; }
            .emoji { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="emoji">🎵</div>
            <h1>Spotify Connected!</h1>
            <p>You can now close this window and return to the app.</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Callback error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error</h1>
          <p>${error.message}</p>
          <script>setTimeout(() => window.close(), 5000);</script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});