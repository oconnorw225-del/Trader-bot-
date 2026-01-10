/**
 * Unified Server for NDAX Quantum Engine / Chimera Trading System
 * Combines Node.js backend with WebSocket streaming and Python backend proxy
 * 
 * Features:
 * - HTTP server on PORT (default 3000)
 * - WebSocket server on port 8080
 * - Proxy to Python backend on port 8000
 * - Prometheus metrics on port 9090
 * - Real-time market data broadcasting
 * - Exchange API integration
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
const METRICS_PORT = process.env.METRICS_PORT || 9090;
const NODE_ENV = process.env.NODE_ENV || 'development';
const TESTNET = process.env.TESTNET !== 'false'; // Default to true for safety

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`[Unified Server] Starting in ${NODE_ENV} mode`);
console.log(`[Unified Server] Testnet mode: ${TESTNET ? 'ENABLED' : 'DISABLED'}`);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: TESTNET ? 1000 : 100, // Higher limit for testnet
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.1.0',
    mode: NODE_ENV,
    testnet: TESTNET,
    services: {
      http: 'online',
      websocket: 'online',
      python_backend: 'checking',
    },
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Check Python backend
    const pythonHealth = await axios.get(`${PYTHON_BACKEND_URL}/api/health`, {
      timeout: 5000,
    }).catch(() => ({ data: { status: 'offline' } }));

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        nodejs: 'online',
        websocket: 'online',
        python: pythonHealth.data.status === 'healthy' ? 'online' : 'offline',
      },
      config: {
        testnet: TESTNET,
        environment: NODE_ENV,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalTrades: 0,
    totalProfit: 0,
    activeJobs: 0,
    successRate: 0
  });
});

// Exchange endpoints
app.get('/api/exchanges', (req, res) => {
  res.json({
    success: true,
    exchanges: [
      {
        id: 'ndax',
        name: 'NDAX',
        status: 'available',
        testnet: TESTNET,
      },
      {
        id: 'binance',
        name: 'Binance',
        status: 'available',
        testnet: TESTNET,
      },
    ],
  });
});

app.get('/api/exchange/status/:exchangeId', async (req, res) => {
  const { exchangeId } = req.params;
  
  try {
    // Proxy to Python backend
    const response = await axios.get(
      `${PYTHON_BACKEND_URL}/api/exchange/status/${exchangeId}`,
      { timeout: 5000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get exchange status',
      message: error.message,
    });
  }
});

app.post('/api/exchange/connect', async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_BACKEND_URL}/api/exchange/connect`,
      req.body,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to connect to exchange',
      message: error.message,
    });
  }
});

// Trading endpoints
app.post('/api/trading/order', async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_BACKEND_URL}/api/trading/order`,
      req.body,
      { timeout: 10000 }
    );
    
    // Broadcast order update via WebSocket
    broadcastToClients({
      type: 'order_update',
      data: response.data,
      timestamp: new Date().toISOString(),
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to place order',
      message: error.message,
    });
  }
});

app.get('/api/trading/balance', async (req, res) => {
  try {
    const response = await axios.get(
      `${PYTHON_BACKEND_URL}/api/trading/balance`,
      { timeout: 5000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get balance',
      message: error.message,
    });
  }
});

app.get('/api/trading/positions', async (req, res) => {
  try {
    const response = await axios.get(
      `${PYTHON_BACKEND_URL}/api/trading/positions`,
      { timeout: 5000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get positions',
      message: error.message,
    });
  }
});

// Quantum analysis proxy
app.post('/api/quantum/analyze', async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_BACKEND_URL}/api/quantum/analyze`,
      req.body,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform quantum analysis',
      message: error.message,
    });
  }
});

// Market data proxy
app.get('/api/market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `${PYTHON_BACKEND_URL}/api/market/${symbol}`,
      { timeout: 5000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get market data',
      message: error.message,
    });
  }
});

// Feature toggle endpoints
app.get('/api/features', (req, res) => {
  res.json({
    aiBot: true,
    wizardPro: true,
    stressTest: true,
    strategyManagement: true,
    todoList: true,
    quantumEngine: true,
    freelanceAutomation: true,
    testLab: true,
    advancedAnalytics: true,
    riskManagement: true,
    autoRecovery: true,
    complianceChecks: true
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  const metrics = {
    http_requests_total: httpRequestCount,
    websocket_connections_total: wsConnectionCount,
    websocket_active_connections: wss.clients.size,
    uptime_seconds: process.uptime(),
    memory_usage_bytes: process.memoryUsage().heapUsed,
  };
  
  // Prometheus format
  let output = '';
  for (const [key, value] of Object.entries(metrics)) {
    output += `# TYPE ${key} gauge\n`;
    output += `${key} ${value}\n`;
  }
  
  res.set('Content-Type', 'text/plain');
  res.send(output);
});

// WebSocket connection handling
let wsConnectionCount = 0;
let httpRequestCount = 0;

// Middleware to count HTTP requests
app.use((req, res, next) => {
  httpRequestCount++;
  next();
});

wss.on('connection', (ws, req) => {
  wsConnectionCount++;
  const clientId = `client_${wsConnectionCount}_${Date.now()}`;
  
  console.log(`[WebSocket] New connection: ${clientId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    timestamp: new Date().toISOString(),
    message: 'Connected to Chimera Trading System',
  }));
  
  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`[WebSocket] Message from ${clientId}:`, data.type);
      
      switch (data.type) {
        case 'subscribe':
          // Subscribe to market data
          ws.subscriptions = data.symbols || [];
          ws.send(JSON.stringify({
            type: 'subscribed',
            symbols: ws.subscriptions,
            timestamp: new Date().toISOString(),
          }));
          break;
          
        case 'unsubscribe':
          // Unsubscribe from market data
          ws.subscriptions = [];
          ws.send(JSON.stringify({
            type: 'unsubscribed',
            timestamp: new Date().toISOString(),
          }));
          break;
          
        case 'ping':
          // Respond to ping
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString(),
          }));
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type',
            timestamp: new Date().toISOString(),
          }));
      }
    } catch (error) {
      console.error(`[WebSocket] Error processing message:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        timestamp: new Date().toISOString(),
      }));
    }
  });
  
  ws.on('close', () => {
    console.log(`[WebSocket] Connection closed: ${clientId}`);
  });
  
  ws.on('error', (error) => {
    console.error(`[WebSocket] Error on ${clientId}:`, error.message);
  });
});

// Broadcast function to all connected clients
function broadcastToClients(message) {
  const data = JSON.stringify(message);
  let sentCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
      sentCount++;
    }
  });
  
  if (sentCount > 0) {
    console.log(`[WebSocket] Broadcast to ${sentCount} clients: ${message.type}`);
  }
}

// Market data streaming simulation (for testnet mode)
if (TESTNET) {
  setInterval(() => {
    const marketUpdate = {
      type: 'market_update',
      symbol: 'BTC/USD',
      price: 45000 + Math.random() * 1000,
      volume: Math.random() * 100,
      timestamp: new Date().toISOString(),
    };
    
    broadcastToClients(marketUpdate);
  }, 5000); // Every 5 seconds
}

// Catch-all middleware for SPA (must come after all API routes)
// Express 5 doesn't support wildcards in route patterns, so we use middleware
app.use((req, res, next) => {
  // Skip if it's an API request
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  // Check if dist/index.html exists
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Run "npm run build" first.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Start HTTP server
httpServer.listen(PORT, () => {
  console.log(`[HTTP Server] Listening on port ${PORT}`);
  console.log(`[WebSocket] Server running on port ${WS_PORT}`);
  console.log(`[Proxy] Python backend at ${PYTHON_BACKEND_URL}`);
  console.log(`[Metrics] Available at http://localhost:${PORT}/metrics`);
  console.log(`[Dashboard] Available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  
  httpServer.close(() => {
    console.log('[HTTP Server] Closed');
  });
  
  wss.close(() => {
    console.log('[WebSocket] Closed');
  });
  
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
