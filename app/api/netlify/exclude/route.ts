import { NextResponse } from 'next/server';
import postgres from 'postgres';

// Force dynamic to prevent any caching issues
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { siteId } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { success: false, error: 'Site ID is required' },
        { status: 400 }
      );
    }

    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Connect to database
    const sql = postgres(DATABASE_URL, { ssl: 'require' });

    try {
      // Create excluded_sites table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS excluded_sites (
          site_id TEXT PRIMARY KEY,
          excluded_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Add site to excluded list (ignore if already exists)
      await sql`
        INSERT INTO excluded_sites (site_id)
        VALUES (${siteId})
        ON CONFLICT (site_id) DO NOTHING
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        message: 'Site excluded successfully',
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('Error excluding site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to exclude site', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
