/**
 * Auto-Start Manager for Autonomous Job Platform Integration
 * Manages platform registration, job scanning, and strategy selection
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';
import { AutoDocumentor } from './AutoDocumentor.js';
import { AutoFixer } from './AutoFixer.js';
import { initializeDatabase } from '../models/Database.js';

/**
 * Platform configuration for 12 AI job platforms
 */
const PLATFORMS = {
  toloka: {
    name: 'Toloka',
    signupUrl: 'https://toloka.ai/tolokers/',
    apiUrl: 'https://toloka.dev/api/v1',
    loginUrl: 'https://platform.toloka.ai/auth',
    requirements: ['email', 'phone'],
    autoApproval: true,
    payoutSpeed: 'weekly',
    avgPayout: 0.05,
    successRate: 0.85,
    difficulty: 'easy'
  },
  remotasks: {
    name: 'Remotasks',
    signupUrl: 'https://www.remotasks.com/en/worker',
    apiUrl: 'https://www.remotasks.com/api',
    loginUrl: 'https://www.remotasks.com/login',
    requirements: ['email'],
    autoApproval: true,
    payoutSpeed: 'weekly',
    avgPayout: 0.10,
    successRate: 0.88,
    difficulty: 'medium'
  },
  rapidworkers: {
    name: 'RapidWorkers',
    signupUrl: 'https://rapidworkers.com/worker/register',
    apiUrl: 'https://rapidworkers.com/api',
    loginUrl: 'https://rapidworkers.com/login',
    requirements: ['email'],
    autoApproval: true,
    payoutSpeed: 'instant',
    avgPayout: 0.03,
    successRate: 0.92,
    difficulty: 'easy'
  },
  scaleai: {
    name: 'Scale AI',
    signupUrl: 'https://scale.com/outlier',
    apiUrl: 'https://api.scale.com/v1',
    loginUrl: 'https://scale.com/login',
    requirements: ['email', 'phone', 'id'],
    autoApproval: false,
    payoutSpeed: 'weekly',
    avgPayout: 0.20,
    successRate: 0.75,
    difficulty: 'hard'
  },
  appen: {
    name: 'Appen',
    signupUrl: 'https://connect.appen.com/qrp/public/jobs',
    apiUrl: 'https://api.appen.com/v1',
    loginUrl: 'https://connect.appen.com/auth/login',
    requirements: ['email', 'phone'],
    autoApproval: false,
    payoutSpeed: 'monthly',
    avgPayout: 0.15,
    successRate: 0.80,
    difficulty: 'medium'
  },
  lionbridge: {
    name: 'Lionbridge',
    signupUrl: 'https://www.lionbridge.com/join-our-team/ai-training-jobs/',
    apiUrl: 'https://api.lionbridge.com/v1',
    loginUrl: 'https://gengo.ai/auth/signin',
    requirements: ['email', 'phone', 'resume'],
    autoApproval: false,
    payoutSpeed: 'monthly',
    avgPayout: 0.18,
    successRate: 0.78,
    difficulty: 'hard'
  },
  clickworker: {
    name: 'Clickworker',
    signupUrl: 'https://www.clickworker.com/en/clickworker',
    apiUrl: 'https://api.clickworker.com/v1',
    loginUrl: 'https://workplace.clickworker.com/en',
    requirements: ['email', 'address'],
    autoApproval: true,
    payoutSpeed: 'weekly',
    avgPayout: 0.08,
    successRate: 0.86,
    difficulty: 'easy'
  },
  microworkers: {
    name: 'Microworkers',
    signupUrl: 'https://microworkers.com/signup.php',
    apiUrl: 'https://api.microworkers.com/v1',
    loginUrl: 'https://microworkers.com/login.php',
    requirements: ['email'],
    autoApproval: true,
    payoutSpeed: 'instant',
    avgPayout: 0.05,
    successRate: 0.90,
    difficulty: 'easy'
  },
  dataloop: {
    name: 'Dataloop',
    signupUrl: 'https://dataloop.ai/annotators/',
    apiUrl: 'https://api.dataloop.ai/v1',
    loginUrl: 'https://console.dataloop.ai/login',
    requirements: ['email'],
    autoApproval: false,
    payoutSpeed: 'biweekly',
    avgPayout: 0.12,
    successRate: 0.82,
    difficulty: 'medium'
  },
  labelbox: {
    name: 'Labelbox',
    signupUrl: 'https://labelbox.com/product/annotate',
    apiUrl: 'https://api.labelbox.com/graphql',
    loginUrl: 'https://app.labelbox.com/signin',
    requirements: ['email', 'company'],
    autoApproval: false,
    payoutSpeed: 'monthly',
    avgPayout: 0.25,
    successRate: 0.70,
    difficulty: 'hard'
  },
  hive: {
    name: 'Hive',
    signupUrl: 'https://thehive.ai/labelers',
    apiUrl: 'https://api.thehive.ai/v1',
    loginUrl: 'https://dashboard.thehive.ai/login',
    requirements: ['email'],
    autoApproval: true,
    payoutSpeed: 'weekly',
    avgPayout: 0.10,
    successRate: 0.84,
    difficulty: 'medium'
  },
  spare5: {
    name: 'Spare5',
    signupUrl: 'https://app.spare5.com/fives',
    apiUrl: 'https://api.spare5.com/v2',
    loginUrl: 'https://app.spare5.com/login',
    requirements: ['email', 'phone'],
    autoApproval: true,
    payoutSpeed: 'instant',
    avgPayout: 0.02,
    successRate: 0.95,
    difficulty: 'easy'
  }
};

/**
 * Job Strategy Types
 */
const STRATEGIES = {
  'quick-payout': {
    name: 'Quick Payout',
    description: 'Prioritize jobs with instant or weekly payout',
    filter: (job) => ['instant', 'weekly'].includes(job.payoutSpeed),
    sort: (a, b) => {
      const speedScore = { instant: 3, weekly: 2, biweekly: 1, monthly: 0 };
      const aScore = speedScore[a.payoutSpeed] || 0;
      const bScore = speedScore[b.payoutSpeed] || 0;
      if (aScore !== bScore) return bScore - aScore;
      return b.payment - a.payment;
    }
  },
  'big-yield': {
    name: 'Big Yield',
    description: 'Target high-paying jobs ($0.05+)',
    filter: (job) => job.payment >= 0.05,
    sort: (a, b) => b.payment - a.payment
  },
  'guaranteed-completion': {
    name: 'Guaranteed Completion',
    description: 'Easy jobs with 90%+ success rate',
    filter: (job) => job.successRate >= 0.90 && job.difficulty === 'easy',
    sort: (a, b) => b.successRate - a.successRate
  },
  'balanced': {
    name: 'Balanced',
    description: 'Optimal mix of payment, speed, success, and difficulty',
    filter: () => true,
    sort: (a, b) => {
      // Weighted scoring: 40% payment, 30% speed, 20% success, 10% difficulty
      const speedScore = { instant: 1, weekly: 0.8, biweekly: 0.5, monthly: 0.2 };
      const difficultyScore = { easy: 1, medium: 0.6, hard: 0.3 };
      
      const aScore = (a.payment / 0.25) * 0.4 +
                     (speedScore[a.payoutSpeed] || 0) * 0.3 +
                     a.successRate * 0.2 +
                     (difficultyScore[a.difficulty] || 0) * 0.1;
      
      const bScore = (b.payment / 0.25) * 0.4 +
                     (speedScore[b.payoutSpeed] || 0) * 0.3 +
                     b.successRate * 0.2 +
                     (difficultyScore[b.difficulty] || 0) * 0.1;
      
      return bScore - aScore;
    }
  }
};

/**
 * AutoStartManager - Main class for autonomous job platform integration
 */
export class AutoStartManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      scanInterval: config.scanInterval || 30000, // 30 seconds
      strategy: config.strategy || 'balanced',
      encryptionKey: config.encryptionKey || process.env.ENCRYPTION_KEY,
      maxConcurrentJobs: config.maxConcurrentJobs || 5,
      minPayment: config.minPayment || 0.01,
      ...config
    };
    
    this.platforms = new Map();
    this.jobs = [];
    this.activeJobs = new Set();
    this.scanTimer = null;
    this.isRunning = false;
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      totalEarnings: 0,
      todayEarnings: 0,
      weekEarnings: 0,
      monthEarnings: 0
    };
    
    // Initialize AutoDocumentor and AutoFixer
    this.documentor = new AutoDocumentor({
      outputDir: config.reportDir || './reports'
    });
    this.fixer = new AutoFixer({
      autoFix: config.autoFix !== false,
      maxRetries: config.maxRetries || 3
    });
    
    // Initialize database
    this.initDatabase();
    
    // Initialize platforms
    this.initializePlatforms();
  }

  /**
   * Initialize database
   */
  async initDatabase() {
    try {
      this.db = await initializeDatabase();
      console.log('✅ Database initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Use AutoFixer to diagnose and fix
      await this.fixer.diagnoseAndFix(error, { operation: 'database_init' });
    }
  }

  /**
   * Initialize all platforms with their configurations
   */
  initializePlatforms() {
    Object.entries(PLATFORMS).forEach(([id, config]) => {
      this.platforms.set(id, {
        id,
        ...config,
        status: 'disconnected',
        apiKey: null,
        connected: false,
        lastScanned: null,
        jobsFound: 0,
        jobsCompleted: 0,
        earnings: 0
      });
    });
  }

  /**
   * Connect a platform with API key
   * @param {string} platformId - Platform identifier
   * @param {string} apiKey - Platform API key
   * @returns {Promise<object>} Connection result
   */
  async connectPlatform(platformId, apiKey) {
    if (!this.platforms.has(platformId)) {
      throw new Error(`Unknown platform: ${platformId}`);
    }

    const platform = this.platforms.get(platformId);
    
    try {
      // Encrypt and store API key
      const encryptedKey = this.encryptApiKey(apiKey);
      platform.apiKey = encryptedKey;
      
      // Test connection
      const isValid = await this.testPlatformConnection(platformId, apiKey);
      
      if (isValid) {
        platform.connected = true;
        platform.status = 'connected';
        platform.connectedAt = new Date().toISOString();
        
        this.emit('platform:connected', { platformId, platform: platform.name });
        
        return {
          success: true,
          platformId,
          status: 'connected'
        };
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      platform.status = 'error';
      platform.error = error.message;
      
      this.emit('platform:error', { platformId, error: error.message });
      
      return {
        success: false,
        platformId,
        error: error.message
      };
    }
  }

  /**
   * Test platform connection
   * @param {string} platformId - Platform identifier
   * @param {string} apiKey - API key to test
   * @returns {Promise<boolean>} Connection validity
   */
  async testPlatformConnection(platformId, apiKey) {
    // Simulate API validation
    // In production, this would make an actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return apiKey && apiKey.length > 10;
  }

  /**
   * Encrypt API key using AES-256-GCM
   * @param {string} apiKey - Plain API key
   * @returns {string} Encrypted API key
   */
  encryptApiKey(apiKey) {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Decrypt API key
   * @param {string} encryptedData - Encrypted API key
   * @returns {string} Decrypted API key
   */
  decryptApiKey(encryptedData) {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Start autonomous job scanning
   */
  async start() {
    if (this.isRunning) {
      return { success: false, error: 'Already running' };
    }

    this.isRunning = true;
    this.emit('system:started');
    
    // Start scanning loop
    this.scanTimer = setInterval(() => {
      this.scanAllPlatforms();
    }, this.config.scanInterval);
    
    // Initial scan
    await this.scanAllPlatforms();
    
    return { success: true, status: 'running' };
  }

  /**
   * Stop autonomous job scanning
   */
  stop() {
    if (!this.isRunning) {
      return { success: false, error: 'Not running' };
    }

    this.isRunning = false;
    
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    
    this.emit('system:stopped');
    
    return { success: true, status: 'stopped' };
  }

  /**
   * Emergency stop - stops system and cancels all active jobs
   */
  async emergencyStop() {
    this.stop();
    
    const jobsToCancel = this.activeJobs.size;
    
    // Cancel all active jobs
    const cancelPromises = Array.from(this.activeJobs).map(jobId => 
      this.cancelJob(jobId)
    );
    
    await Promise.allSettled(cancelPromises);
    
    this.emit('system:emergency-stopped');
    
    return {
      success: true,
      cancelledJobs: jobsToCancel
    };
  }

  /**
   * Scan all connected platforms for jobs
   */
  async scanAllPlatforms() {
    const connectedPlatforms = Array.from(this.platforms.values())
      .filter(p => p.connected);
    
    if (connectedPlatforms.length === 0) {
      return { success: false, error: 'No platforms connected' };
    }

    const scanPromises = connectedPlatforms.map(platform => 
      this.scanPlatform(platform.id)
    );
    
    const results = await Promise.allSettled(scanPromises);
    
    const newJobs = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.jobs || []);
    
    if (newJobs.length > 0) {
      this.jobs.push(...newJobs);
      this.processJobs(newJobs);
      
      // Generate daily report if job threshold met (e.g., every 100 jobs scanned)
      if (this.stats.totalJobs > 0 && this.stats.totalJobs % 100 === 0) {
        this.generateDailyReport().catch(err => 
          console.error('Error generating daily report:', err)
        );
      }
    }
    
    this.emit('scan:complete', {
      platformsScanned: connectedPlatforms.length,
      jobsFound: newJobs.length
    });
    
    return {
      success: true,
      platformsScanned: connectedPlatforms.length,
      jobsFound: newJobs.length
    };
  }

  /**
   * Scan a specific platform for jobs
   * @param {string} platformId - Platform identifier
   * @returns {Promise<object>} Scan results
   */
  async scanPlatform(platformId) {
    const platform = this.platforms.get(platformId);
    
    if (!platform || !platform.connected) {
      return { success: false, error: 'Platform not connected' };
    }

    try {
      // In production, this would make an actual API call
      // For now, simulate job discovery
      const jobs = await this.fetchPlatformJobs(platformId);
      
      platform.lastScanned = new Date().toISOString();
      platform.jobsFound += jobs.length;
      
      return {
        success: true,
        platformId,
        jobs
      };
    } catch (error) {
      platform.status = 'error';
      platform.error = error.message;
      
      return {
        success: false,
        platformId,
        error: error.message
      };
    }
  }

  /**
   * Fetch jobs from a platform (simulation)
   * @param {string} platformId - Platform identifier
   * @returns {Promise<Array>} Jobs array
   */
  async fetchPlatformJobs(platformId) {
    const platform = this.platforms.get(platformId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock jobs based on platform characteristics
    const numJobs = Math.floor(Math.random() * 5);
    const jobs = [];
    
    for (let i = 0; i < numJobs; i++) {
      jobs.push({
        id: `${platformId}-${Date.now()}-${i}`,
        platformId,
        platform: platform.name,
        title: `Task ${i + 1} on ${platform.name}`,
        description: `Complete data annotation task`,
        payment: platform.avgPayout * (0.8 + Math.random() * 0.4),
        payoutSpeed: platform.payoutSpeed,
        successRate: platform.successRate,
        difficulty: platform.difficulty,
        estimatedTime: Math.floor(Math.random() * 30) + 5,
        requiresApproval: !platform.autoApproval,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return jobs;
  }

  /**
   * Process jobs according to current strategy
   * @param {Array} jobs - Jobs to process
   */
  processJobs(jobs) {
    const strategy = STRATEGIES[this.config.strategy];
    
    if (!strategy) {
      this.emit('error', { message: 'Invalid strategy' });
      return;
    }

    // Filter and sort jobs according to strategy
    const filteredJobs = jobs.filter(strategy.filter);
    const sortedJobs = filteredJobs.sort(strategy.sort);
    
    // Process top jobs up to concurrent limit
    const availableSlots = this.config.maxConcurrentJobs - this.activeJobs.size;
    const jobsToProcess = sortedJobs.slice(0, availableSlots);
    
    jobsToProcess.forEach(job => {
      if (job.requiresApproval) {
        this.emit('job:approval-required', job);
      } else {
        this.executeJob(job);
      }
    });
  }

  /**
   * Execute a job
   * @param {object} job - Job to execute
   */
  async executeJob(job) {
    if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
      return { success: false, error: 'Max concurrent jobs reached' };
    }

    this.activeJobs.add(job.id);
    this.stats.totalJobs++;
    
    this.emit('job:started', job);
    
    try {
      // Simulate job execution
      await new Promise(resolve => setTimeout(resolve, job.estimatedTime * 1000));
      
      // Simulate success/failure based on platform success rate
      const success = Math.random() < job.successRate;
      
      if (success) {
        this.completeJob(job);
      } else {
        this.failJob(job, 'Task failed quality check');
      }
    } catch (error) {
      // Use AutoFixer to diagnose and attempt fix
      const diagnosis = await this.fixer.diagnoseAndFix(error, {
        operation: 'job_execution',
        job,
        platform: job.platformId
      });
      
      console.log('AutoFixer diagnosis:', diagnosis.status);
      
      this.failJob(job, error.message);
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Complete a job successfully
   * @param {object} job - Completed job
   */
  completeJob(job) {
    this.stats.completedJobs++;
    this.stats.totalEarnings += job.payment;
    this.stats.todayEarnings += job.payment;
    this.stats.weekEarnings += job.payment;
    this.stats.monthEarnings += job.payment;
    
    const platform = this.platforms.get(job.platformId);
    if (platform) {
      platform.jobsCompleted++;
      platform.earnings += job.payment;
    }
    
    this.emit('job:completed', {
      ...job,
      completedAt: new Date().toISOString(),
      earnings: job.payment
    });
  }

  /**
   * Fail a job
   * @param {object} job - Failed job
   * @param {string} reason - Failure reason
   */
  failJob(job, reason) {
    this.stats.failedJobs++;
    
    this.emit('job:failed', {
      ...job,
      failedAt: new Date().toISOString(),
      reason
    });
  }

  /**
   * Cancel a job
   * @param {string} jobId - Job identifier
   */
  async cancelJob(jobId) {
    if (!this.activeJobs.has(jobId)) {
      return { success: false, error: 'Job not active' };
    }

    this.activeJobs.delete(jobId);
    
    this.emit('job:cancelled', { jobId });
    
    return { success: true };
  }

  /**
   * Approve a pending job
   * @param {string} jobId - Job identifier
   * @returns {Promise<object>} Approval result
   */
  async approveJob(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (!job.requiresApproval) {
      return { success: false, error: 'Job does not require approval' };
    }

    await this.executeJob(job);
    
    return { success: true, jobId };
  }

  /**
   * Change job strategy
   * @param {string} strategy - New strategy name
   * @returns {object} Change result
   */
  changeStrategy(strategy) {
    if (!STRATEGIES[strategy]) {
      return { success: false, error: 'Invalid strategy' };
    }

    const oldStrategy = this.config.strategy;
    this.config.strategy = strategy;
    
    this.emit('strategy:changed', {
      oldStrategy,
      newStrategy: strategy
    });
    
    return {
      success: true,
      strategy,
      description: STRATEGIES[strategy].description
    };
  }

  /**
   * Get all platform statuses
   * @returns {Array} Platform statuses
   */
  getPlatformStatuses() {
    return Array.from(this.platforms.values()).map(platform => ({
      id: platform.id,
      name: platform.name,
      status: platform.status,
      connected: platform.connected,
      lastScanned: platform.lastScanned,
      jobsFound: platform.jobsFound,
      jobsCompleted: platform.jobsCompleted,
      earnings: platform.earnings,
      payoutSpeed: platform.payoutSpeed,
      avgPayout: platform.avgPayout,
      successRate: platform.successRate,
      difficulty: platform.difficulty
    }));
  }

  /**
   * Generate daily report using AutoDocumentor
   * @returns {Promise<string>} Path to generated report
   */
  async generateDailyReport() {
    try {
      const data = {
        totalJobsScanned: this.stats.totalJobs,
        jobsCompleted: this.stats.completedJobs,
        totalEarnings: this.stats.totalEarnings,
        platformsConnected: Array.from(this.platforms.values()).filter(p => p.connected).length,
        errors: this.stats.failedJobs,
        activeJobs: Array.from(this.activeJobs),
        topEarningPlatforms: this.getTopEarningPlatforms(),
        jobsByStrategy: { [this.config.strategy]: this.stats.completedJobs },
        averageCompletionTime: 0 // Would track this in production
      };

      const reportPath = await this.documentor.generateDailyReport(data);
      console.log(`📊 Daily report generated: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  }

  /**
   * Get top earning platforms
   * @returns {Array} Top platforms by earnings
   */
  getTopEarningPlatforms() {
    return Array.from(this.platforms.values())
      .filter(p => p.earnings > 0)
      .map(p => ({
        platform: p.name,
        earnings: p.earnings,
        jobs: p.jobsCompleted
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
  }

  /**
   * Get complete system status
   * @returns {object} System status
   */
  getCompleteStatus() {
    return {
      isRunning: this.isRunning,
      strategy: this.config.strategy,
      strategyDescription: STRATEGIES[this.config.strategy]?.description,
      platforms: this.getPlatformStatuses(),
      stats: {
        ...this.stats,
        activeJobs: this.activeJobs.size,
        availableSlots: this.config.maxConcurrentJobs - this.activeJobs.size
      },
      config: {
        scanInterval: this.config.scanInterval,
        maxConcurrentJobs: this.config.maxConcurrentJobs,
        minPayment: this.config.minPayment
      }
    };
  }

  /**
   * Get available strategies
   * @returns {Array} Available strategies
   */
  static getStrategies() {
    return Object.entries(STRATEGIES).map(([id, strategy]) => ({
      id,
      name: strategy.name,
      description: strategy.description
    }));
  }

  /**
   * Get platform configurations
   * @returns {object} Platform configurations
   */
  static getPlatformConfigs() {
    return PLATFORMS;
  }

  /**
   * Get list of configured platforms
   * @returns {Array} Array of platform configurations
   */
  getPlatforms() {
    return Array.from(this.platforms.values());
  }

  /**
   * Update configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfig(updates) {
    Object.assign(this.config, updates);
    
    // Emit configuration change event
    this.emit('config:updated', this.config);
  }

  /**
   * Select jobs by strategy
   * @param {Array} jobs - Available jobs
   * @param {string} strategy - Strategy to use (optional, uses config.strategy if not provided)
   * @returns {Array} Selected jobs
   */
  selectJobsByStrategy(jobs, strategy = null) {
    const strategyToUse = strategy || this.config.strategy;
    const strategyConfig = STRATEGIES[strategyToUse];

    if (!strategyConfig) {
      console.warn(`Unknown strategy: ${strategyToUse}, using balanced`);
      return this.selectJobsByStrategy(jobs, 'balanced');
    }

    // Filter jobs by minimum payment
    let filteredJobs = jobs.filter(job => job.payment >= this.config.minPayment);

    // Apply strategy filter
    filteredJobs = filteredJobs.filter(strategyConfig.filter);

    // Sort by strategy
    filteredJobs.sort(strategyConfig.sort);

    // Limit to max concurrent jobs
    return filteredJobs.slice(0, this.config.maxConcurrentJobs);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    this.removeAllListeners();
    this.platforms.clear();
    this.jobs = [];
    this.activeJobs.clear();
  }
}

export default AutoStartManager;
