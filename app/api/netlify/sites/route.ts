import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  try {
    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

    // If no database URL, return helpful setup message
    if (!DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        sites: [],
        message: 'NETLIFY_DATABASE_URL environment variable not found. Please configure your database connection.',
        setupInstructions: 'See SETUP-DATABASE.md for setup instructions'
      }, { status: 400 });
    }

    // Connect to Neon Postgres
    const sql = postgres(DATABASE_URL, {
      ssl: 'require',
    });

    try {
      // Check if sites table exists
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'sites'
        )
      `;

      if (!tableExists[0]?.exists) {
        await sql.end();
        return NextResponse.json({
          success: false,
          error: 'Database not initialized',
          sites: [],
          message: 'The sites table does not exist yet.',
          setupInstructions: 'Please visit /api/admin/sync-sites to initialize the database and sync your Netlify sites.'
        }, { status: 400 });
      }

      // Query sites from database
      const sites = await sql`
        SELECT *
        FROM sites
        ORDER BY created_at DESC
      `;

      // If no sites found, provide helpful message
      if (sites.length === 0) {
        await sql.end();
        return NextResponse.json({
          success: false,
          error: 'No sites found',
          sites: [],
          message: 'The database is empty. No sites have been synced yet.',
          setupInstructions: 'Please visit /api/admin/sync-sites to sync your Netlify sites to the database.'
        }, { status: 200 });
      }

      // Transform database rows to expected format
      const transformedSites = sites.map((site: any) => ({
        id: site.id,
        name: site.name,
        url: site.url,
        customDomain: site.custom_domain,
        createdAt: site.netlify_created_at || site.created_at,
        updatedAt: site.netlify_updated_at || site.updated_at,
        screenshotUrl: generateScreenshotUrl(site.custom_domain || site.url),
        fallbackScreenshots: generateFallbackScreenshots(site.custom_domain || site.url),
      }));

      await sql.end();

      return NextResponse.json({
        success: true,
        sites: transformedSites,
        total: transformedSites.length,
        source: 'neon-database'
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching sites from database:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sites from database',
      message: error instanceof Error ? error.message : 'Unknown error',
      sites: [],
      setupInstructions: 'Check the server logs for details. You may need to run /api/admin/sync-sites first.'
    }, { status: 500 });
  }
}

function generateScreenshotUrl(url: string): string {
  if (!url) return '';

  const apiflashKey = process.env.APIFLASH_KEY;
  if (apiflashKey) {
    const params = new URLSearchParams({
      access_key: apiflashKey,
      url: url,
      width: '1920',
      height: '1080',
      delay: '2',
      fresh: 'false',
    });
    return `https://api.apiflash.com/v1/urltoimage?${params}`;
  }

  return `https://api.screenshot.rocks/render?url=${encodeURIComponent(url)}&width=1920&height=1080`;
}

function generateFallbackScreenshots(url: string): string[] {
  if (!url) return [];

  return [
    `https://image.thum.io/get/width/1920/crop/1080/${url}`,
  ];
}
