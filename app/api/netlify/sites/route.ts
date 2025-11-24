import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  try {
    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

    // If no database URL, return error
    if (!DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        sites: [],
        message: 'NETLIFY_DATABASE_URL environment variable not found'
      }, { status: 400 });
    }

    // Connect to Neon Postgres
    const sql = postgres(DATABASE_URL, {
      ssl: 'require',
    });

    try {
      // Query sites from database
      // Adjust table/column names based on your actual schema
      const sites = await sql`
        SELECT *
        FROM sites
        ORDER BY created_at DESC
      `;

      // Transform database rows to expected format
      const transformedSites = sites.map((site: any) => ({
        id: site.id || site.site_id,
        name: site.name || site.site_name,
        url: site.url || site.site_url,
        customDomain: site.custom_domain,
        createdAt: site.created_at || new Date().toISOString(),
        updatedAt: site.updated_at || new Date().toISOString(),
        screenshotUrl: generateScreenshotUrl(site.custom_domain || site.url || site.site_url),
        fallbackScreenshots: generateFallbackScreenshots(site.custom_domain || site.url || site.site_url),
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
