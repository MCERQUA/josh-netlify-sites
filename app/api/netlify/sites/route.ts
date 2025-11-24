import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const NETLIFY_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

    // If no token, return error message
    if (!NETLIFY_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'NETLIFY_ACCESS_TOKEN not configured',
        sites: [],
        message: 'Please add NETLIFY_ACCESS_TOKEN to your environment variables'
      }, { status: 400 });
    }

    // Fetch from real Netlify API
    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify API error: ${response.status}`);
    }

    const sites = await response.json();

    // Transform sites data
    const transformedSites = sites.map((site: any) => ({
      id: site.id,
      name: site.name,
      url: site.url,
      customDomain: site.custom_domain,
      createdAt: site.created_at,
      updatedAt: site.updated_at,
      screenshotUrl: generateScreenshotUrl(site.custom_domain || site.url),
      fallbackScreenshots: generateFallbackScreenshots(site.custom_domain || site.url),
    }));

    return NextResponse.json({
      success: true,
      sites: transformedSites,
      total: transformedSites.length,
    });
  } catch (error) {
    console.error('Error fetching Netlify sites:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sites from Netlify API',
      message: error instanceof Error ? error.message : 'Unknown error',
      sites: [],
    }, { status: 500 });
  }
}

function generateScreenshotUrl(url: string): string {
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
  return [
    `https://image.thum.io/get/width/1920/crop/1080/${url}`,
  ];
}
