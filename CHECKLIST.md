# Setup Checklist

Use this checklist to get your Netlify Domains Showcase up and running!

## ☑️ Pre-Setup

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Netlify account created
- [ ] At least one site deployed on Netlify
- [ ] Git installed (for deployment)

## ☑️ Local Setup

### 1. Initial Setup
- [ ] Navigate to project folder: `cd netlify-domains-showcase`
- [ ] Install dependencies: `npm install`
- [ ] Wait for installation to complete (may take 2-5 minutes)

### 2. Configuration
- [ ] Copy environment file: `cp .env.example .env.local`
- [ ] Open `.env.local` in text editor
- [ ] Go to https://app.netlify.com/user/applications#personal-access-tokens
- [ ] Click "New access token"
- [ ] Name it (e.g., "Domains Showcase")
- [ ] Copy the generated token
- [ ] Paste token into `.env.local` as `NETLIFY_ACCESS_TOKEN`
- [ ] Save `.env.local`

### 3. First Run
- [ ] Start dev server: `npm run dev`
- [ ] Wait for "Ready" message
- [ ] Open http://localhost:3000 in browser
- [ ] Verify sites are loading
- [ ] Test search functionality
- [ ] Try switching between grid and list views
- [ ] Test sorting options

## ☑️ Customization (Optional)

### Branding
- [ ] Update title in `app/layout.tsx` (line 5-6)
- [ ] Modify header text in `app/page.tsx` (line 90-91)
- [ ] Change colors in `app/globals.css` (lines 7-40)

### Screenshots
- [ ] Sign up for ApiFlash (optional): https://apiflash.com/
- [ ] Add `APIFLASH_KEY` to `.env.local`
- [ ] Test screenshot quality improvement

### Features
- [ ] Review sorting options in `app/page.tsx` (lines 50-60)
- [ ] Modify grid layout in `app/page.tsx` (line 141)
- [ ] Customize card appearance in `components/site-card.tsx`

## ☑️ Testing

### Local Testing
- [ ] All sites display correctly
- [ ] Screenshots load (or show retry button)
- [ ] Search works for domain names
- [ ] Sort options function correctly
- [ ] Grid/list toggle works
- [ ] Hide button functions properly
- [ ] Mobile view looks good (resize browser)
- [ ] No console errors

### Performance
- [ ] Page loads in <3 seconds
- [ ] Screenshots appear progressively
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling

## ☑️ Deployment Preparation

### Code Repository
- [ ] Create GitHub repository
- [ ] Initialize git: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Add remote: `git remote add origin <your-repo-url>`
- [ ] Push: `git push -u origin main`

### Documentation Review
- [ ] Read DEPLOYMENT.md
- [ ] Choose deployment platform
- [ ] Note platform-specific requirements
- [ ] Prepare environment variables

## ☑️ Deployment

### Choose Your Platform
Pick one and complete its checklist:

#### Option A: Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Import your repository
- [ ] Add environment variables:
  - [ ] `NETLIFY_ACCESS_TOKEN`
  - [ ] `APIFLASH_KEY` (if you have one)
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Click the deployment URL to test

#### Option B: Netlify
- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import existing project"
- [ ] Connect to GitHub
- [ ] Select repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `.next`
- [ ] Add environment variables:
  - [ ] `NETLIFY_ACCESS_TOKEN`
  - [ ] `APIFLASH_KEY` (if you have one)
- [ ] Click "Deploy site"
- [ ] Wait for build
- [ ] Test the live URL

#### Option C: DigitalOcean
- [ ] Go to https://cloud.digitalocean.com/apps
- [ ] Click "Create App"
- [ ] Connect to GitHub
- [ ] Select repository
- [ ] Configure build:
  - [ ] Build command: `npm run build`
  - [ ] Run command: `npm start`
- [ ] Add environment variables
- [ ] Review and create
- [ ] Test deployed URL

#### Option D: Self-Hosted
- [ ] SSH into your server
- [ ] Install Node.js 18+
- [ ] Install PM2: `npm install -g pm2`
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Create `.env.local` with variables
- [ ] Build: `npm run build`
- [ ] Start: `pm2 start npm --name "netlify-showcase" -- start`
- [ ] Configure nginx (see DEPLOYMENT.md)
- [ ] Set up SSL with certbot
- [ ] Test domain

## ☑️ Post-Deployment

### Verification
- [ ] Open deployed URL
- [ ] Verify all sites load
- [ ] Test all features work
- [ ] Check on mobile device
- [ ] Test in different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

### Configuration
- [ ] Set custom domain (optional)
- [ ] Configure DNS (if using custom domain)
- [ ] Set up SSL certificate (if not automatic)
- [ ] Configure deployment notifications

### Monitoring
- [ ] Set up UptimeRobot or similar
- [ ] Configure error alerts
- [ ] Enable analytics (optional)
- [ ] Monitor performance

## ☑️ Maintenance

### Regular Tasks
- [ ] Review hidden sites list
- [ ] Check for Netlify API changes
- [ ] Update dependencies monthly:
  ```bash
  npm update
  npm audit fix
  ```
- [ ] Review error logs
- [ ] Monitor screenshot service usage

### Updates
- [ ] Pull latest code: `git pull`
- [ ] Install new dependencies: `npm install`
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Deploy updates

## ☑️ Troubleshooting Checklist

If something isn't working:

### Sites not loading
- [ ] Check `.env.local` exists
- [ ] Verify `NETLIFY_ACCESS_TOKEN` is correct
- [ ] Check token permissions on Netlify
- [ ] Review browser console for errors
- [ ] Check server logs

### Build failing
- [ ] Verify Node.js version: `node --version` (should be 18+)
- [ ] Clear cache: `rm -rf .next node_modules`
- [ ] Reinstall: `npm install`
- [ ] Check environment variables on platform

### Screenshots broken
- [ ] Check screenshot service is up
- [ ] Try ApiFlash if using free service
- [ ] Check rate limits
- [ ] Look for 404/timeout errors in Network tab

### Performance issues
- [ ] Enable ApiFlash
- [ ] Check server resources
- [ ] Review error logs
- [ ] Test network speed
- [ ] Check CDN status

## ☑️ Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit `.env.local` to Git
- [ ] Use environment variables on deployment platform
- [ ] Keep Netlify token secret
- [ ] Regularly rotate access tokens
- [ ] Monitor for unauthorized access
- [ ] Keep dependencies updated
- [ ] Review npm audit results

## ☑️ Documentation Review

- [ ] Read README.md
- [ ] Review QUICKREF.md
- [ ] Understand ARCHITECTURE.md
- [ ] Follow DEPLOYMENT.md for your platform
- [ ] Check PROJECT-SUMMARY.md for overview
- [ ] Bookmark DOCS-INDEX.md for reference

## 📊 Completion Status

Track your progress:

```
Total Tasks: ~100
Completed: ___
Remaining: ___
Status: [ ] Not Started  [ ] In Progress  [ ] Complete
```

## 🎉 Success!

When all critical checkboxes are complete, you should have:
- ✅ Working local development environment
- ✅ Customized to your preferences
- ✅ Successfully deployed to production
- ✅ Fully tested and verified
- ✅ Monitoring in place

**Congratulations! Your Netlify Domains Showcase is live! 🚀**

---

## Quick Commands Reference

```bash
# Local development
npm install
npm run dev
npm run build
npm start

# Git operations
git status
git add .
git commit -m "message"
git push

# Deployment check
npm run build      # Test build locally
npm run lint       # Check for issues
```

## Need Help?

- Review troubleshooting sections in relevant docs
- Check [DOCS-INDEX.md](DOCS-INDEX.md) for specific topics
- Review error messages in console/logs
- Test in different browsers
- Start fresh if needed (delete node_modules, reinstall)

---

**Save this checklist and mark off items as you complete them!**

**Last Updated**: November 21, 2025
