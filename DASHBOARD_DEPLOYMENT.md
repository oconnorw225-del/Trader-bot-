# Dashboard Deployment Guide

## Overview
The NDAX Quantum Engine dashboard is configured to display as the homepage on Railway deployment. The React frontend integrates with all backend APIs to provide real-time monitoring and management.

## Architecture

### Frontend (React SPA)
- **Homepage**: Dashboard component (default route `/`)
- **Build Tool**: Vite
- **Build Output**: `dist/` directory
- **Entry Point**: `src/main.jsx` → `src/App.jsx` → `src/components/Dashboard.jsx`

### Backend (Node.js/Express)
- **Port**: 3000
- **Static Files**: Served from `dist/` directory
- **API Endpoints**: Available at `/api/*`
- **Health Check**: `/api/health`

## Deployment Configuration

### Railway Setup
The `railway.toml` file configures the deployment:
- **Build**: `npm run build` (Vite build)
- **Start**: `npm start` (Node.js server)
- **Health Check**: `/api/health` endpoint
- **Port**: 3000 (exposed via Railway)

### Build Process
1. Install dependencies: `npm install`
2. Build React app: `npm run build` (outputs to `dist/`)
3. Start Express server: `npm start`
4. Server serves:
   - Static files from `dist/` at `/`
   - API endpoints at `/api/*`
   - Mobile app at `/mobile`

## Dashboard Features

### Real-time Data Display
- **Quantum Trading Engine**: Strategy status, trade history
- **AI Proposals**: Active proposals, success rate
- **Feature Toggles**: Enable/disable features
- **Webhooks Status**: Active webhooks, event history
- **Risk Assessment**: Real-time risk metrics
- **Trading Analytics**: Charts and performance data

### Available Routes
```
GET /                     → Dashboard (React SPA)
GET /api/health          → Backend health check
GET /api/stats           → Trading/system statistics
GET /api/webhooks        → Webhook management
GET /api/webhooks/events → Event history
GET /api/features        → Feature toggle status
GET /api/autostart       → Auto-start system status
POST /api/trading/order  → Execute trade
POST /api/quantum/execute → Run quantum strategy
... and more (see backend/nodejs/server.js)
```

## Local Development

### Full Stack Development
```bash
# Terminal 1: Start Vite dev server (port 5173)
npm run dev

# Terminal 2: Start Node.js backend (port 3000)
npm run server

# Or run both concurrently:
npm run dev:full
```

### Production Build Preview
```bash
# Build the React app
npm run build

# Preview the built app
npm run preview

# Or start the backend with built frontend
npm start
```

## Production Deployment (Railway)

### Automatic Deployment
Railway automatically builds and deploys when you push to the connected branch:
```bash
git push origin main  # or your deployment branch
```

### Manual Deployment
```bash
# Build locally (optional, Railway does this)
npm run build

# Deploy using Railway CLI
railway up
```

### Environment Variables
Set these in Railway dashboard:
- `NODE_ENV=production`
- `PORT=3000` (set by Railway)
- `ENCRYPTION_KEY=your-encryption-key`
- Any API keys needed for trading/freelance platforms

## Dashboard Components

### Navigation
The App.jsx component manages routing between views:
- Dashboard (default/home)
- Quantum Engine
- Freelance Automation
- Wizard Pro
- Settings
- Test Lab
- Diagnostics

### Backend Integration
The dashboard automatically:
- Checks backend health every 30 seconds
- Displays online/offline status
- Fetches real-time stats from `/api/stats`
- Uses `window.location.origin` as API base URL

### CORS Configuration
Express is configured with CORS middleware to allow dashboard-API communication:
```javascript
app.use(cors());  // Allows all origins
```

## Troubleshooting

### Dashboard Not Loading
1. Check Railway logs: `railway logs`
2. Verify build succeeded: Look for "vite build" in logs
3. Check `dist/` directory was created
4. Verify port 3000 is bound to 0.0.0.0

### API Not Responding
1. Check health endpoint: `curl https://fearless-radiance.up.railway.app/api/health`
2. Verify backend started: Look for "Backend running on port 3000" in logs
3. Check rate limiting (100 req/15min per IP)

### Build Failures
1. Ensure all dependencies installed (not `--production`)
2. Check Node version (requires >=18.0.0)
3. Verify vite and @vitejs/plugin-react in package.json
4. Check Railway build logs for errors

## Performance

### Optimization
- Static file caching enabled (Express static middleware)
- Gzip compression via Helmet
- Code splitting in Vite config (vendor chunks)
- Minification with Terser

### Metrics
- Build time: ~30-60 seconds
- Cold start: ~5 seconds
- Health check: Every 30 seconds
- API response: <200ms average

## Security

### Headers
Helmet.js adds security headers:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options

### Rate Limiting
- API endpoints: 100 requests per 15 minutes per IP
- Applied to all `/api/*` routes

### HTTPS
- Railway provides automatic HTTPS
- All traffic encrypted in transit

## Monitoring

### Health Checks
Railway monitors:
- Path: `/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Grace period: 5 seconds

### Restart Policy
- Type: ON_FAILURE
- Max retries: 10

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vite Guide](https://vitejs.dev/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
