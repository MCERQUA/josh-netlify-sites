# Quick Reference

## Essential Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NETLIFY_ACCESS_TOKEN` | Yes | Your Netlify personal access token |
| `APIFLASH_KEY` | No | ApiFlash API key for better screenshots |

## File Structure Quick Guide

```
├── app/
│   ├── page.tsx              # Main gallery page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/netlify/
│       ├── sites/route.ts    # Fetch sites API
│       └── exclude/route.ts  # Exclude sites API
│
├── components/
│   ├── button.tsx            # Button component
│   ├── site-card.tsx         # Grid view card
│   └── site-list-item.tsx    # List view item
│
├── .env.local                # Your environment variables (create this)
└── package.json              # Dependencies and scripts
```

## Common Tasks

### Change Colors

Edit `app/globals.css` - look for the `:root` and `.dark` sections

### Modify Screenshot Service

Edit `app/api/netlify/sites/route.ts` - function `generateScreenshotUrl()`

### Add Custom Filtering

Edit `app/page.tsx` - look for the `filteredAndSortedSites` variable

### Change Grid Layout

Edit `app/page.tsx` - find the className `grid grid-cols-1 sm:grid-cols-2...`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/netlify/sites` | GET | Fetch all Netlify sites |
| `/api/netlify/exclude` | POST | Exclude a site from gallery |

## Deployment URLs

| Platform | Default URL Pattern |
|----------|-------------------|
| Vercel | `your-project.vercel.app` |
| Netlify | `your-site.netlify.app` |
| DigitalOcean | `your-app.ondigitalocean.app` |

## Get Help

- 📚 [Full README](README.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🐛 Check browser console for errors
- 📝 Check server logs for API errors

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Sites not loading | Check `NETLIFY_ACCESS_TOKEN` in `.env.local` |
| Build fails | Verify Node.js 18+ installed |
| Screenshots broken | Try ApiFlash or wait for rate limits to reset |
| Can't find .env.local | Copy from `.env.example` |

## Performance Tips

1. **Enable ApiFlash** - Much more reliable than free services
2. **Use caching** - Screenshots are automatically cached
3. **Limit sites** - Use the exclude feature for unwanted sites
4. **Deploy to CDN** - Vercel and Netlify have global CDNs

## Security Notes

- Never commit `.env.local` to Git
- Keep your Netlify token private
- Use environment variables in deployment platforms
- Regularly rotate access tokens

---

**Quick Reference v1.0**
