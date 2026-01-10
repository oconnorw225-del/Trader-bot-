# Frontend-Backend API Integration Guide

## Overview

The NDAX Quantum Engine uses a centralized API architecture with a unified backend server and modular frontend services. This guide explains how to use the API services and troubleshoot common issues.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                   │
│  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ Components   │  │  Services                  │  │
│  │ - Dashboard  │  │  - api.js (HTTP)          │  │
│  │ - Quantum    │──┤  - websocket.js (WS)      │  │
│  │ - Freelance  │  │                            │  │
│  └──────────────┘  └───────────────────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP/WS
                         ▼
┌─────────────────────────────────────────────────────┐
│         Unified Backend (Node.js + Express)         │
│  Port 3000: HTTP API + Static Files                 │
│  Port 8080: WebSocket Server                        │
│  ┌─────────────────────────────────────────────┐  │
│  │ Routes:                                      │  │
│  │ - /api/health, /api/status, /api/stats     │  │
│  │ - /api/trading/*, /api/quantum/*           │  │
│  │ - /api/freelance/*, /api/exchange/*        │  │
│  │ - Proxy to Python Backend                   │  │
│  └─────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP Proxy
                         ▼
┌─────────────────────────────────────────────────────┐
│         Python Backend (Flask)                      │
│  Port 8000: Advanced Analytics & ML                 │
│  - Quantum algorithms                               │
│  - Machine learning models                          │
│  - Market analysis                                  │
└─────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Development Setup

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start all services (Python → Node.js → Vite)
npm run dev
```

This will start:
- **Python Backend** on port 8000
- **Node.js Backend** on port 3000
- **WebSocket Server** on port 8080
- **Vite Dev Server** on port 5173

### 2. Individual Service Startup

```bash
# Start only frontend (Vite dev server)
npm run dev:frontend

# Start only Node.js backend
npm run dev:backend

# Start only Python backend
npm run dev:python
```

### 3. Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Using the API Service

### Basic Usage

The centralized API service (`src/services/api.js`) provides a simple interface for all backend communication:

```javascript
import api from '../services/api.js';

// Get health status
const health = await api.checkHealth();

// Get trading stats
const stats = await api.getStats();

// Place a trade order
const result = await api.placeOrder({
  symbol: 'BTC/USD',
  side: 'BUY',
  quantity: 0.01,
  price: 45000
});
```

### Error Handling

The API service automatically handles errors and retries:

```javascript
try {
  const data = await api.getBalance();
  console.log('Balance:', data);
} catch (error) {
  // Error is already formatted with status, message, and data
  console.error('Error:', error.message);
  console.error('Status:', error.status);
}
```

### Authentication

The API service automatically includes authentication tokens:

```javascript
import api from '../services/api.js';

// Set auth token (stored in localStorage)
api.setAuthToken('your-jwt-token');

// Clear auth token
api.clearAuthToken();

// All subsequent requests will include the token
const data = await api.getPositions();
```

### Retry Logic

Failed requests are automatically retried with exponential backoff:

```javascript
// This request will retry up to 3 times on network errors
// with delays of 1s, 2s, and 4s
const data = await api.getMarketData('BTC/USD');
```

## Using WebSocket Service

### Connecting

```javascript
import wsManager from '../services/websocket.js';

// Connect to WebSocket server
await wsManager.connect();

// Check connection status
if (wsManager.isConnected()) {
  console.log('WebSocket connected');
}
```

### Subscribing to Market Data

```javascript
// Subscribe to market updates
wsManager.subscribe(['BTC/USD', 'ETH/USD']);

// Listen for market updates
wsManager.on('market_update', (data) => {
  console.log('Market update:', data.symbol, data.price);
});

// Unsubscribe
wsManager.unsubscribe(['ETH/USD']);
```

### Event Listeners

```javascript
// Connection events
wsManager.on('connected', () => {
  console.log('WebSocket connected');
});

wsManager.on('disconnected', () => {
  console.log('WebSocket disconnected');
});

// Custom events
wsManager.on('order_update', (data) => {
  console.log('Order update:', data);
});

// Remove listener
const unsubscribe = wsManager.on('message', handleMessage);
unsubscribe(); // Remove listener
```

### Automatic Reconnection

The WebSocket manager automatically reconnects on connection loss:

```javascript
// Reconnection happens automatically
// Max 10 attempts with exponential backoff (1s → 30s)
wsManager.connect();
```

## API Endpoints

### Health & Status

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/health` | GET | Server health check | `{ status, timestamp, uptime, version }` |
| `/api/status` | GET | Service status | `{ services: { nodejs, websocket, python } }` |
| `/api/stats` | GET | Trading statistics | `{ totalTrades, totalProfit, activeJobs }` |

### Trading

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/trading/order` | POST | Place order | `{ symbol, side, quantity, price }` |
| `/api/trading/balance` | GET | Get balance | - |
| `/api/trading/positions` | GET | Get positions | - |

### Quantum Analysis

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/quantum/execute` | POST | Execute strategy | `{ strategy, data }` |
| `/api/quantum/analyze` | POST | Analyze market | `{ marketData }` |

### Freelance

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/freelance/:platform/jobs` | POST | Search jobs | `{ criteria }` |
| `/api/freelance/:platform/apply` | POST | Apply to job | `{ jobId, proposal }` |

## Environment Variables

### Frontend (Vite)

Variables must be prefixed with `VITE_`:

```bash
# API endpoints
VITE_API_URL=http://localhost:3000
VITE_PYTHON_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8080

# App configuration
VITE_APP_VERSION=2.1.0
VITE_DEMO_MODE=true
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Backend (Node.js)

```bash
# Server ports
PORT=3000
WS_PORT=8080
PYTHON_BACKEND_URL=http://localhost:8000

# Application mode
NODE_ENV=development
TESTNET=true

# Security
ENCRYPTION_KEY=your_32_character_key_here
JWT_SECRET=your_jwt_secret_here
```

## Testing

### Integration Tests

Run the comprehensive integration test suite:

```bash
bash scripts/integration-test.sh
```

Tests include:
- Server health checks (4 tests)
- API endpoint validation (7 tests)
- Static file serving (2 tests)
- File structure verification (7 tests)

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test status endpoint
curl http://localhost:3000/api/status

# Test stats endpoint
curl http://localhost:3000/api/stats
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** "Port 3000 is already in use"

**Solution:**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm start
```

#### 2. Backend Not Available

**Problem:** "Backend is not available" message in frontend

**Solution:**
1. Check if backend is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check backend logs:
   ```bash
   cat logs/nodejs-backend.log
   ```

3. Restart backend:
   ```bash
   npm run dev:backend
   ```

#### 3. WebSocket Connection Failed

**Problem:** WebSocket fails to connect

**Solution:**
1. Verify WebSocket server is running:
   ```bash
   curl http://localhost:3000/api/status
   # Check "websocket": "online"
   ```

2. Check WebSocket URL in code:
   ```javascript
   // Should be ws:// not wss:// for local development
   const wsUrl = 'ws://localhost:8080';
   ```

3. Check browser console for specific error

#### 4. CORS Errors

**Problem:** "Cross-Origin Request Blocked"

**Solution:**
1. Ensure CORS is enabled in backend:
   ```javascript
   app.use(cors({ origin: '*' }));
   ```

2. Use Vite proxy in development (already configured)

3. Check CORS_ORIGIN in .env

#### 5. API Returns 404

**Problem:** API endpoint returns 404

**Solution:**
1. Check endpoint exists in unified-server.js
2. Verify route path matches exactly
3. Check if API prefix is correct (`/api/...`)
4. Review server logs for routing issues

### Debug Mode

Enable verbose logging:

```bash
# Backend
DEBUG=* npm start

# Frontend (browser console)
localStorage.setItem('debug', 'api:*');
```

### Log Files

Check logs for detailed error information:

```bash
# Backend logs
cat logs/nodejs-backend.log
cat logs/python-backend.log

# Vite dev server logs
cat logs/vite.log
```

## Performance Optimization

### Frontend

- API requests are automatically retried with exponential backoff
- WebSocket reconnects automatically on disconnect
- Requests timeout after 10 seconds (configurable)

### Backend

- Rate limiting: 1000 requests/15min (testnet) or 100 requests/15min (production)
- Connection pooling for database (when applicable)
- Gzip compression for responses
- Static file caching

## Security Best Practices

1. **Never commit secrets** - Use .env for all sensitive data
2. **Encrypt sensitive data** - Use `src/shared/encryption.js` (AES-256)
3. **Validate inputs** - All user inputs are validated server-side
4. **Use HTTPS in production** - Already configured via Helmet.js
5. **Implement rate limiting** - Already enabled on all `/api/*` routes
6. **Store tokens securely** - API service uses localStorage with encryption

## Migration from Old Pattern

### Before (Direct fetch)

```javascript
const response = await fetch(`${config.apiUrl}/api/stats`);
const data = await response.json();
```

### After (Centralized API)

```javascript
import api from '../services/api.js';
const data = await api.getStats();
```

### Benefits

- ✅ Automatic error handling
- ✅ Built-in retry logic
- ✅ Authentication token management
- ✅ Consistent error format
- ✅ Easier to test and mock
- ✅ Type-safe (with TypeScript)

## Additional Resources

- [Main README](../README.md) - Project overview
- [API Documentation](API.md) - Detailed API reference
- [Quick Start Guide](QUICK_START.md) - Getting started
- [NDAX Trading Setup](../NDAX_TRADING_SETUP.md) - Trading configuration

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in `logs/` directory
3. Run integration tests: `bash scripts/integration-test.sh`
4. Check GitHub issues for similar problems
