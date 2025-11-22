import { NextResponse } from 'next/server';

// TEMPORARY: Static site data
// TODO: Replace with actual Netlify API integration
const MOCK_SITES = [
  {
    id: '1',
    name: 'example-site-1',
    url: 'https://example-site-1.netlify.app',
    customDomain: 'example.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-20T15:30:00Z',
    screenshotUrl: 'https://api.screenshot.rocks/render?url=https://example.com&width=1920&height=1080',
    fallbackScreenshots: [
      'https://image.thum.io/get/width/1920/crop/1080/https://example.com',
    ]
  },
  {
    id: '2',
    name: 'my-portfolio',
    url: 'https://my-portfolio.netlify.app',
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-11-19T12:00:00Z',
    screenshotUrl: 'https://api.screenshot.rocks/render?url=https://my-portfolio.netlify.app&width=1920&height=1080',
    fallbackScreenshots: [
      'https://image.thum.io/get/width/1920/crop/1080/https://my-portfolio.netlify.app',
    ]
  },
];

export async function GET() {
  try {
    const NETLIFY_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

    // If no token, return mock data
    if (!NETLIFY_TOKEN) {
      console.warn('No NETLIFY_ACCESS_TOKEN found, using mock data');
      return NextResponse.json({
        success: true,
        sites: MOCK_SITES,
        note: 'Using mock data - add NETLIFY_ACCESS_TOKEN to .env.local for real data'
      });
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
    });
  } catch (error) {
    console.error('Error fetching Netlify sites:', error);
    
    // Return mock data on error
    return NextResponse.json({
      success: true,
      sites: MOCK_SITES,
      note: 'Error fetching from Netlify API, using mock data'
    });
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
