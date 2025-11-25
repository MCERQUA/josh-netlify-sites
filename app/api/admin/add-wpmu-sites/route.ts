import { NextResponse } from 'next/server';
import postgres from 'postgres';

// WPMU domains using wpdns.host nameservers
const WPMU_DOMAINS = [
  // ns1.wpdns.host
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
  // ns2.wpdns.host
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
  // ns3.wpdns.host
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
];

// GET handler - shows a simple UI
export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add WPMU Sites</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #00d4aa 0%, #00a080 100%);
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
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { font-size: 28px; margin-bottom: 10px; color: #1a202c; }
    p { color: #718096; margin-bottom: 20px; line-height: 1.6; }
    .count { font-size: 48px; font-weight: bold; color: #00a080; text-align: center; margin: 20px 0; }
    .domains {
      max-height: 200px;
      overflow-y: auto;
      background: #f7fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      font-size: 12px;
      color: #4a5568;
    }
    button {
      width: 100%;
      background: linear-gradient(135deg, #00d4aa 0%, #00a080 100%);
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
      box-shadow: 0 10px 20px rgba(0, 212, 170, 0.4);
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .status {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      display: none;
    }
    .status.success { background: #c6f6d5; color: #22543d; border: 1px solid #9ae6b4; }
    .status.error { background: #fed7d7; color: #742a2a; border: 1px solid #fc8181; }
    .status.loading { background: #bee3f8; color: #2c5282; border: 1px solid #90cdf4; }
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
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <h1>Add WPMU Sites</h1>
    <p>Add all domains using WordPress WPMU (wpdns.host) nameservers to the gallery database.</p>
    <div class="count">${WPMU_DOMAINS.length}</div>
    <p style="text-align: center; margin-top: -10px;">WPMU Domains</p>
    <div class="domains">
      ${WPMU_DOMAINS.map(d => `<div>${d}</div>`).join('')}
    </div>
    <button id="addBtn" onclick="addSites()">Add All WPMU Sites</button>
    <div id="status" class="status"></div>
  </div>

  <script>
    async function addSites() {
      const btn = document.getElementById('addBtn');
      const status = document.getElementById('status');

      btn.disabled = true;
      btn.textContent = 'Adding...';
      status.style.display = 'block';
      status.className = 'status loading';
      status.innerHTML = '<span class="spinner"></span>Adding WPMU sites to database...';

      try {
        const response = await fetch('/api/admin/add-wpmu-sites', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
          status.className = 'status success';
          status.innerHTML = '✅ Success! Added ' + data.added + ' sites. Skipped ' + data.skipped + ' existing.';
          btn.textContent = 'Complete';
          setTimeout(() => { window.location.href = '/'; }, 2000);
        } else {
          throw new Error(data.message || 'Failed to add sites');
        }
      } catch (error) {
        status.className = 'status error';
        status.innerHTML = '❌ Error: ' + error.message;
        btn.disabled = false;
        btn.textContent = 'Retry';
      }
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

// POST handler - adds the WPMU sites
export async function POST() {
  try {
    const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 400 });
    }

    const sql = postgres(DATABASE_URL, { ssl: 'require' });

    try {
      // Ensure sites table exists
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

      // Add source column if it doesn't exist
      try {
        await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'netlify'`;
      } catch (e) {
        // Column might already exist
      }

      let added = 0;
      let skipped = 0;

      for (const domain of WPMU_DOMAINS) {
        // Check if domain already exists
        const existing = await sql`SELECT id FROM sites WHERE id = ${domain} OR custom_domain = ${domain}`;

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Generate a friendly name from the domain
        const name = domain
          .replace(/\.(com|io|co|llc)$/, '')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        await sql`
          INSERT INTO sites (id, name, url, custom_domain, netlify_created_at, source)
          VALUES (
            ${domain},
            ${name},
            ${'https://' + domain},
            ${domain},
            ${new Date().toISOString()},
            'wpmu'
          )
        `;
        added++;
      }

      await sql.end();

      return NextResponse.json({
        success: true,
        message: 'WPMU sites added successfully',
        added,
        skipped,
        total: WPMU_DOMAINS.length
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('Error adding WPMU sites:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to add WPMU sites',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
