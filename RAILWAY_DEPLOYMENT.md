# Railway Deployment Guide - NDAX Quantum Engine

## 🚀 Quick Deployment Steps

### Prerequisites
- GitHub repository connected to Railway
- Railway account at https://railway.app

### Step 1: Push to GitHub

```bash
# Stage all files
git add .

# Commit
git commit -m "Deploy: NDAX Quantum Engine with updated Railway configuration"

# Push to your branch (Railway will auto-deploy)
git push origin your-branch-name
```

### Step 2: Connect to Railway

1. Visit https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize GitHub and select your repository: `oconnorw225-del/ndax-quantum-engine`
5. Railway will auto-detect the configuration from `railway.json`

### Step 3: Environment Variables (Optional)

Railway will automatically set `PORT` and `NODE_ENV`. Additional optional variables:

```
NODE_ENV=production  # Auto-set by Railway
# PORT is automatically assigned by Railway - DO NOT set manually

# Optional API Keys (for full functionality)
ENCRYPTION_KEY=your_encryption_key_here
JWT_SECRET=your_jwt_secret_here

# Trading API (optional)
NDAX_API_KEY=your_api_key
NDAX_API_SECRET=your_api_secret

# Freelance Platforms (optional)
UPWORK_CLIENT_ID=your_client_id
FIVERR_API_KEY=your_api_key

# AI/ML Services (optional)
OPENAI_API_KEY=your_api_key
```

**Note**: The application works in demo mode without API keys. Environment variables are only needed for live trading/automation features.

### Step 4: Deploy

Railway auto-deploys when you push to your connected branch. Monitor deployment in the Railway dashboard.

### Step 5: Verify Deployment

Check these endpoints after deployment:

```bash
# Replace YOUR_APP_URL with your actual Railway deployment URL
# Example: https://ndax-quantum-engine-production.up.railway.app

# Health check (should return 200 OK)
curl https://YOUR_APP_URL/api/health

# Main dashboard (should return HTML)
curl https://YOUR_APP_URL/

# Stats endpoint
curl https://YOUR_APP_URL/api/stats

# Features endpoint
curl https://YOUR_APP_URL/api/features
```

Expected health check response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T01:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0"
}
```

## ✅ Expected Deployment Results

### Successful Deployment Indicators:

```
✅ Build completes successfully
✅ Server starts on Railway-assigned PORT
✅ Health endpoint returns 200 OK
✅ Dashboard loads with React app
✅ API endpoints respond correctly
✅ No port binding errors
✅ Logs show "NDAX Quantum Engine Backend running"
```

### Key Configuration Files:

- **`railway.json`** - Primary Railway configuration (build and deploy settings)
- **`railway.toml`** - Health check settings (complementary to railway.json)
- **`Procfile`** - Backup start command specification
- **`package.json`** - Node.js dependencies and scripts

### Build Process:

1. Railway detects `railway.json` configuration
2. Runs `npm ci && npm run build` (installs deps + builds frontend)
3. Starts server with `node backend/nodejs/server.js`
4. Server binds to Railway's assigned PORT
5. Health checks verify `/api/health` endpoint

## 🔧 Troubleshooting

### Build Fails

**Symptom**: Build fails with npm errors
**Solution**: 
```bash
# Check Railway logs for specific error
# Common causes:
# - Missing dependencies in package.json
# - Syntax errors in code
# - Build script failures

# Test locally:
npm ci
npm run build
```

### Server Won't Start

**Symptom**: Deploy succeeds but app crashes on startup
**Solution**:
- Check Railway logs for error messages
- Verify `backend/nodejs/server.js` exists
- Ensure no hardcoded port conflicts
- Confirm dist/ directory was built

### Health Check Fails

**Symptom**: Railway shows "Unhealthy" status
**Solution**:
- Verify `/api/health` endpoint is accessible
- Check if server is binding to correct PORT
- Ensure server starts within timeout period (120s)
- Review health check settings in `railway.toml`

### Port Binding Errors

**Symptom**: Error like "EADDRINUSE" or "port already in use"
**Solution**:
- DO NOT hardcode PORT in environment variables
- Server correctly uses `process.env.PORT || 3000`
- Railway assigns PORT automatically
- Remove any PORT override in Railway dashboard

## 📊 Monitoring

### Railway Dashboard Metrics:

- **Deployment Logs**: View build and runtime logs
- **Build Status**: Track build progress and failures
- **Metrics**: Monitor CPU, memory, and network usage
- **Environment Variables**: Manage configuration
- **Health Status**: View health check results

### Health Endpoint Monitoring:

```bash
# Check health status
curl https://YOUR_APP_URL/api/health

# Response indicates:
# - status: Server health status
# - timestamp: Current server time
# - uptime: Seconds since server started
# - version: Application version
```

### Common Monitoring Commands:

```bash
# View recent logs
railway logs

# Check deployment status
railway status

# View environment variables
railway variables
```

## 🎉 Deployment Complete!

Your NDAX Quantum Engine is now running on Railway with:

✅ Automated build and deployment pipeline
✅ Health monitoring and auto-restart on failure
✅ Dynamic port assignment
✅ Production-optimized configuration
✅ React dashboard served from dist/
✅ Express backend API
✅ Quantum trading algorithms
✅ AI freelance automation
✅ Risk management system

**Your App URL**: Check Railway dashboard for your deployment URL

---

## 📞 Support Resources

- **Railway Documentation**: https://docs.railway.app
- **Project Repository**: https://github.com/oconnorw225-del/ndax-quantum-engine
- **Railway Status**: https://railway.app/status

## 🔄 Configuration Changes Summary

This deployment configuration includes the following updates:

1. **Simplified Start Command**: Direct `node` execution instead of npm wrapper
2. **Removed Port Hardcoding**: Allow Railway to assign PORT dynamically
3. **Consolidated Configuration**: Primary config in `railway.json`, health checks in `railway.toml`
4. **Optimized Build**: Uses `npm ci` for faster, more reliable installs
5. **Clear Documentation**: Updated deployment guide with troubleshooting steps
