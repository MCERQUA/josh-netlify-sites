# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Netlify Domains Showcase UI                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Search   │  │    Sort    │  │ Grid/List  │    │  │
│  │  │    Bar     │  │  Options   │  │  Toggle    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │         Site Cards / List Items               │ │  │
│  │  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     │ │  │
│  │  │  │ Site │  │ Site │  │ Site │  │ Site │     │ │  │
│  │  │  │  #1  │  │  #2  │  │  #3  │  │  #4  │     │ │  │
│  │  │  └──────┘  └──────┘  └──────┘  └──────┘     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTP Requests
                    ↓
┌─────────────────────────────────────────────────────────────┐
│              Next.js Application Server                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   App Router                         │  │
│  │  ┌────────────────┐  ┌────────────────────────────┐ │  │
│  │  │  page.tsx      │  │      API Routes            │ │  │
│  │  │  (Main Page)   │  │  ┌──────────────────────┐  │ │  │
│  │  │                │  │  │ /api/netlify/sites   │  │ │  │
│  │  │  - Search      │  │  │  - Fetch sites       │  │ │  │
│  │  │  - Filter      │  │  │  - Transform data    │  │ │  │
│  │  │  - Sort        │  │  │  - Generate URLs     │  │ │  │
│  │  │  - Display     │  │  └──────────────────────┘  │ │  │
│  │  │                │  │  ┌──────────────────────┐  │ │  │
│  │  └────────────────┘  │  │ /api/netlify/exclude │  │ │  │
│  │                       │  │  - Save exclusions   │  │ │  │
│  │  Components          │  │  - Update JSON       │  │ │  │
│  │  ┌──────────────┐   │  └──────────────────────┘  │ │  │
│  │  │ SiteCard     │   │                              │ │  │
│  │  │ SiteListItem │   └──────────────────────────────┘ │  │
│  │  │ Button       │                                    │  │
│  │  └──────────────┘                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │ API Calls
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌────────────────────┐  ┌──────────────────────────────┐  │
│  │   Netlify API      │  │   Screenshot Services         │  │
│  │                    │  │                               │  │
│  │  - List sites      │  │  - ApiFlash (optional)        │  │
│  │  - Site details    │  │  - screenshot.rocks (free)    │  │
│  │  - Custom domains  │  │  - thum.io (free)            │  │
│  │                    │  │  - urlbox.io (optional)       │  │
│  └────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Site Loading Flow

```
User Opens Page
      ↓
Page.tsx loads
      ↓
useEffect triggers
      ↓
fetch('/api/netlify/sites')
      ↓
API Route Handler
      ↓
Fetch from Netlify API
      ↓
Transform site data
      ↓
Generate screenshot URLs
      ↓
Return JSON to frontend
      ↓
Update state (setSites)
      ↓
Render site cards/items
      ↓
Load screenshots
```

### 2. Search/Filter Flow

```
User types in search
      ↓
onChange event
      ↓
Update searchQuery state
      ↓
Re-run filter function
      ↓
filteredAndSortedSites updates
      ↓
Components re-render
      ↓
Display filtered results
```

### 3. Exclude Site Flow

```
User clicks hide button
      ↓
Confirm dialog
      ↓
POST to /api/netlify/exclude
      ↓
Read excluded-sites.json
      ↓
Add site ID to array
      ↓
Write updated JSON
      ↓
Return success
      ↓
Remove from UI state
      ↓
Update display
```

## Component Hierarchy

```
App
 └── Layout
      └── Page (Main Gallery)
           ├── Search Input
           ├── Sort Dropdown
           ├── View Toggle (Grid/List)
           └── Sites Container
                ├── Grid View
                │    └── SiteCard (multiple)
                │         ├── Screenshot
                │         ├── URL Link
                │         └── Hide Button
                │
                └── List View
                     └── SiteListItem (multiple)
                          ├── Icon
                          ├── URL Link
                          └── Hide Button
```

## File Responsibilities

### Frontend (app/)

- **page.tsx** - Main page logic, state management, filtering
- **layout.tsx** - Root layout, global styles import
- **globals.css** - Tailwind CSS and custom styles

### Components (components/)

- **button.tsx** - Reusable button with variants
- **site-card.tsx** - Grid view card with screenshot
- **site-list-item.tsx** - List view item, compact display

### API Routes (app/api/netlify/)

- **sites/route.ts** - Fetch and transform Netlify sites
- **exclude/route.ts** - Manage excluded sites

### Configuration

- **next.config.js** - Next.js settings, image domains
- **tailwind.config.js** - Tailwind theme, colors
- **tsconfig.json** - TypeScript settings
- **.env.local** - Environment variables (created by user)

## State Management

```
Page Component State:
┌─────────────────────────────────┐
│ sites: NetlifySite[]           │ ← All sites from API
│ loading: boolean                │ ← Loading state
│ viewMode: 'grid' | 'list'      │ ← Current view
│ sortMode: 'name' | 'date' ...  │ ← Sort option
│ searchQuery: string             │ ← Search text
└─────────────────────────────────┘
         ↓ Computed
┌─────────────────────────────────┐
│ filteredAndSortedSites          │ ← Derived state
└─────────────────────────────────┘
```

## API Integration

### Netlify API
- **Endpoint**: `https://api.netlify.com/api/v1/sites`
- **Auth**: Bearer token via `NETLIFY_ACCESS_TOKEN`
- **Response**: Array of site objects
- **Used for**: Fetching all site data

### Screenshot APIs
- **Primary**: ApiFlash (if key provided)
- **Fallback 1**: screenshot.rocks (free)
- **Fallback 2**: thum.io (free)
- **Fallback 3**: urlbox.io (if key provided)

## Deployment Architecture

```
GitHub Repository
      ↓
Deployment Platform
 (Vercel/Netlify/DO)
      ↓
Build Process
 - npm install
 - npm run build
      ↓
Production Server
 - Next.js server
 - API routes
      ↓
Global CDN
      ↓
End Users
```

## Security Considerations

1. **Environment Variables** - Tokens never exposed to client
2. **API Routes** - Server-side only, not in client bundle
3. **CORS** - Handled by Next.js automatically
4. **Rate Limiting** - Consider implementing for production
5. **Error Handling** - No sensitive data in error messages

## Performance Optimizations

1. **Static Generation** - Where possible
2. **Image Optimization** - Next.js Image component ready
3. **Screenshot Caching** - Via URL parameters
4. **Lazy Loading** - Images load on demand
5. **Client-side Filtering** - Fast, no server round-trips

---

**This architecture provides:**
- ✅ Clean separation of concerns
- ✅ Scalable structure
- ✅ Easy to maintain
- ✅ Simple to extend
- ✅ Production-ready
