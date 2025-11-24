import { NextResponse } from 'next/server';
import postgres from 'postgres';

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
          netlify_updated_at TEXT
        )
      `;

      // Fetch sites from Netlify API
      const response = await fetch('https://api.netlify.com/api/v1/sites', {
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Netlify API error: ${response.status}`);
      }

      const sites = await response.json();

      // Clear existing data and insert new sites
      await sql`TRUNCATE TABLE sites`;

      for (const site of sites) {
        await sql`
          INSERT INTO sites (id, name, url, custom_domain, netlify_created_at, netlify_updated_at)
          VALUES (
            ${site.id},
            ${site.name},
            ${site.url},
            ${site.custom_domain || null},
            ${site.created_at},
            ${site.updated_at}
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
