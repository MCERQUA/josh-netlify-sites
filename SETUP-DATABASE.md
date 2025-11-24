# Database Setup Guide

This application uses a **Neon PostgreSQL database** to store Netlify site information.

## Environment Variables Required

### On Netlify (Production)
These should already be configured in your Netlify site settings:

1. **NETLIFY_DATABASE_URL** - Neon Postgres connection string (already configured)
2. **NETLIFY_ACCESS_TOKEN** - Netlify API token for syncing sites

### Local Development
Create a `.env.local` file with:

```bash
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_HNjV1aBvPxp5@ep-silent-math-aeajg48u-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
NETLIFY_ACCESS_TOKEN=your_netlify_api_token_here
```

## Initial Setup

### 1. Get Your Netlify API Token

1. Go to: https://app.netlify.com/user/applications#personal-access-tokens
2. Click "New access token"
3. Give it a name (e.g., "Site Gallery")
4. Click "Generate token"
5. **Copy the token** (you'll only see it once!)

### 2. Add Token to Netlify Environment

1. Go to your Netlify site settings
2. Navigate to: **Site configuration** → **Environment variables**
3. Click "Add a variable"
4. Add:
   - **Key:** `NETLIFY_ACCESS_TOKEN`
   - **Value:** [paste your token]
5. Click "Save"

### 3. Sync Sites to Database

**Option A: Via Netlify (After Deploy)**

Once deployed, visit:
```
https://your-site.netlify.app/api/admin/sync-sites
```

This will:
- Create the `sites` table if it doesn't exist
- Fetch all sites from your Netlify account
- Store them in the database

**Option B: Locally**

```bash
# Make sure .env.local is configured
npm run dev

# Then visit:
http://localhost:3000/api/admin/sync-sites
```

### 4. Verify Sites Are Loading

After syncing, visit the homepage:
```
https://your-site.netlify.app
```

You should now see all your actual Netlify sites instead of placeholder data!

## Database Schema

The `sites` table structure:

```sql
CREATE TABLE sites (
  id TEXT PRIMARY KEY,              -- Netlify site ID
  name TEXT NOT NULL,               -- Site name
  url TEXT NOT NULL,                -- Default Netlify URL
  custom_domain TEXT,               -- Custom domain (if configured)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  netlify_created_at TEXT,          -- When site was created on Netlify
  netlify_updated_at TEXT           -- Last update on Netlify
);
```

## Updating Sites

To refresh the site list from Netlify (e.g., after adding new sites):

1. Visit `/api/admin/sync-sites` again
2. This will clear the database and re-sync all sites

## Troubleshooting

### "Database not configured" error
- Check that `NETLIFY_DATABASE_URL` is set in environment variables

### "Netlify token not configured" error
- Check that `NETLIFY_ACCESS_TOKEN` is set in environment variables
- Verify the token is valid (not expired/revoked)

### "Failed to fetch sites from database" error
- Make sure you've run the sync endpoint first: `/api/admin/sync-sites`
- Check database connection (Neon dashboard)

### Sites not showing up
1. Check the sync endpoint succeeded: `/api/admin/sync-sites`
2. Verify sites exist in Netlify account
3. Check browser console for errors
4. Check Netlify function logs

## Security Notes

- The `/api/admin/sync-sites` endpoint is currently **public**
- Consider adding authentication if this is a production site
- The Netlify API token has access to your account - keep it secure
- Never commit `.env.local` to git (it's in .gitignore)

## Manual Database Access

To query the database directly:

```bash
# Using psql
psql "postgresql://neondb_owner:npg_HNjV1aBvPxp5@ep-silent-math-aeajg48u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Check sites
SELECT * FROM sites;

# Count sites
SELECT COUNT(*) FROM sites;
```

Or use the [Neon Console](https://console.neon.tech/) web interface.
