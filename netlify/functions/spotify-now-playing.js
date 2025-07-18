const https = require('https');

// Get access token using refresh token
async function getAccessToken() {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const postData = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN,
  }).toString();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Get currently playing track
async function getCurrentlyPlaying(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.spotify.com',
      path: '/v1/me/player/currently-playing',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 204 || !data) {
          resolve({ isPlaying: false, track: null });
          return;
        }

        try {
          const response = JSON.parse(data);
          if (!response.item) {
            resolve({ isPlaying: false, track: null });
            return;
          }

          const track = response.item;
          const isPlaying = response.is_playing;

          resolve({
            isPlaying,
            track: {
              name: track.name,
              artist: track.artists.map(artist => artist.name).join(', '),
              album: track.album.name,
              image: track.album.images[0]?.url || null,
              external_url: track.external_urls.spotify,
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const accessToken = await getAccessToken();
    const nowPlaying = await getCurrentlyPlaying(accessToken);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(nowPlaying),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch currently playing track' }),
    };
  }
};