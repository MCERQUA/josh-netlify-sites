import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

// Generate screenshot URL using ApiFlash
function generateScreenshotUrl(url: string): string {
  if (!url) return '';

  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const apiflashKey = process.env.APIFLASH_KEY;

  if (!apiflashKey) {
    // Fallback to thum.io if no API key
    return `https://image.thum.io/get/width/1920/crop/1080/${fullUrl}`;
  }

  const params = new URLSearchParams({
    access_key: apiflashKey,
    url: fullUrl,
    width: '1920',
    height: '1080',
    delay: '3',
    fresh: 'true', // Force fresh screenshot
    wait_until: 'page_loaded',
  });

  return `https://api.apiflash.com/v1/urltoimage?${params}`;
}

// POST - Refresh screenshot for a specific site
export async function POST(request: Request) {
  try {
    const { siteId } = await request.json();

    if (!siteId) {
      return NextResponse.json({ success: false, error: 'Site ID required' }, { status: 400 });
    }

    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const sql = postgres(DATABASE_URL, { ssl: 'require' });

    try {
      // Get site URL
      const sites = await sql`SELECT id, url, custom_domain FROM sites WHERE id = ${siteId}`;

      if (sites.length === 0) {
        await sql.end();
        return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
      }

      const site = sites[0];
      const targetUrl = site.custom_domain || site.url;

      // Generate new screenshot URL (with fresh=true to force new capture)
      const screenshotUrl = generateScreenshotUrl(targetUrl);

      // Update database with new screenshot URL
      await sql`
        UPDATE sites
        SET screenshot_url = ${screenshotUrl}, screenshot_updated_at = NOW()
        WHERE id = ${siteId}
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        siteId,
        screenshotUrl,
        message: 'Screenshot refreshed'
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('Error refreshing screenshot:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh screenshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Generate initial screenshots for all sites without one
export async function GET() {
  try {
    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const sql = postgres(DATABASE_URL, { ssl: 'require' });

    try {
      // Get all sites without screenshots
      const sites = await sql`
        SELECT id, url, custom_domain
        FROM sites
        WHERE screenshot_url IS NULL
      `;

      let updated = 0;

      for (const site of sites) {
        const targetUrl = site.custom_domain || site.url;
        const screenshotUrl = generateScreenshotUrl(targetUrl);

        await sql`
          UPDATE sites
          SET screenshot_url = ${screenshotUrl}, screenshot_updated_at = NOW()
          WHERE id = ${site.id}
        `;
        updated++;
      }

      await sql.end();

      return NextResponse.json({
        success: true,
        message: `Generated screenshot URLs for ${updated} sites`,
        total: updated
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('Error generating screenshots:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate screenshots'
    }, { status: 500 });
  }
}
