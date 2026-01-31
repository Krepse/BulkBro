# Supabase Edge Function Deployment Guide

This guide explains how to deploy the Strava authentication Edge Functions to keep your client secret secure.

## Prerequisites

1. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**: Authenticate with your Supabase account
   ```bash
   supabase login
   ```

3. **Link your project**: Link the CLI to your Supabase project
   ```bash
   supabase link --project-ref wvugeywqodrqlemwheck
   ```
   (Replace with your actual project reference ID from the Supabase dashboard URL)

---

## Step-by-Step Deployment

### Step 1: Set Strava Secrets

Set the Strava credentials as secrets in your Supabase project. These are stored securely and never exposed to the client.

```bash
supabase secrets set STRAVA_CLIENT_ID=195356
supabase secrets set STRAVA_CLIENT_SECRET=13f4da4ff7a3d56a427065039ad417a0d468fd94
```

> ⚠️ **Important**: After running these commands, you can delete the `VITE_STRAVA_CLIENT_SECRET` from your local `.env` file. It's no longer needed on the client side.

### Step 2: Deploy the Edge Functions

Deploy both Edge Functions to Supabase:

```bash
# Deploy the token exchange function
supabase functions deploy strava-token --no-verify-jwt

# Deploy the token refresh function  
supabase functions deploy strava-refresh --no-verify-jwt
```

> Note: `--no-verify-jwt` is used because these functions handle their own JWT verification via the Authorization header.

### Step 3: Verify Deployment

You can verify the functions are deployed by visiting your Supabase dashboard:
1. Go to https://supabase.com/dashboard/project/wvugeywqodrqlemwheck/functions
2. You should see `strava-token` and `strava-refresh` listed

### Step 4: Test the Integration

1. Run your app locally: `npm run dev`
2. Navigate to Settings
3. Click "Koble til Strava"
4. Complete the Strava OAuth flow
5. Check the browser console for "Strava connected successfully!"

---

## Troubleshooting

### "Server configuration error"
The STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET secrets are not set. Run the secrets commands again.

### "Failed to exchange token with Strava"
- Check that the `redirect_uri` matches what's configured in your Strava API settings
- Verify your Strava app credentials are correct

### "Missing authorization header"
The user is not logged in or the session has expired. Log in again.

### Function not found (404)
The function hasn't been deployed. Run the deploy commands again.

---

## Local Development

To test Edge Functions locally:

```bash
# Start the functions locally
supabase functions serve

# In another terminal, run your app
npm run dev
```

When running locally, the functions will use the same secrets you set with `supabase secrets set`.

---

## Security Notes

- The `STRAVA_CLIENT_SECRET` is **never** sent to the browser
- All token exchanges happen server-side
- The Edge Functions verify the user's Supabase JWT before processing
- Tokens are stored securely in the `user_integrations` table with RLS protection

---

## Updating Functions

After making changes to the function code, redeploy:

```bash
supabase functions deploy strava-token --no-verify-jwt
supabase functions deploy strava-refresh --no-verify-jwt
```
