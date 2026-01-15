/**
 * Database Models for Auto-Start System
 * In-memory database implementation using Map for simplicity
 * Can be extended to use SQLite, PostgreSQL, or other databases
 */

/**
 * Job Model - Represents a job from AI platforms
 */
class Job {
  constructor(data) {
    this.id = data.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.platform = data.platform;
    this.title = data.title;
    this.description = data.description;
    this.payment = data.payment || 0;
    this.difficulty = data.difficulty || 'medium';
    this.estimatedTime = data.estimatedTime || 0;
    this.requirements = data.requirements || [];
    this.status = data.status || 'available'; // available, in-progress, completed, failed
    this.createdAt = data.createdAt || new Date();
    this.startedAt = data.startedAt || null;
    this.completedAt = data.completedAt || null;
    this.earnings = data.earnings || 0;
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      title: this.title,
      description: this.description,
      payment: this.payment,
      difficulty: this.difficulty,
      estimatedTime: this.estimatedTime,
      requirements: this.requirements,
      status: this.status,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      earnings: this.earnings,
      metadata: this.metadata
    };
  }
}

/**
 * APIUsage Model - Tracks API usage and rate limits
 */
class APIUsage {
  constructor(data) {
    this.id = data.id || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.platform = data.platform;
    this.endpoint = data.endpoint;
    this.requestCount = data.requestCount || 0;
    this.lastRequest = data.lastRequest || null;
    this.rateLimitRemaining = data.rateLimitRemaining || null;
    this.rateLimitReset = data.rateLimitReset || null;
    this.errors = data.errors || 0;
    this.metadata = data.metadata || {};
  }

  incrementUsage() {
    this.requestCount++;
    this.lastRequest = new Date();
  }

  incrementErrors() {
    this.errors++;
  }

  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      endpoint: this.endpoint,
      requestCount: this.requestCount,
      lastRequest: this.lastRequest,
      rateLimitRemaining: this.rateLimitRemaining,
      rateLimitReset: this.rateLimitReset,
      errors: this.errors,
      metadata: this.metadata
    };
  }
}

/**
 * PlatformConnection Model - Manages platform connection status
 */
class PlatformConnection {
  constructor(data) {
    this.id = data.id || `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.platform = data.platform;
    this.status = data.status || 'disconnected'; // connected, disconnected, error
    this.apiKey = data.apiKey || null;
    this.apiSecret = data.apiSecret || null;
    this.lastConnected = data.lastConnected || null;
    this.lastError = data.lastError || null;
    this.connectionAttempts = data.connectionAttempts || 0;
    this.successfulRequests = data.successfulRequests || 0;
    this.failedRequests = data.failedRequests || 0;
    this.metadata = data.metadata || {};
  }

  markConnected() {
    this.status = 'connected';
    this.lastConnected = new Date();
    this.lastError = null;
  }

  markDisconnected() {
    this.status = 'disconnected';
  }

  markError(error) {
    this.status = 'error';
    this.lastError = error;
    this.connectionAttempts++;
  }

  incrementSuccessful() {
    this.successfulRequests++;
  }

  incrementFailed() {
    this.failedRequests++;
  }

  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      status: this.status,
      lastConnected: this.lastConnected,
      lastError: this.lastError,
      connectionAttempts: this.connectionAttempts,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      metadata: this.metadata
    };
  }
}

/**
 * BotState Model - Tracks bot state and configuration
 */
class BotState {
  constructor(data) {
    this.id = data.id || 'bot_state';
    this.isRunning = data.isRunning || false;
    this.strategy = data.strategy || 'balanced';
    this.maxConcurrentJobs = data.maxConcurrentJobs || 5;
    this.minPayment = data.minPayment || 0.01;
    this.scanInterval = data.scanInterval || 30000;
    this.activeJobs = data.activeJobs || [];
    this.totalJobsCompleted = data.totalJobsCompleted || 0;
    this.totalEarnings = data.totalEarnings || 0;
    this.totalErrors = data.totalErrors || 0;
    this.startedAt = data.startedAt || null;
    this.lastActivity = data.lastActivity || null;
    this.metadata = data.metadata || {};
  }

  start() {
    this.isRunning = true;
    this.startedAt = new Date();
    this.lastActivity = new Date();
  }

  stop() {
    this.isRunning = false;
    this.lastActivity = new Date();
  }

  addActiveJob(jobId) {
    if (!this.activeJobs.includes(jobId)) {
      this.activeJobs.push(jobId);
      this.lastActivity = new Date();
    }
  }

  removeActiveJob(jobId) {
    this.activeJobs = this.activeJobs.filter(id => id !== jobId);
    this.lastActivity = new Date();
  }

  incrementCompleted(earnings = 0) {
    this.totalJobsCompleted++;
    this.totalEarnings += earnings;
    this.lastActivity = new Date();
  }

  incrementErrors() {
    this.totalErrors++;
    this.lastActivity = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      isRunning: this.isRunning,
      strategy: this.strategy,
      maxConcurrentJobs: this.maxConcurrentJobs,
      minPayment: this.minPayment,
      scanInterval: this.scanInterval,
      activeJobs: this.activeJobs,
      totalJobsCompleted: this.totalJobsCompleted,
      totalEarnings: this.totalEarnings,
      totalErrors: this.totalErrors,
      startedAt: this.startedAt,
      lastActivity: this.lastActivity,
      metadata: this.metadata
    };
  }
}

/**
 * In-Memory Database Implementation
 * Enhanced with archival functionality instead of deletion
 */
class Database {
  constructor() {
    this.jobs = new Map();
    this.archivedJobs = new Map(); // Archive instead of delete
    this.apiUsage = new Map();
    this.platformConnections = new Map();
    this.botState = null;
    this.initialized = false;
  }

  /**
   * Initialize database
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Initialize bot state
    this.botState = new BotState({});
    this.initialized = true;
  }

  // Job operations
  async createJob(data) {
    const job = new Job(data);
    this.jobs.set(job.id, job);
    return job;
  }

  async getJob(id) {
    return this.jobs.get(id) || null;
  }

  async updateJob(id, updates) {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }
    Object.assign(job, updates);
    return job;
  }

  /**
   * Archive a job instead of deleting (soft delete)
   * @param {string} id - Job ID
   * @returns {boolean} True if archived, false if not found
   */
  async archiveJob(id) {
    const job = this.jobs.get(id);
    if (!job) {
      return false;
    }
    
    // Archive with metadata
    const archived = {
      ...job,
      archived_at: new Date().toISOString(),
      status: 'archived'
    };
    
    this.archivedJobs.set(id, archived);
    this.jobs.delete(id);
    return true;
  }

  /**
   * Restore an archived job
   * @param {string} id - Job ID
   * @returns {boolean} True if restored, false if not found
   */
  async restoreJob(id) {
    const job = this.archivedJobs.get(id);
    if (!job) {
      return false;
    }
    
    // Restore and remove archive metadata
    const restored = { ...job };
    delete restored.archived_at;
    // Restore original status or set to available
    if (restored.status === 'archived') {
      restored.status = 'available';
    }
    
    this.jobs.set(id, restored);
    this.archivedJobs.delete(id);
    return true;
  }

  /**
   * Legacy method - now archives instead of deleting
   * @deprecated Use archiveJob() for clarity
   * @param {string} id - Job ID
   * @returns {boolean} True if archived, false if not found
   */
  async deleteJob(id) {
    console.warn('deleteJob is deprecated. Job will be archived instead of deleted.');
    return this.archiveJob(id);
  }

  async findJobs(filter = {}) {
    const jobs = Array.from(this.jobs.values());
    return jobs.filter(job => {
      for (const [key, value] of Object.entries(filter)) {
        if (job[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async getAllJobs() {
    return Array.from(this.jobs.values());
  }

  // API Usage operations
  async createAPIUsage(data) {
    const usage = new APIUsage(data);
    const key = `${usage.platform}_${usage.endpoint}`;
    this.apiUsage.set(key, usage);
    return usage;
  }

  async getAPIUsage(platform, endpoint) {
    const key = `${platform}_${endpoint}`;
    return this.apiUsage.get(key) || null;
  }

  async updateAPIUsage(platform, endpoint, updates) {
    const key = `${platform}_${endpoint}`;
    const usage = this.apiUsage.get(key);
    if (!usage) {
      // Create if doesn't exist
      return this.createAPIUsage({ platform, endpoint, ...updates });
    }
    Object.assign(usage, updates);
    return usage;
  }

  // Platform Connection operations
  async createPlatformConnection(data) {
    const connection = new PlatformConnection(data);
    this.platformConnections.set(connection.platform, connection);
    return connection;
  }

  async getPlatformConnection(platform) {
    return this.platformConnections.get(platform) || null;
  }

  async updatePlatformConnection(platform, updates) {
    const connection = this.platformConnections.get(platform);
    if (!connection) {
      return this.createPlatformConnection({ platform, ...updates });
    }
    Object.assign(connection, updates);
    return connection;
  }

  async getAllPlatformConnections() {
    return Array.from(this.platformConnections.values());
  }

  // Bot State operations
  async getBotState() {
    if (!this.botState) {
      this.botState = new BotState({});
    }
    return this.botState;
  }

  async updateBotState(updates) {
    if (!this.botState) {
      this.botState = new BotState({});
    }
    Object.assign(this.botState, updates);
    return this.botState;
  }

  /**
   * Clear all data (useful for testing)
   */
  async clear() {
    this.jobs.clear();
    this.apiUsage.clear();
    this.platformConnections.clear();
    this.botState = new BotState({});
  }

  /**
   * Get database statistics
   */
  async getStats() {
    return {
      totalJobs: this.jobs.size,
      totalAPIUsage: this.apiUsage.size,
      totalPlatformConnections: this.platformConnections.size,
      initialized: this.initialized
    };
  }
}

// Singleton instance
let dbInstance = null;

/**
 * Initialize database and return singleton instance
 */
export async function initializeDatabase() {
  if (!dbInstance) {
    dbInstance = new Database();
    await dbInstance.initialize();
  }
  return dbInstance;
}

/**
 * Get database instance (must be initialized first)
 */
export function getDatabase() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

// Export models
export { Job, APIUsage, PlatformConnection, BotState, Database };
