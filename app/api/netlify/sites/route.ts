import { NextResponse } from 'next/server';
import postgres from 'postgres';

// Force dynamic to prevent caching - ensures excluded sites are filtered fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// WPMU domains using wpdns.host nameservers
const WPMU_DOMAINS = new Set([
  'barndominiuminsurance.com',
  'bedlinerinsurance.com',
  'contractorinsurance.io',
  'customhomefinancing.com',
  'fencinginsurance.com',
  'foamdistributor.com',
  'foameverything.com',
  'jeepnamegenerator.com',
  'northernarizonainsurance.com',
  'sprayfoam101.com',
  'sprayfoaminsurance.com',
  'stormrestorationinsurance.com',
  'toterhomeinsurance.com',
  'wickenburginsurance.com',
  'americanmadeinsurance.com',
  'austinconcreteco.com',
  'barndominiumfinancing.com',
  'barndominiuminsulation.com',
  'coatinginsurance.com',
  'coatingsinsurance.com',
  'coloradoconcreterepair.com',
  'dieselrepairaz.com',
  'foamtechsprayfoam.com',
  'hairphdsalon.com',
  'importcarinsurance.co',
  'maricopalandscaping.com',
  'northernlegacysprayfoam.com',
  'roofinginsurance.com',
  'sprayfoamrentalrig.com',
  'ssvinsurance.com',
  'tinyhomeinsulation.com',
  'tracthomecontractorinsurance.com',
  'wakeboatinsurance.com',
  'youngconstruction.llc',
  'brrrrinsurance.com',
  'countrysidefinancing.com',
  'denverconcreterepair.com',
  'pikespeakconcreterepair.com',
  'pontooninsurance.com',
  'rzrinsurance.com',
  'sedonainsurance.com',
  'solarcontractorinsurance.com',
  'sprayfoaminsulationscottsdale.com',
  'sunlakesinsurance.com',
  'thrillmotorsports.com',
  'toyhaulerinsurance.com',
  'tracthomeinsurance.com',
]);

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

      // Check if excluded_sites table exists
      const excludedTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'excluded_sites'
        )
      `;

      // Query sites from database, optionally excluding hidden sites
      // Use explicit column names to avoid cached plan issues after schema changes
      let sites;
      if (excludedTableExists[0]?.exists) {
        // Filter out excluded sites
        sites = await sql`
          SELECT s.id, s.name, s.url, s.custom_domain, s.created_at, s.updated_at,
                 s.netlify_created_at, s.netlify_updated_at, COALESCE(s.source, 'netlify') as source,
                 s.screenshot_url, s.screenshot_updated_at
          FROM sites s
          LEFT JOIN excluded_sites e ON s.id = e.site_id
          WHERE e.site_id IS NULL
          ORDER BY s.created_at DESC
        `;
      } else {
        // No exclusions yet, return all sites
        sites = await sql`
          SELECT id, name, url, custom_domain, created_at, updated_at,
                 netlify_created_at, netlify_updated_at, COALESCE(source, 'netlify') as source,
                 screenshot_url, screenshot_updated_at
          FROM sites
          ORDER BY created_at DESC
        `;
      }

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
      const transformedSites = sites.map((site: any) => {
        const domain = extractDomain(site.custom_domain || site.url);
        const isWpmu = WPMU_DOMAINS.has(domain);
        const isNetlifySub = site.url?.includes('.netlify.app');
        const isDotCom = domain.endsWith('.com');

        // Use stored screenshot if available, otherwise generate one
        const storedScreenshot = site.screenshot_url;
        const generatedScreenshot = generateScreenshotUrl(site.custom_domain || site.url);

        return {
          id: site.id,
          name: site.name,
          url: site.url,
          customDomain: site.custom_domain,
          createdAt: site.netlify_created_at || site.created_at,
          updatedAt: site.netlify_updated_at || site.updated_at,
          // Use stored screenshot (cached), fallback to generated if none stored yet
          screenshotUrl: storedScreenshot || generatedScreenshot,
          screenshotUpdatedAt: site.screenshot_updated_at,
          hasStoredScreenshot: !!storedScreenshot,
          // Keep fallback for error handling in frontend
          fallbackScreenshots: generateFallbackScreenshots(site.custom_domain || site.url),
          hostingType: isWpmu ? 'wpmu' : 'netlify',
          isNetlifySub,
          isDotCom,
        };
      });

      await sql.end();

      const response = NextResponse.json({
        success: true,
        sites: transformedSites,
        total: transformedSites.length,
        source: 'neon-database'
      });

      // Ensure no caching - critical for excluded sites to persist
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
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

function extractDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return '';
  // Remove protocol if present
  let domain = urlOrDomain.replace(/^https?:\/\//, '');
  // Remove path if present
  domain = domain.split('/')[0];
  // Remove www. prefix
  domain = domain.replace(/^www\./, '');
  return domain.toLowerCase();
}

function ensureProtocol(url: string): string {
  if (!url) return '';
  // If URL already has protocol, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Add https:// if missing
  return `https://${url}`;
}

function generateScreenshotUrl(url: string): string {
  if (!url) return '';

  const fullUrl = ensureProtocol(url);

  const apiflashKey = process.env.APIFLASH_KEY;
  if (apiflashKey) {
    const params = new URLSearchParams({
      access_key: apiflashKey,
      url: fullUrl,
      width: '1920',
      height: '1080',
      delay: '2',
      fresh: 'false',
    });
    return `https://api.apiflash.com/v1/urltoimage?${params}`;
  }

  return `https://api.screenshot.rocks/render?url=${encodeURIComponent(fullUrl)}&width=1920&height=1080`;
}

function generateFallbackScreenshots(url: string): string[] {
  if (!url) return [];

  const fullUrl = ensureProtocol(url);

  return [
    `https://image.thum.io/get/width/1920/crop/1080/${fullUrl}`,
  ];
}
