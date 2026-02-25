# Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for React Frontend)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Or connect via GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite and deploy

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Or connect via GitHub:**
   - Go to [netlify.com](https://netlify.com)
   - Import your GitHub repository
   - Use the `netlify.toml` configuration

**Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: Traditional Hosting (cPanel, etc.)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server's public directory

3. **Configure your server** to serve `index.html` for all routes (SPA routing)

## 🔧 Environment Variables

If you need to configure API URLs, create a `.env` file:

```env
VITE_API_URL=https://your-api-url.com
```

Then update `src/services/api.ts` to use this variable.

## 📝 Important Notes

1. **Backend API:** The PHP backend needs to be deployed separately on a PHP-compatible server
2. **CORS:** Make sure your backend allows requests from your frontend domain
3. **Routing:** All hosting platforms need to be configured to serve `index.html` for client-side routing
4. **Build:** Always test the build locally with `npm run build` before deploying

## 🐛 Troubleshooting

### Build Fails
- Run `npm run build` locally to see errors
- Make sure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run lint`

### 404 Errors on Routes
- Ensure your hosting platform is configured to serve `index.html` for all routes
- Check the rewrite rules in `vercel.json` or `netlify.toml`

### API Connection Issues
- Update API URL in `src/services/api.ts`
- Check CORS settings on your backend
- Verify backend is running and accessible

