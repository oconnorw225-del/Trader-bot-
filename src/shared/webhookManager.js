import axios from 'axios';

/**
 * Webhook Manager for real-time event notifications
 * Supports automatic retries with exponential backoff
 * Enhanced with archival functionality instead of deletion
 */
class WebhookManager {
  constructor() {
    this.webhooks = new Map();
    this.archivedWebhooks = new Map(); // Archive instead of delete
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    this.maxRetries = 3;
    this.baseRetryDelay = 1000; // 1 second
  }

  /**
   * Register a new webhook
   * @param {object} webhook - Webhook configuration
   * @returns {object} Registered webhook with ID
   */
  registerWebhook(webhook) {
    if (!webhook.url) {
      throw new Error('Webhook URL is required');
    }
    if (!webhook.events || !Array.isArray(webhook.events) || webhook.events.length === 0) {
      throw new Error('Webhook events array is required');
    }

    const id = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const webhookData = {
      id,
      url: webhook.url,
      events: webhook.events,
      enabled: webhook.enabled !== false,
      secret: webhook.secret || null,
      description: webhook.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.webhooks.set(id, webhookData);
    return webhookData;
  }

  /**
   * Get all registered webhooks
   * @returns {Array} List of webhooks
   */
  listWebhooks() {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get a specific webhook by ID
   * @param {string} id - Webhook ID
   * @returns {object|null} Webhook data or null if not found
   */
  getWebhook(id) {
    return this.webhooks.get(id) || null;
  }

  /**
   * Update a webhook
   * @param {string} id - Webhook ID
   * @param {object} updates - Fields to update
   * @returns {object|null} Updated webhook or null if not found
   */
  updateWebhook(id, updates) {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      return null;
    }

    if (updates.url !== undefined) {
      webhook.url = updates.url;
    }
    if (updates.events !== undefined) {
      if (!Array.isArray(updates.events) || updates.events.length === 0) {
        throw new Error('Events must be a non-empty array');
      }
      webhook.events = updates.events;
    }
    if (updates.enabled !== undefined) {
      webhook.enabled = updates.enabled;
    }
    if (updates.secret !== undefined) {
      webhook.secret = updates.secret;
    }
    if (updates.description !== undefined) {
      webhook.description = updates.description;
    }

    webhook.updatedAt = new Date().toISOString();
    this.webhooks.set(id, webhook);
    return webhook;
  }

  /**
   * Archive a webhook instead of deleting (soft delete)
   * @param {string} id - Webhook ID
   * @param {object} archivedData - Optional archived webhook data
   * @returns {boolean} True if archived, false if not found
   */
  archiveWebhook(id, archivedData = null) {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      return false;
    }
    
    // Archive with metadata
    const archived = archivedData || {
      ...webhook,
      archived_at: new Date().toISOString(),
      status: 'archived'
    };
    
    this.archivedWebhooks.set(id, archived);
    this.webhooks.delete(id);
    return true;
  }

  /**
   * Get a webhook from either active or archived collections
   * @param {string} id - Webhook ID
   * @returns {object|null} Webhook if found, null otherwise
   */
  getWebhook(id) {
    return this.webhooks.get(id) || this.archivedWebhooks.get(id) || null;
  }

  /**
   * Restore an archived webhook
   * @param {string} id - Webhook ID
   * @returns {boolean} True if restored, false if not found
   */
  restoreWebhook(id) {
    const webhook = this.archivedWebhooks.get(id);
    if (!webhook) {
      return false;
    }
    
    // Restore and remove archive metadata
    const restored = { ...webhook };
    delete restored.archived_at;
    delete restored.status;
    
    this.webhooks.set(id, restored);
    this.archivedWebhooks.delete(id);
    return true;
  }

  /**
   * Legacy method - now archives instead of deleting
   * @deprecated Use archiveWebhook() for clarity
   * @param {string} id - Webhook ID
   * @returns {boolean} True if archived, false if not found
   */
  deleteWebhook(id) {
    console.warn('deleteWebhook is deprecated. Webhook will be archived instead of deleted.');
    return this.archiveWebhook(id);
  }

  /**
   * Trigger an event to all subscribed webhooks
   * @param {string} eventType - Event type (e.g., 'order.placed')
   * @param {object} eventData - Event payload
   * @returns {Promise<Array>} Array of delivery results
   */
  async triggerEvent(eventType, eventData) {
    const results = [];
    const subscribedWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.enabled && webhook.events.includes(eventType));

    const eventRecord = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      deliveries: []
    };

    for (const webhook of subscribedWebhooks) {
      const deliveryResult = await this._deliverWebhook(webhook, eventType, eventData);
      results.push(deliveryResult);
      eventRecord.deliveries.push(deliveryResult);
    }

    this._addToHistory(eventRecord);
    return results;
  }

  /**
   * Test a webhook by sending a test event
   * @param {string} id - Webhook ID
   * @returns {Promise<object>} Delivery result
   */
  async testWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testEvent = {
      type: 'webhook.test',
      data: {
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString()
      }
    };

    return await this._deliverWebhook(webhook, testEvent.type, testEvent.data);
  }

  /**
   * Get event history
   * @param {object} options - Filter options
   * @returns {Array} Filtered event history
   */
  getEventHistory(options = {}) {
    let history = [...this.eventHistory];

    if (options.eventType) {
      history = history.filter(event => event.type === options.eventType);
    }

    if (options.limit) {
      history = history.slice(-options.limit);
    }

    return history;
  }

  /**
   * Deliver webhook with retry logic
   * @private
   */
  async _deliverWebhook(webhook, eventType, eventData, retryCount = 0) {
    const deliveryAttempt = {
      webhookId: webhook.id,
      url: webhook.url,
      eventType,
      timestamp: new Date().toISOString(),
      attempt: retryCount + 1,
      success: false,
      statusCode: null,
      error: null,
      responseTime: null
    };

    const startTime = Date.now();

    try {
      const payload = {
        event: eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
        webhookId: webhook.id
      };

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'NDAX-Quantum-Engine-Webhook/1.0'
      };

      if (webhook.secret) {
        headers['X-Webhook-Secret'] = webhook.secret;
      }

      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300
      });

      deliveryAttempt.success = true;
      deliveryAttempt.statusCode = response.status;
      deliveryAttempt.responseTime = Date.now() - startTime;

      return deliveryAttempt;
    } catch (error) {
      deliveryAttempt.error = error.message;
      deliveryAttempt.statusCode = error.response?.status || null;
      deliveryAttempt.responseTime = Date.now() - startTime;

      // Retry with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.baseRetryDelay * Math.pow(2, retryCount);
        await this._sleep(delay);
        return await this._deliverWebhook(webhook, eventType, eventData, retryCount + 1);
      }

      return deliveryAttempt;
    }
  }

  /**
   * Add event to history
   * @private
   */
  _addToHistory(eventRecord) {
    this.eventHistory.push(eventRecord);

    // Keep only recent history
    if (this.eventHistory.length > this.maxHistorySize) {
      const excessCount = this.eventHistory.length - this.maxHistorySize;
      this.eventHistory.splice(0, excessCount);
    }
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all webhooks and history (for testing)
   */
  clear() {
    this.webhooks.clear();
    this.eventHistory = [];
  }
}

// Export singleton instance
const webhookManager = new WebhookManager();
export default webhookManager;
