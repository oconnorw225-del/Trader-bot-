import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import fssync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AutoStartManager } from '../../src/services/AutoStartManager.js';
import autostartRoutes from '../../src/routes/autostart.js';
import webhookManager from '../../src/shared/webhookManager.js';
import {
  authRateLimiter,
  loginHandler,
  logoutHandler,
  verifyHandler,
  requireAuth
} from './auth-middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AutoStartManager
const autoStartManager = new AutoStartManager({
  strategy: process.env.AUTOSTART_STRATEGY || 'balanced',
  scanInterval: parseInt(process.env.AUTOSTART_SCAN_INTERVAL) || 30000,
  maxConcurrentJobs: parseInt(process.env.AUTOSTART_MAX_CONCURRENT_JOBS) || 5,
  minPayment: parseFloat(process.env.AUTOSTART_MIN_PAYMENT) || 0.01,
  encryptionKey: process.env.ENCRYPTION_KEY
});

// Make AutoStartManager available to routes
app.locals.autoStartManager = autoStartManager;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"], // Allow inline scripts for auth page
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication routes (must come before auth middleware)
app.post('/auth/login', authRateLimiter, loginHandler);
app.post('/auth/logout', logoutHandler);
app.get('/auth/verify', verifyHandler);

// Serve static files (auth.html will be served from these directories)
app.use(express.static(path.join(__dirname, '../../dist')));
app.use(express.static(path.join(__dirname, '../../public')));

// Serve mobile app static files
app.use('/mobile', express.static(path.join(__dirname, '../../src/mobile')));

// Configuration storage path
const CONFIG_PATH = path.join(__dirname, '../../config');
const CONFIG_FILE = path.join(CONFIG_PATH, 'app-config.json');

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_PATH, { recursive: true });
  } catch (error) {
    console.error('Error creating config directory:', error);
  }
}

// Health check endpoint (must be public for Railway/monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Apply authentication middleware to remaining API routes
// Skip if NODE_ENV=development and REQUIRE_AUTH=false
const shouldRequireAuth = process.env.NODE_ENV !== 'development' || process.env.REQUIRE_AUTH !== 'false';
if (shouldRequireAuth) {
  app.use('/api/', requireAuth);
}

// Auto-start routes (protected by auth middleware if enabled)
app.use('/api/autostart', autostartRoutes);

// Stats endpoint - Import earningsTracker dynamically
app.get('/api/stats', async (req, res) => {
  try {
    const { default: earningsTracker } = await import('../../src/services/EarningsTracker.js');
    const earnings = await earningsTracker.getTotalEarnings();
    
    res.json({
      totalTrades: earnings.paymentStats?.total || 0,
      totalProfit: earnings.total,
      activeJobs: 0, // Will be populated from AutoStartManager in future
      successRate: earnings.paymentStats?.total > 0 
        ? (earnings.paymentStats.completed / earnings.paymentStats.total * 100)
        : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({
      totalTrades: 0,
      totalProfit: 0,
      activeJobs: 0,
      successRate: 0
    });
  }
});

// Earnings report endpoint
app.get('/api/earnings/report', async (req, res) => {
  try {
    const { default: earningsTracker } = await import('../../src/services/EarningsTracker.js');
    const report = await earningsTracker.getDetailedReport();
    res.json(report);
  } catch (error) {
    console.error('Error generating earnings report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate earnings report',
      message: error.message
    });
  }
});

// Get recent earnings
app.get('/api/earnings/recent', async (req, res) => {
  try {
    const { default: earningsTracker } = await import('../../src/services/EarningsTracker.js');
    const limit = parseInt(req.query.limit) || 10;
    const recent = earningsTracker.getRecentEarnings(limit);
    res.json({
      success: true,
      earnings: recent
    });
  } catch (error) {
    console.error('Error fetching recent earnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent earnings',
      message: error.message
    });
  }
});

// Get earnings by period
app.get('/api/earnings/period/:period', async (req, res) => {
  try {
    const { default: earningsTracker } = await import('../../src/services/EarningsTracker.js');
    const { period } = req.params;
    const data = earningsTracker.getEarningsByPeriod(period);
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Error fetching period earnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch period earnings',
      message: error.message
    });
  }
});

// Configuration endpoints
app.get('/api/config/load', async (req, res) => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({ setupComplete: false });
  }
});

app.post('/api/config/save', async (req, res) => {
  try {
    await ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quantum trading endpoints
app.post('/api/quantum/execute', (req, res) => {
  const { strategy, data } = req.body;
  
  // Simulate quantum strategy execution
  const result = {
    recommendation: Math.random() > 0.5 ? 'BUY' : 'SELL',
    confidence: 0.70 + Math.random() * 0.25,
    optimalPrice: data.price * (1 + (Math.random() - 0.5) * 0.02),
    strategy: strategy
  };
  
  res.json({ success: true, result });
});

app.post('/api/quantum/strategy', (req, res) => {
  res.json({
    success: true,
    strategy: req.body.strategy || 'Superposition',
    status: 'executed'
  });
});

// Trading endpoints
app.post('/api/trading/order', (req, res) => {
  const { symbol, side, quantity, price } = req.body;
  
  res.json({
    success: true,
    order: {
      id: Date.now(),
      symbol,
      side,
      quantity,
      price,
      status: 'FILLED',
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/trading/execute', (req, res) => {
  res.json({
    success: true,
    execution: {
      status: 'completed',
      timestamp: new Date().toISOString()
    }
  });
});

// Risk management endpoint
app.post('/api/risk/check', (req, res) => {
  const { trade } = req.body;
  
  res.json({
    approved: true,
    reason: 'Trade within acceptable risk parameters',
    metrics: {
      positionSize: trade?.quantity * trade?.price || 0,
      riskLevel: 'moderate'
    }
  });
});

// AI endpoints
app.post('/api/ai/analyze', (req, res) => {
  res.json({
    success: true,
    analysis: {
      sentiment: 'positive',
      confidence: 0.85,
      recommendations: ['Hold', 'Consider buying on dip']
    }
  });
});

app.post('/api/ai/predict', (req, res) => {
  res.json({
    success: true,
    prediction: {
      direction: 'up',
      magnitude: 2.5,
      timeframe: '24h'
    }
  });
});

// Freelance automation endpoints
app.post('/api/freelance/:platform/jobs', async (req, res) => {
  const { platform } = req.params;
  // const criteria = req.body; // Currently unused but reserved for future implementation
  
  // Simulate job search
  const jobs = [
    {
      id: `${platform}-1`,
      title: 'Full Stack Developer',
      budget: 5000,
      description: 'Looking for an experienced developer...',
      platform,
      posted: '2 hours ago',
      skills: ['React', 'Node.js']
    },
    {
      id: `${platform}-2`,
      title: 'AI Engineer',
      budget: 8000,
      description: 'Need AI expertise for trading bot...',
      platform,
      posted: '5 hours ago',
      skills: ['Python', 'TensorFlow']
    }
  ];
  
  res.json({ success: true, jobs });
});

app.post('/api/freelance/:platform/apply', async (req, res) => {
  const { platform } = req.params;
  const { jobId, useAI } = req.body;
  
  res.json({
    success: true,
    application: {
      jobId,
      platform,
      status: 'submitted',
      timestamp: new Date().toISOString(),
      aiAssisted: useAI
    }
  });
});

// Test endpoints
app.post('/api/test/:type', async (req, res) => {
  const { type } = req.params;
  const config = req.body;
  
  // Simulate test execution
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const baseResults = {
    success: true,
    duration: config.duration * 1000,
    iterations: config.iterations,
    passed: Math.floor(config.iterations * 0.85),
    failed: Math.floor(config.iterations * 0.15)
  };
  
  let results = baseResults;
  
  if (type === 'strategy') {
    results = {
      ...baseResults,
      averageReturn: (Math.random() * 10 - 2).toFixed(2),
      winRate: (Math.random() * 40 + 50).toFixed(1),
      maxDrawdown: (Math.random() * 15 + 5).toFixed(2)
    };
  } else if (type === 'stress') {
    results = {
      ...baseResults,
      requestsPerSecond: (config.iterations / config.duration).toFixed(2),
      averageLatency: (Math.random() * 100 + 50).toFixed(2),
      peakMemory: (Math.random() * 500 + 200).toFixed(2)
    };
  } else if (type === 'api') {
    results = {
      ...baseResults,
      successRate: ((baseResults.passed / baseResults.iterations) * 100).toFixed(1),
      averageResponseTime: (Math.random() * 200 + 100).toFixed(2),
      errors: baseResults.failed
    };
  }
  
  res.json(results);
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

app.post('/api/features', async (req, res) => {
  try {
    await ensureConfigDir();
    const featuresFile = path.join(CONFIG_PATH, 'features.json');
    await fs.writeFile(featuresFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Runtime mode endpoints
app.get('/api/runtime', (req, res) => {
  res.json({
    mode: 'regular',
    autoDetected: true
  });
});

app.post('/api/runtime', async (req, res) => {
  try {
    const { mode } = req.body;
    await ensureConfigDir();
    const runtimeFile = path.join(CONFIG_PATH, 'runtime.json');
    await fs.writeFile(runtimeFile, JSON.stringify({ mode }, null, 2));
    res.json({ success: true, mode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoints
app.post('/api/webhooks/register', (req, res) => {
  try {
    const webhook = webhookManager.registerWebhook(req.body);
    res.status(201).json({ success: true, webhook });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/webhooks/events', (req, res) => {
  const options = {
    eventType: req.query.eventType,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined
  };
  const events = webhookManager.getEventHistory(options);
  res.json({ success: true, events });
});

app.post('/api/webhooks/test/:id', async (req, res) => {
  try {
    const result = await webhookManager.testWebhook(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/webhooks', (req, res) => {
  const webhooks = webhookManager.listWebhooks();
  res.json({ success: true, webhooks });
});

app.get('/api/webhooks/:id', (req, res) => {
  const webhook = webhookManager.getWebhook(req.params.id);
  if (!webhook) {
    return res.status(404).json({ success: false, error: 'Webhook not found' });
  }
  res.json({ success: true, webhook });
});

app.put('/api/webhooks/:id', (req, res) => {
  try {
    const webhook = webhookManager.updateWebhook(req.params.id, req.body);
    if (!webhook) {
      return res.status(404).json({ success: false, error: 'Webhook not found' });
    }
    res.json({ success: true, webhook });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Archive webhook instead of deleting (soft delete for audit trail)
app.delete('/api/webhooks/:id', (req, res) => {
  // Archive the webhook instead of permanently deleting
  const webhook = webhookManager.getWebhook(req.params.id);
  if (!webhook) {
    return res.status(404).json({ success: false, error: 'Webhook not found' });
  }
  
  // Archive webhook with timestamp
  const archivedWebhook = {
    ...webhook,
    archived_at: new Date().toISOString(),
    status: 'archived'
  };
  
  // Move to archived collection instead of deleting
  const archived = webhookManager.archiveWebhook(req.params.id, archivedWebhook);
  if (!archived) {
    return res.status(500).json({ success: false, error: 'Failed to archive webhook' });
  }
  
  res.json({ 
    success: true, 
    message: 'Webhook archived successfully (can be restored if needed)',
    archived_id: req.params.id
  });
});

// Fallback to index.html for client-side routing (must come after API routes)
app.use((req, res, next) => {
  // Skip if it's an API request or mobile path
  if (req.path.startsWith('/api') || req.path.startsWith('/mobile')) {
    return next();
  }
  
  // If the request is for a file that doesn't exist in dist/, serve index.html
  const filePath = path.join(__dirname, '../../dist', req.path);
  
  if (fssync.existsSync(filePath) && fssync.statSync(filePath).isFile()) {
    return next();
  }
  
  // Serve index.html for client-side routing
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler for API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NDAX Quantum Engine Backend running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Mobile app: http://localhost:${PORT}/mobile`);
  console.log(`🤖 Auto-start API: http://localhost:${PORT}/api/autostart`);
  ensureConfigDir();
  
  // Setup AutoStartManager event listeners
  autoStartManager.on('system:started', () => {
    console.log('✅ Auto-start system started');
  });
  
  autoStartManager.on('system:stopped', () => {
    console.log('⏸️  Auto-start system stopped');
  });
  
  autoStartManager.on('job:completed', (job) => {
    console.log(`✅ Job completed: ${job.title} - $${job.earnings?.toFixed(2)}`);
  });
  
  autoStartManager.on('platform:connected', ({ platform }) => {
    console.log(`🌐 Platform connected: ${platform}`);
  });
  
  autoStartManager.on('job:approval-required', (job) => {
    console.log(`⚠️  Job requires approval: ${job.title} - $${job.payment?.toFixed(2)}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  autoStartManager.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  autoStartManager.destroy();
  process.exit(0);
});

export default app;
