import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

// Get access token using refresh token
async function getAccessToken() {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

// Get currently playing track
app.get('/api/spotify/now-playing', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || !response.data || !response.data.item) {
      return res.json({ isPlaying: false, track: null });
    }

    const track = response.data.item;
    const isPlaying = response.data.is_playing;

    res.json({
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
    console.error('Error fetching now playing:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch currently playing track' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});