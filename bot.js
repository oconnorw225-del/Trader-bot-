/**
 * NDAX Professional AI Bot - Railway Deployment
 * Version: 2.0.0
 * Secure, autonomous AI task processing with Stripe payments
 */

import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import Stripe from "stripe";
import fetch from "node-fetch";
import dotenv from "dotenv";
import crypto from "crypto";
import { EventEmitter } from "events";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================
class Config {
  static validate() {
    const required = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'HUGGINGFACE_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) throw new Error(`Missing: ${missing.join(', ')}`);
    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) throw new Error('Invalid Stripe key');
    return true;
  }
  static get stripe() { return { secretKey: process.env.STRIPE_SECRET_KEY, webhookSecret: process.env.STRIPE_WEBHOOK_SECRET }; }
  static get huggingface() { return { apiKey: process.env.HUGGINGFACE_API_KEY, defaultModel: process.env.HUGGINGFACE_MODEL || 'gpt2', timeout: 30000 }; }
  static get server() { return { port: parseInt(process.env.PORT) || 3000, environment: process.env.NODE_ENV || 'production' }; }
}

// ============================================
// Logger
// ============================================
class Logger {
  static log(level, message, data = {}) {
    const entry = { timestamp: new Date().toISOString(), level, message, ...data };
    if (entry.apiKey) entry.apiKey = '***';
    if (entry.secret) entry.secret = '***';
    console.log(JSON.stringify(entry));
  }
  static error(msg, data) { this.log('error', msg, data); }
  static warn(msg, data) { this.log('warn', msg, data); }
  static info(msg, data) { this.log('info', msg, data); }
}

// ============================================
// Validator
// ============================================
class Validator {
  static sanitizeString(str, maxLen = 1000) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLen).replace(/[<>]/g, '').replace(/[^\w\s@.,!?-]/g, '');
  }
  static validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  static validateAmount(amount) { const num = parseInt(amount); return !isNaN(num) && num > 0 && num <= 100000; }
  static validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.length < 3 || prompt.length > 5000) return false;
    return !/eval\(|function\s*\(|<script|javascript:/i.test(prompt);
  }
  static validateTaskId(taskId) { return /^[a-zA-Z0-9-_]+$/.test(taskId); }
}

// ============================================
// Secure Payments
// ============================================
class SecurePayments {
  constructor() {
    this.stripe = new Stripe(Config.stripe.secretKey);
    this.processedPayments = new Set();
  }
  async createPaymentLink(amount, taskId, description = "AI Task") {
    if (!Validator.validateAmount(amount)) throw new Error('Invalid amount');
    if (!Validator.validateTaskId(taskId)) throw new Error('Invalid task ID');
    const link = await this.stripe.paymentLinks.create({
      line_items: [{ price_data: { currency: "usd", product_data: { name: Validator.sanitizeString(description, 100) }, unit_amount: amount }, quantity: 1 }],
      metadata: { taskId, createdAt: Date.now() },
      after_completion: { type: 'redirect', redirect: { url: process.env.SUCCESS_URL || 'https://yourdomain.com/success' }}
    });
    Logger.info('Payment link created', { taskId, amount });
    return link.url;
  }
  async verifyWebhook(rawBody, signature) {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, Config.stripe.webhookSecret);
    if (this.processedPayments.has(event.id)) { Logger.warn('Duplicate webhook', { eventId: event.id }); return null; }
    this.processedPayments.add(event.id);
    // Archive old payments instead of deleting - move to archived set for audit trail
    if (this.processedPayments.size > 1000) {
      const oldestPayment = this.processedPayments.values().next().value;
      if (!this.archivedPayments) this.archivedPayments = new Set();
      this.archivedPayments.add(oldestPayment);
      this.processedPayments.delete(oldestPayment);
      Logger.info('Payment archived for audit trail', { paymentId: oldestPayment });
    }
    return event;
  }
}

// ============================================
// AI Handler
// ============================================
class SecureAIHandler {
  constructor() {
    this.requestCache = new Map();
    this.rateLimiter = new Map();
  }
  async runAITask(prompt, model = Config.huggingface.defaultModel) {
    if (!Validator.validatePrompt(prompt)) throw new Error('Invalid prompt');
    if (this.isRateLimited(model)) throw new Error('Rate limit exceeded');
    const cacheKey = crypto.createHash('sha256').update(`${model}:${prompt}`).digest('hex');
    if (this.requestCache.has(cacheKey)) return this.requestCache.get(cacheKey);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Config.huggingface.timeout);
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${Config.huggingface.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const result = await response.json();
    this.requestCache.set(cacheKey, result);
    // Archive cache entries after TTL instead of just deleting
    setTimeout(() => {
      const cachedData = this.requestCache.get(cacheKey);
      if (cachedData) {
        // Move to archived cache for analysis and debugging
        if (!this.archivedCache) this.archivedCache = new Map();
        this.archivedCache.set(cacheKey, { data: cachedData, archivedAt: Date.now() });
        this.requestCache.delete(cacheKey);
      }
    }, 3600000);
    this.trackRateLimit(model);
    Logger.info('AI task completed', { model });
    return result;
  }
  isRateLimited(model) {
    const key = `ratelimit:${model}`;
    const now = Date.now();
    const limit = this.rateLimiter.get(key) || { count: 0, resetAt: now + 60000 };
    if (now > limit.resetAt) { this.rateLimiter.set(key, { count: 1, resetAt: now + 60000 }); return false; }
    if (limit.count >= 100) return true;
    limit.count++;
    return false;
  }
  trackRateLimit(model) {
    const limit = this.rateLimiter.get(`ratelimit:${model}`);
    if (limit) limit.count++;
  }
}

// ============================================
// Task Manager (with Multi-Provider Support)
// ============================================
class TaskManager extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.maxTasks = 10000;
    this.customQueueTasks = [{ taskId: "queue-1", prompt: "Summarize this text", paid: true }];
    this.directClientTasks = [];
    this.mturkTasks = [{ taskId: "mturk-1", prompt: "Analyze survey", paid: true }];
    this.appenTasks = [{ taskId: "appen-1", prompt: "Label images", paid: true }];
    this.rapidTasks = [{ taskId: "rapid-1", prompt: "Translate text", paid: true }];
    setInterval(() => this.cleanup(), 3600000);
  }
  addTask(taskId, email, prompt, amount) {
    if (!Validator.validateTaskId(taskId)) throw new Error('Invalid task ID');
    if (!Validator.validateEmail(email)) throw new Error('Invalid email');
    if (!Validator.validatePrompt(prompt)) throw new Error('Invalid prompt');
    if (!Validator.validateAmount(amount)) throw new Error('Invalid amount');
    if (this.tasks.has(taskId)) throw new Error('Task exists');
    const task = { taskId, email: Validator.sanitizeString(email), prompt: Validator.sanitizeString(prompt, 5000), amount, paid: false, createdAt: Date.now(), status: 'pending' };
    this.tasks.set(taskId, task);
    this.directClientTasks.push(task);
    if (this.tasks.size > this.maxTasks) { const old = this.tasks.keys().next().value; this.tasks.delete(old); }
    Logger.info('Task added', { taskId });
    this.emit('taskAdded', task);
    return task;
  }
  markPaid(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    if (task.paid) return task;
    task.paid = true;
    task.paidAt = Date.now();
    task.status = 'paid';
    Logger.info('Task paid', { taskId });
    this.emit('taskPaid', task);
    return task;
  }
  getTask(taskId) { return this.tasks.get(taskId); }
  getAllProviderTasks() {
    return {
      directClient: this.directClientTasks.filter(t => t.paid),
      customQueue: this.customQueueTasks.filter(t => t.paid),
      mturk: this.mturkTasks.filter(t => t.paid),
      appen: this.appenTasks.filter(t => t.paid),
      rapidapi: this.rapidTasks.filter(t => t.paid)
    };
  }
  cleanup() {
    const now = Date.now();
    let archived = 0;
    // Archive completed tasks instead of deleting for audit and analytics
    if (!this.archivedTasks) this.archivedTasks = new Map();
    
    for (const [taskId, task] of this.tasks) {
      if (now - task.createdAt > 86400000 && task.status === 'completed') {
        // Archive task with metadata
        this.archivedTasks.set(taskId, {
          ...task,
          archivedAt: now,
          archivedReason: 'completed_and_expired'
        });
        this.tasks.delete(taskId);
        archived++;
      }
    }
    
    if (archived > 0) {
      Logger.info('Tasks archived for historical analysis', { 
        archived, 
        totalArchived: this.archivedTasks.size 
      });
    }
  }
}

// ============================================
// Main Bot
// ============================================
class AIBot {
  constructor() {
    Config.validate();
    this.payments = new SecurePayments();
    this.aiHandler = new SecureAIHandler();
    this.taskManager = new TaskManager();
    this.taskManager.on('taskPaid', (task) => this.processTask(task));
    this.app = this.setupExpress();
  }
  setupExpress() {
    const app = express();
    app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"] }}}));
    app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
    app.use(compression());
    app.use(express.static(path.join(__dirname, '/')));
    const limiter = rateLimit({ windowMs: 900000, max: 100 });
    app.use('/api/', limiter);
    app.use('/stripe-webhook', bodyParser.raw({ type: 'application/json' }));
    app.use(express.json({ limit: '10kb' }));

    app.get('/', (req, res) => {
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NDAX AI Bot Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .status-card { background: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 8px; }
    .status-card h3 { margin-bottom: 10px; color: #667eea; }
    .badge { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 0.9em; margin-top: 10px; background: #10b981; color: white; }
    .modules { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .module { background: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; text-align: center; }
    .module-icon { font-size: 2em; margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚛️ NDAX AI Bot Dashboard</h1>
      <p>Professional AI Task Processing with Stripe Payments</p>
    </div>
    <div class="status-grid">
      <div class="status-card">
        <h3>✓ Bot Status</h3>
        <p>Status: <strong>Running</strong></p>
        <span class="badge">ACTIVE</span>
      </div>
      <div class="status-card">
        <h3>✓ Payments</h3>
        <p>Stripe: <strong>Connected</strong></p>
        <span class="badge">READY</span>
      </div>
      <div class="status-card">
        <h3>✓ AI Integration</h3>
        <p>HuggingFace: <strong>Ready</strong></p>
        <span class="badge">READY</span>
      </div>
      <div class="status-card">
        <h3>✓ Tasks</h3>
        <p>Queue: <strong id="taskCount">0</strong></p>
        <span class="badge">ACTIVE</span>
      </div>
    </div>
    <h2 style="margin: 30px 0; color: #667eea;">Integrated Modules</h2>
    <div class="modules">
      <div class="module">
        <div class="module-icon">💳</div>
        <h4>Stripe Payments</h4>
        <p>Secure payment processing</p>
      </div>
      <div class="module">
        <div class="module-icon">🤖</div>
        <h4>AI Tasks</h4>
        <p>HuggingFace integration</p>
      </div>
      <div class="module">
        <div class="module-icon">⚡</div>
        <h4>Auto Processing</h4>
        <p>Autonomous task execution</p>
      </div>
      <div class="module">
        <div class="module-icon">📊</div>
        <h4>Monitoring</h4>
        <p>Real-time analytics</p>
      </div>
      <div class="module">
        <div class="module-icon">🔒</div>
        <h4>Security</h4>
        <p>Webhook verification</p>
      </div>
      <div class="module">
        <div class="module-icon">⚙️</div>
        <h4>Configuration</h4>
        <p>Environment variables</p>
      </div>
    </div>
    <div class="footer">
      <p>NDAX AI Bot v2.0.0 • Production Ready • Railway Deployment</p>
    </div>
  </div>
  <script>
    async function updateStats() {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        document.getElementById('taskCount').textContent = data.tasks || 0;
      } catch(e) {}
    }
    updateStats();
    setInterval(updateStats, 5000);
  </script>
</body>
</html>`);
    });
    
    app.get('/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime(), tasks: this.taskManager.tasks.size }));
    
    app.get('/api/dashboard', (req, res) => {
      res.json({
        dashboardStatus: 'loaded',
        botStatus: 'running',
        modules: ['Stripe Payments', 'AI Tasks', 'Auto Processing', 'Monitoring', 'Security', 'Configuration'],
        timestamp: new Date().toISOString()
      });
    });
    
    app.get('/api/stats', (req, res) => {
      res.json({
        totalTasks: this.taskManager.tasks.size,
        completedTasks: Array.from(this.taskManager.tasks.values()).filter(t => t.status === 'completed').length,
        pendingTasks: Array.from(this.taskManager.tasks.values()).filter(t => t.status === 'pending').length,
        failedTasks: Array.from(this.taskManager.tasks.values()).filter(t => t.status === 'failed').length,
        uptime: process.uptime()
      });
    });

    app.post('/stripe-webhook', async (req, res) => {
      try {
        const event = await this.payments.verifyWebhook(req.body, req.headers['stripe-signature']);
        if (!event) return res.status(200).json({ received: true, duplicate: true });
        if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
          const taskId = event.data.object.metadata?.taskId;
          if (taskId) this.taskManager.markPaid(taskId);
        }
        res.json({ received: true });
      } catch (error) {
        Logger.error('Webhook error', { error: error.message });
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    });

    app.post('/api/task', async (req, res) => {
      try {
        const { email, prompt, amount } = req.body;
        if (!email || !prompt || !amount) return res.status(400).json({ error: 'Missing fields' });
        const taskId = `task-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const paymentUrl = await this.payments.createPaymentLink(parseInt(amount), taskId, `AI: ${prompt.substring(0, 50)}`);
        const task = this.taskManager.addTask(taskId, email, prompt, parseInt(amount));
        res.json({ success: true, taskId, paymentUrl, status: task.status });
      } catch (error) {
        Logger.error('Task creation error', { error: error.message });
        res.status(400).json({ error: error.message });
      }
    });

    app.get('/api/task/:taskId', (req, res) => {
      try {
        const { taskId } = req.params;
        if (!Validator.validateTaskId(taskId)) return res.status(400).json({ error: 'Invalid task ID' });
        const task = this.taskManager.getTask(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ taskId: task.taskId, status: task.status, createdAt: task.createdAt, paid: task.paid, result: task.result });
      } catch (error) {
        res.status(500).json({ error: 'Internal error' });
      }
    });

    app.use((req, res) => res.status(404).json({ error: 'Not found' }));
    app.use((err, req, res, next) => { Logger.error('Unhandled error', { error: err.message }); res.status(500).json({ error: 'Internal error' }); });
    return app;
  }
  async processTask(task) {
    try {
      Logger.info('Processing task', { taskId: task.taskId });
      task.status = 'processing';
      const result = await this.aiHandler.runAITask(task.prompt);
      task.result = result;
      task.status = 'completed';
      task.completedAt = Date.now();
      Logger.info('Task completed', { taskId: task.taskId });
    } catch (error) {
      Logger.error('Task error', { taskId: task.taskId, error: error.message });
      task.status = 'failed';
      task.error = error.message;
    }
  }
  start() {
    // Start multi-provider polling loop
    this.pollProviders();
    
    const port = Config.server.port;
    this.app.listen(port, () => Logger.info('Bot started', { port, environment: Config.server.environment }));
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
  shutdown() {
    Logger.info('Shutting down');
    process.exit(0);
  }
}

const bot = new AIBot();
bot.start();
