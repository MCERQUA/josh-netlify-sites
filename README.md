# Netlify Domains Showcase

A beautiful, standalone web application that displays all your Netlify-hosted domains in a gallery format. Features include grid/list views, search functionality, sorting options, and automatic screenshot generation.

![Netlify Domains Showcase](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)

## Features

✨ **Beautiful Gallery Display**
- Grid and list view modes
- Automatic website screenshots
- Responsive design for all devices

🔍 **Search & Filter**
- Real-time search across domain names
- Sort by name, date, or domain
- Hide/exclude specific sites

🎨 **Modern UI**
- Clean, professional design
- Smooth transitions and hover effects
- Dark mode support

🚀 **Easy Deployment**
- Deploy to Vercel, Netlify, or any Node.js host
- Automatic updates from Netlify API
- Simple environment configuration

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Netlify account with an access token

### Installation

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Netlify access token:
   ```
   NETLIFY_ACCESS_TOKEN=your_netlify_access_token_here
   ```

   To get your Netlify access token:
   - Go to https://app.netlify.com/user/applications#personal-access-tokens
   - Click "New access token"
   - Give it a name and click "Generate token"
   - Copy the token and paste it in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to http://localhost:3000

## Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add your `NETLIFY_ACCESS_TOKEN` in the environment variables
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deploy to Netlify

You can also deploy this to Netlify itself:

1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" > "Import an existing project"
4. Select your repository
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Add your `NETLIFY_ACCESS_TOKEN` in environment variables
8. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to:
- AWS Amplify
- DigitalOcean App Platform
- Railway
- Render
- Any Node.js hosting service

## Configuration

### Screenshot Services

By default, the app uses free screenshot services. For better quality, you can:

1. **Use ApiFlash** (recommended)
   - Sign up at https://apiflash.com/
   - Add your API key to `.env.local`:
     ```
     APIFLASH_KEY=your_apiflash_key_here
     ```

2. **Use other services**
   
   Edit `app/api/netlify/sites/route.ts` to add your preferred screenshot service.

### Customization

**Change the color scheme:**
- Edit `app/globals.css` to customize the color variables

**Modify the layout:**
- Edit `app/page.tsx` to change the page structure
- Edit components in `/components` to modify individual elements

**Add custom filtering:**
- Edit the filter logic in `app/page.tsx`

## Project Structure

```
netlify-domains-showcase/
├── app/
│   ├── api/
│   │   └── netlify/
│   │       ├── sites/
│   │       │   └── route.ts       # Fetch sites from Netlify API
│   │       └── exclude/
│   │           └── route.ts       # Exclude sites functionality
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page with gallery
├── components/
│   ├── button.tsx                 # Reusable button component
│   ├── site-card.tsx              # Grid view card
│   └── site-list-item.tsx         # List view item
├── .env.example                   # Environment variables template
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## Features Explained

### Grid vs List View

Switch between two view modes:
- **Grid**: Beautiful card-based layout with screenshots
- **List**: Compact list with essential information

### Search

The search bar filters sites by:
- Domain name
- Custom domain (if configured)
- Site name

### Sort Options

Sort your sites by:
- **Name**: Alphabetical order
- **Date**: Most recently created first
- **Domain**: Alphabetical by domain name

### Hide Sites

Click the eye icon on any site to hide it from the gallery. Hidden sites are stored locally and persist between sessions.

## Troubleshooting

### "Failed to fetch sites"

- Verify your `NETLIFY_ACCESS_TOKEN` is correct
- Check that the token has the necessary permissions
- Make sure you have sites in your Netlify account

### Screenshots not loading

- The free screenshot services can be slow or rate-limited
- Consider signing up for ApiFlash for better reliability
- Screenshots are cached, so they'll load faster on subsequent visits

### Build errors

- Make sure you're using Node.js 18 or higher
- Delete `node_modules` and `.next` folders and reinstall:
  ```bash
  rm -rf node_modules .next
  npm install
  ```

## Contributing

This is a standalone project extracted from your Josh-AI system. Feel free to customize it for your needs!

## License

This project is open source and available for your personal use.

## Support

For questions or issues with this project, please refer to the original Josh-AI repository or modify as needed for your use case.

---

**Made with ❤️ for showcasing your awesome Netlify domains!**
