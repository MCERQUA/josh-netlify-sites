# Deployment Guide

This guide will help you deploy your Netlify Domains Showcase to various hosting platforms.

## Table of Contents

- [Vercel (Recommended)](#vercel-recommended)
- [Netlify](#netlify)
- [DigitalOcean](#digitalocean)
- [Your Own Server](#your-own-server)

---

## Vercel (Recommended)

Vercel is the easiest platform to deploy Next.js applications.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/netlify-domains-showcase.git
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub
   - Click "Add New..." > "Project"

3. **Import your repository**
   - Select your GitHub repository
   - Vercel will auto-detect it's a Next.js app

4. **Configure environment variables**
   - Click "Environment Variables"
   - Add:
     - Name: `NETLIFY_ACCESS_TOKEN`
     - Value: Your Netlify access token
   - (Optional) Add `APIFLASH_KEY` if you have one

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `your-project.vercel.app`

6. **Add custom domain (optional)**
   - Go to Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

---

## Netlify

Yes, you can host this on Netlify itself!

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/netlify-domains-showcase.git
   git push -u origin main
   ```

2. **Go to Netlify**
   - Visit https://app.netlify.com
   - Click "Add new site" > "Import an existing project"

3. **Connect to GitHub**
   - Authorize Netlify to access your GitHub
   - Select your repository

4. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: (leave empty)

5. **Add environment variables**
   - Click "Advanced build settings"
   - Add environment variable:
     - Key: `NETLIFY_ACCESS_TOKEN`
     - Value: Your Netlify access token
   - (Optional) Add `APIFLASH_KEY`

6. **Deploy**
   - Click "Deploy site"
   - Wait for the build
   - Your site will be live at `random-name.netlify.app`

7. **Change site name (optional)**
   - Go to Site settings > Site details
   - Click "Change site name"

---

## DigitalOcean

Deploy using DigitalOcean's App Platform.

### Steps:

1. **Push your code to GitHub** (same as above)

2. **Go to DigitalOcean**
   - Visit https://cloud.digitalocean.com/apps
   - Click "Create App"

3. **Connect to GitHub**
   - Select GitHub
   - Choose your repository
   - Click "Next"

4. **Configure the app**
   - Name: `netlify-domains-showcase`
   - Region: Choose closest to you
   - Branch: `main`
   - Click "Next"

5. **Configure build**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - HTTP Port: `3000`

6. **Add environment variables**
   - Click "Edit" next to Environment Variables
   - Add:
     - `NETLIFY_ACCESS_TOKEN` = your token
     - (Optional) `APIFLASH_KEY` = your key

7. **Review and deploy**
   - Review your settings
   - Click "Create Resources"
   - Wait for deployment

---

## Your Own Server

Deploy to your own VPS or server running Node.js.

### Requirements:

- Ubuntu 20.04+ (or similar Linux)
- Node.js 18+
- nginx (for reverse proxy)
- PM2 (for process management)

### Steps:

1. **Connect to your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone your repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/netlify-domains-showcase.git
   cd netlify-domains-showcase
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Create .env.local**
   ```bash
   nano .env.local
   ```
   
   Add:
   ```
   NETLIFY_ACCESS_TOKEN=your_token_here
   ```
   
   Save and exit (Ctrl+X, Y, Enter)

7. **Build the application**
   ```bash
   npm run build
   ```

8. **Start with PM2**
   ```bash
   pm2 start npm --name "netlify-showcase" -- start
   pm2 save
   pm2 startup
   ```

9. **Configure nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/netlify-showcase
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable the site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/netlify-showcase /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

11. **Set up SSL (optional but recommended)**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

### Updating your deployment:

```bash
cd /var/www/netlify-domains-showcase
git pull
npm install
npm run build
pm2 restart netlify-showcase
```

---

## Post-Deployment

After deploying to any platform:

1. **Test your site**
   - Open the URL
   - Verify sites are loading
   - Test search and filtering

2. **Monitor performance**
   - Check screenshot loading times
   - Monitor API response times
   - Look for any errors in logs

3. **Set up monitoring** (optional)
   - Use UptimeRobot or similar
   - Set up error tracking with Sentry

4. **Regular updates**
   - Pull latest code from Git
   - Update dependencies
   - Rebuild and redeploy

---

## Troubleshooting

### Build fails on deployment

- Check Node.js version (must be 18+)
- Verify all environment variables are set
- Check build logs for specific errors

### Sites not loading

- Verify NETLIFY_ACCESS_TOKEN is correct
- Check Netlify API is accessible from your host
- Look at API logs for error messages

### Screenshots not displaying

- Free screenshot services can be rate-limited
- Consider using ApiFlash for better reliability
- Check browser console for errors

---

## Need Help?

- Check the main README.md for troubleshooting tips
- Review hosting platform documentation
- Check Next.js deployment docs: https://nextjs.org/docs/deployment

---

**Happy deploying! 🚀**
