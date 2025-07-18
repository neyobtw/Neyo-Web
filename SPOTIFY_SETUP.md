# Spotify API Setup Guide

Follow these steps to set up Spotify integration for your portfolio website.

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the details:
   - **App Name**: "Portfolio Website" (or any name you prefer)
   - **App Description**: "Personal portfolio website with now playing widget"
   - **Website**: Your website URL (can be localhost for now)
   - **Redirect URI**: `http://localhost:3001/callback`
5. Check the boxes for the terms of service
6. Click "Save"

## Step 2: Get Your Credentials

1. In your new app dashboard, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Show Client Secret" and copy this

## Step 3: Get Authorization Code

1. Replace `YOUR_CLIENT_ID` in this URL with your actual Client ID:
```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3001/callback&scope=user-read-currently-playing%20user-read-playback-state
```

2. Open this URL in your browser
3. Log in to Spotify and authorize the app
4. You'll be redirected to a URL that looks like:
   `http://localhost:3001/callback?code=AUTHORIZATION_CODE`
5. Copy the `AUTHORIZATION_CODE` from the URL

## Step 4: Get Refresh Token

Run this command in your terminal (replace the values with your actual credentials):

```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
  -d "grant_type=authorization_code&code=YOUR_AUTHORIZATION_CODE&redirect_uri=http://localhost:3001/callback"
```

Or use this PowerShell command on Windows:
```powershell
$clientId = "YOUR_CLIENT_ID"
$clientSecret = "YOUR_CLIENT_SECRET"
$authCode = "YOUR_AUTHORIZATION_CODE"
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${clientId}:${clientSecret}"))

Invoke-RestMethod -Uri "https://accounts.spotify.com/api/token" -Method Post -Headers @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/x-www-form-urlencoded"
} -Body @{
    "grant_type" = "authorization_code"
    "code" = $authCode
    "redirect_uri" = "http://localhost:3001/callback"
}
```

6. From the response, copy the `refresh_token` value

## Step 5: Update Your .env File

Open your `.env` file and replace the placeholder values:

```env
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
SPOTIFY_REFRESH_TOKEN=your_actual_refresh_token_here
PORT=3001
```

## Step 6: Run Your Application

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

Or run both together:
```bash
npm run dev:full
```

## Troubleshooting

- **"Invalid client" error**: Double-check your Client ID and Client Secret
- **"Invalid redirect URI" error**: Make sure you added `http://localhost:3001/callback` to your Spotify app settings
- **No data showing**: Make sure you're currently playing music on Spotify
- **CORS errors**: The backend server handles CORS, make sure it's running on port 3001

## Testing

Once everything is set up:
1. Play a song on Spotify
2. Visit your website
3. You should see the "Now Playing" widget in the bottom left showing your current track
4. The widget updates every 10 seconds

If you're not playing anything, it will show "Not listening to Spotify".