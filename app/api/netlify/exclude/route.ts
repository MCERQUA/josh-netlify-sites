import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { siteId } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { success: false, error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Read current excluded sites
    const excludedPath = path.join(process.cwd(), 'data', 'excluded-sites.json');
    let excludedSites: string[] = [];

    try {
      const data = await fs.readFile(excludedPath, 'utf-8');
      excludedSites = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      excludedSites = [];
    }

    // Add site to excluded list if not already there
    if (!excludedSites.includes(siteId)) {
      excludedSites.push(siteId);
    }

    // Ensure data directory exists
    try {
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Save updated list
    await fs.writeFile(excludedPath, JSON.stringify(excludedSites, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Site excluded successfully',
    });
  } catch (error) {
    console.error('Error excluding site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to exclude site' },
      { status: 500 }
    );
  }
}
