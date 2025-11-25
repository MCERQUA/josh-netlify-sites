import { NextResponse } from 'next/server';
import postgres from 'postgres';

// GET handler - shows a simple UI to trigger sync
export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sync Netlify Sites</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: #1a202c;
    }
    p {
      color: #718096;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    button {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .status {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      display: none;
    }
    .status.success {
      background: #c6f6d5;
      color: #22543d;
      border: 1px solid #9ae6b4;
    }
    .status.error {
      background: #fed7d7;
      color: #742a2a;
      border: 1px solid #fc8181;
    }
    .status.loading {
      background: #bee3f8;
      color: #2c5282;
      border: 1px solid #90cdf4;
    }
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(44, 82, 130, 0.3);
      border-top-color: #2c5282;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔄 Sync Netlify Sites</h1>
    <p>Click the button below to sync all sites from your Netlify account to the database. This will update the gallery with the latest sites.</p>
    <button id="syncBtn" onclick="syncSites()">Sync Sites Now</button>
    <div id="status" class="status"></div>
  </div>

  <script>
    async function syncSites() {
      const btn = document.getElementById('syncBtn');
      const status = document.getElementById('status');

      btn.disabled = true;
      btn.textContent = 'Syncing...';
      status.style.display = 'block';
      status.className = 'status loading';
      status.innerHTML = '<span class="spinner"></span>Fetching sites from Netlify API...';

      try {
        const response = await fetch('/api/admin/sync-sites', {
          method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
          status.className = 'status success';
          status.innerHTML = '✅ Success! Synced ' + data.total + ' sites to the database.';
          btn.textContent = 'Sync Complete';
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          throw new Error(data.message || 'Sync failed');
        }
      } catch (error) {
        status.className = 'status error';
        status.innerHTML = '❌ Error: ' + error.message;
        btn.disabled = false;
        btn.textContent = 'Retry Sync';
      }
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

// POST handler - performs the actual sync
export async function POST() {
  try {
    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    const NETLIFY_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

    if (!DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 400 });
    }

    if (!NETLIFY_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Netlify token not configured'
      }, { status: 400 });
    }

    // Connect to database
    const sql = postgres(DATABASE_URL, { ssl: 'require' });

    try {
      // Create sites table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS sites (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          custom_domain TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          netlify_created_at TEXT,
          netlify_updated_at TEXT,
          source TEXT DEFAULT 'netlify'
        )
      `;

      // Add source column if it doesn't exist (for existing tables)
      try {
        await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'netlify'`;
      } catch (e) {
        // Column might already exist
      }

      // Fetch ALL sites from Netlify API (handle pagination)
      let allSites: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`https://api.netlify.com/api/v1/sites?page=${page}&per_page=100`, {
          headers: {
            'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Netlify API error: ${response.status}`);
        }

        const sites = await response.json();

        if (sites.length === 0) {
          hasMore = false;
        } else {
          allSites = allSites.concat(sites);
          page++;

          // Safety limit to prevent infinite loops
          if (page > 50) {
            break;
          }
        }
      }

      const sites = allSites;

      // Clear only Netlify-sourced sites (preserve WPMU and other sources)
      await sql`DELETE FROM sites WHERE source = 'netlify' OR source IS NULL`;

      for (const site of sites) {
        await sql`
          INSERT INTO sites (id, name, url, custom_domain, netlify_created_at, netlify_updated_at, source)
          VALUES (
            ${site.id},
            ${site.name},
            ${site.url},
            ${site.custom_domain || null},
            ${site.created_at},
            ${site.updated_at},
            'netlify'
          )
        `;
      }

      await sql.end();

      return NextResponse.json({
        success: true,
        message: 'Sites synced successfully',
        total: sites.length
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('Error syncing sites:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to sync sites',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
