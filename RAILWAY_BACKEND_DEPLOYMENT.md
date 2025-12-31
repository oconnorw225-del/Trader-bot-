# Railway Backend Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the NDAX Quantum Engine backend through Railway App.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Required environment variables configured in Railway dashboard

## Deployment Architecture

```
GitHub Repository → Railway Build → Node.js Backend (Port 3000+)
                                   └─> Health Check: /api/health
```

## Configuration Files

### 1. `railway.json` - Railway Service Configuration
- Defines build and deployment settings
- Specifies health check endpoint
- Configures restart policies

### 2. `railway.toml` - Environment Configuration
- Sets environment variables
- PORT is dynamically assigned by Railway (do not hardcode)

### 3. `nixpacks.toml` - Build Configuration
- Defines build phases: setup, install, build
- Installs Node.js 18.x and Python 3.10
- Installs npm and pip dependencies
- Runs Vite build process

### 4. `Procfile` - Process Definition
- Defines the web process
- Uses `npm run start:production` command

### 5. `scripts/start-production.sh` - Startup Script
- Handles Railway environment detection
- Skips local .env.production when on Railway
- Starts Node.js server with dynamic PORT
- Simplified for Railway (Node.js only, Python optional)

## Key Features

### ✅ Dynamic PORT Assignment
Railway assigns PORT dynamically. The backend automatically uses `process.env.PORT` without hardcoding.

### ✅ Public Health Check
The `/api/health` endpoint is public (no authentication required) to allow Railway health checks.

```javascript
// Health endpoint defined BEFORE auth middleware
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});
```

### ✅ Protected API Endpoints
All other `/api/*` endpoints require JWT authentication.

### ✅ Railway Environment Detection
Startup script automatically detects Railway environment and adapts configuration.

```bash
if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then
  exec node backend/nodejs/server.js
fi
```

## Deployment Process

### Step 1: Configure Railway Project

1. **Create Railway Project:**
   ```
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   ```

2. **Configure Environment Variables:**
   Set these in Railway dashboard (Settings → Environment Variables):
   ```
   NODE_ENV=production
   RAILWAY_ENVIRONMENT=production
   
   # Security
   JWT_SECRET=<your-jwt-secret>
   ENCRYPTION_KEY=<your-encryption-key>
   SESSION_SECRET=<your-session-secret>
   
   # Trading (Optional)
   NDAX_API_KEY=<your-api-key>
   NDAX_API_SECRET=<your-api-secret>
   NDAX_USER_ID=<your-user-id>
   NDAX_ACCOUNT_ID=<your-account-id>
   
   # Authentication
   REQUIRE_AUTH=true
   ACCESS_PASSWORD=<your-password>
   ```

3. **Configure Health Check:**
   ```
   - Path: /api/health
   - Timeout: 300 seconds
   - Restart Policy: ON_FAILURE
   - Max Retries: 10
   ```

### Step 2: Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Railway deployment"
   git push origin main
   ```

2. **Railway Auto-Deploy:**
   - Railway detects the push
   - Runs build: `npm ci && pip install && npm run build`
   - Starts server: `npm run start:production`
   - Health check verifies deployment

3. **Monitor Deployment:**
   - Go to Railway dashboard
   - View deployment logs
   - Check health check status (should be green)

### Step 3: Verify Deployment

1. **Test Health Endpoint:**
   ```bash
   curl https://your-app.up.railway.app/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-31T...",
     "uptime": 123.456,
     "version": "1.0.0"
   }
   ```

2. **Test Authentication:**
   ```bash
   # Should require auth
   curl https://your-app.up.railway.app/api/stats
   ```
   
   Expected response:
   ```json
   {
     "success": false,
     "message": "Authentication required"
   }
   ```

3. **Test Frontend:**
   ```bash
   curl -I https://your-app.up.railway.app/
   ```
   
   Should return 200 OK with HTML content.

## Build Process Details

### Phase 1: Setup (nixpacks.toml)
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "python310", "pip"]
```
Installs Node.js 18.x, Python 3.10, and pip.

### Phase 2: Install Dependencies
```toml
[phases.install]
cmds = [
  "npm ci --omit=dev --ignore-scripts || npm install",
  "pip install --no-cache-dir -r requirements.txt"
]
```
- Installs Node.js dependencies (production only)
- Installs Python dependencies (Flask, etc.)

### Phase 3: Build Frontend
```toml
[phases.build]
cmds = [
  "npm run build"
]
```
Runs Vite build to create optimized production bundle in `dist/` directory.

### Phase 4: Start Server
```toml
[start]
cmd = "npm run start:production"
```
Executes startup script which:
1. Detects Railway environment
2. Configures PORT from Railway
3. Creates necessary directories
4. Starts Node.js server

## Troubleshooting

### Build Fails: "vite: not found"
**Solution:** Ensure `npm install` runs before `npm run build` in nixpacks.toml.

### Build Fails: "pip: not found"
**Solution:** Add "pip" to nixPkgs in nixpacks.toml setup phase.

### Health Check Fails: 401 Unauthorized
**Solution:** Ensure health endpoint is defined BEFORE auth middleware in server.js.

### Port Binding Error: "EADDRINUSE"
**Solution:** Remove hardcoded PORT from `.env.production` and `railway.toml`. Let Railway assign dynamically.

### Service Crashes: "Cannot find module"
**Solution:** Check that all dependencies are in `dependencies` (not `devDependencies`) in package.json for production builds.

### Environment Variables Not Set
**Solution:** Configure environment variables in Railway dashboard, not in code files.

## Performance Optimization

### Build Cache
Railway caches `node_modules` and `pip packages` between builds for faster deployment.

### Production Dependencies Only
Use `npm ci --omit=dev` to install only production dependencies, reducing build time and image size.

### Minified Assets
Vite build creates minified, optimized assets with source maps for production.

## Security Checklist

- [x] Health endpoint is public (required for monitoring)
- [x] All other API endpoints require authentication
- [x] Sensitive data in environment variables (not in code)
- [x] HTTPS enabled by Railway (automatic)
- [x] CORS configured properly
- [x] Rate limiting enabled
- [x] Helmet.js for security headers

## Monitoring

### Railway Dashboard
- View deployment logs
- Monitor CPU/memory usage
- Check health check status
- View application logs

### Health Check Endpoint
- URL: `https://your-app.up.railway.app/api/health`
- Returns server status, uptime, and version
- Used by Railway for health monitoring

### Application Logs
Access logs in Railway dashboard or via CLI:
```bash
railway logs
```

## Scaling

Railway automatically handles:
- Load balancing
- Auto-scaling based on traffic
- Zero-downtime deployments
- Automatic SSL certificates

## Cost Optimization

- Use Railway's free tier for development/testing
- Monitor resource usage in dashboard
- Optimize build process to reduce build minutes
- Use caching to speed up builds

## Support

- **Railway Docs:** https://docs.railway.app
- **Repository:** https://github.com/oconnorw225-del/Trader-bot-
- **Railway Project:** https://railway.com/project/129fdd00-75a1-4505-a902-151247eb94d1

## Success Indicators

When deployment is successful:

1. ✅ Build completes without errors (~2-5 minutes)
2. ✅ Server starts and binds to Railway PORT
3. ✅ Health check passes (green indicator)
4. ✅ Application accessible via Railway URL
5. ✅ API endpoints respond correctly
6. ✅ Frontend loads and displays properly
7. ✅ No errors in deployment logs

## Additional Notes

- **Database:** Configure DATABASE_URL in Railway if using PostgreSQL
- **Redis:** Add Redis service in Railway if needed for caching
- **Python Backend:** Currently Node.js only; Python backend can be added as separate service
- **WebSocket:** Available on port 8080 (if enabled)
- **Custom Domain:** Configure in Railway dashboard Settings → Domains

---

**Last Updated:** 2025-12-31  
**Status:** ✅ Production Ready  
**Version:** 2.1.0
