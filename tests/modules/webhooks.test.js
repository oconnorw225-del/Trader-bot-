import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
/**
 * Tests for webhook manager module
 */

import webhookManager from '../../src/shared/webhookManager.js';
import axios from 'axios';

describe('Webhook Manager', () => {
  let axiosPostSpy;

  beforeEach(() => {
    webhookManager.clear();
    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    if (axiosPostSpy) {
      axiosPostSpy.mockRestore();
    }
  });

  describe('Webhook Registration', () => {
    test('should register a new webhook', () => {
      const webhook = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed', 'order.filled'],
        description: 'Trading webhook'
      });

      expect(webhook).toHaveProperty('id');
      expect(webhook.url).toBe('https://example.com/webhook');
      expect(webhook.events).toEqual(['order.placed', 'order.filled']);
      expect(webhook.enabled).toBe(true);
      expect(webhook.description).toBe('Trading webhook');
      expect(webhook).toHaveProperty('createdAt');
      expect(webhook).toHaveProperty('updatedAt');
    });

    test('should throw error if URL is missing', () => {
      expect(() => {
        webhookManager.registerWebhook({
          events: ['order.placed']
        });
      }).toThrow('Webhook URL is required');
    });

    test('should throw error if events array is missing', () => {
      expect(() => {
        webhookManager.registerWebhook({
          url: 'https://example.com/webhook'
        });
      }).toThrow('Webhook events array is required');
    });

    test('should throw error if events array is empty', () => {
      expect(() => {
        webhookManager.registerWebhook({
          url: 'https://example.com/webhook',
          events: []
        });
      }).toThrow('Webhook events array is required');
    });

    test('should register webhook with secret', () => {
      const webhook = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed'],
        secret: 'my-secret-key'
      });

      expect(webhook.secret).toBe('my-secret-key');
    });

    test('should register webhook as disabled', () => {
      const webhook = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed'],
        enabled: false
      });

      expect(webhook.enabled).toBe(false);
    });
  });

  describe('Webhook Management', () => {
    test('should list all webhooks', () => {
      webhookManager.registerWebhook({
        url: 'https://example.com/webhook1',
        events: ['order.placed']
      });
      webhookManager.registerWebhook({
        url: 'https://example.com/webhook2',
        events: ['job.found']
      });

      const webhooks = webhookManager.listWebhooks();

      expect(webhooks).toHaveLength(2);
      expect(webhooks[0].url).toBe('https://example.com/webhook1');
      expect(webhooks[1].url).toBe('https://example.com/webhook2');
    });

    test('should get specific webhook by ID', () => {
      const registered = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const webhook = webhookManager.getWebhook(registered.id);

      expect(webhook).toEqual(registered);
    });

    test('should return null for non-existent webhook', () => {
      const webhook = webhookManager.getWebhook('non-existent-id');

      expect(webhook).toBeNull();
    });

    test('should update webhook URL', () => {
      const registered = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const updated = webhookManager.updateWebhook(registered.id, {
        url: 'https://example.com/new-webhook'
      });

      expect(updated.url).toBe('https://example.com/new-webhook');
      expect(updated.id).toBe(registered.id);
    });

    test('should update webhook events', () => {
      const registered = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const updated = webhookManager.updateWebhook(registered.id, {
        events: ['order.placed', 'order.filled', 'position.closed']
      });

      expect(updated.events).toEqual(['order.placed', 'order.filled', 'position.closed']);
    });

    test('should update webhook enabled status', () => {
      const registered = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const updated = webhookManager.updateWebhook(registered.id, {
        enabled: false
      });

      expect(updated.enabled).toBe(false);
    });

    test('should throw error when updating with invalid events', () => {
      const registered = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      expect(() => {
        webhookManager.updateWebhook(registered.id, {
          events: []
        });
      }).toThrow('Events must be a non-empty array');
    });

    test('should return null when updating non-existent webhook', () => {
      const result = webhookManager.updateWebhook('non-existent-id', {
        url: 'https://example.com/webhook'
      });

      expect(result).toBeNull();
    });

    test('should delete webhook', () => {
      const registered = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const deleted = webhookManager.deleteWebhook(registered.id);

      expect(deleted).toBe(true);
      expect(webhookManager.getWebhook(registered.id)).toBeNull();
    });

    test('should return false when deleting non-existent webhook', () => {
      const deleted = webhookManager.deleteWebhook('non-existent-id');

      expect(deleted).toBe(false);
    });
  });

  describe('Event Triggering', () => {
    test('should trigger event to subscribed webhooks', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345',
        symbol: 'BTC/USD',
        quantity: 1
      });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].statusCode).toBe(200);
      expect(axiosPostSpy).toHaveBeenCalledTimes(1);
    });

    test('should not trigger event to webhooks not subscribed to event type', async () => {
      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['job.found']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(results).toHaveLength(0);
      expect(axiosPostSpy).not.toHaveBeenCalled();
    });

    test('should not trigger event to disabled webhooks', async () => {
      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed'],
        enabled: false
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(results).toHaveLength(0);
      expect(axiosPostSpy).not.toHaveBeenCalled();
    });

    test('should include webhook secret in headers', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed'],
        secret: 'my-secret-key'
      });

      await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(axiosPostSpy).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Secret': 'my-secret-key'
          })
        })
      );
    });

    test('should send correct payload to webhook', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      const webhook = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const eventData = {
        orderId: '12345',
        symbol: 'BTC/USD',
        quantity: 1
      };

      await webhookManager.triggerEvent('order.placed', eventData);

      expect(axiosPostSpy).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          event: 'order.placed',
          data: eventData,
          webhookId: webhook.id
        }),
        expect.any(Object)
      );
    });
  });

  describe('Retry Logic', () => {
    test('should retry on failure with exponential backoff', async () => {
      // Fail 2 times, then succeed
      axiosPostSpy
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          data: { success: true }
        });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(results[0].success).toBe(true);
      expect(results[0].attempt).toBe(3);
      expect(axiosPostSpy).toHaveBeenCalledTimes(3);
    });

    test('should stop retrying after max retries', async () => {
      axiosPostSpy.mockRejectedValue(new Error('Network error'));

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Network error');
      expect(axiosPostSpy).toHaveBeenCalledTimes(4); // Initial + 3 retries
    }, 10000);

    test('should capture error details on failure', async () => {
      axiosPostSpy.mockRejectedValue({
        message: 'Request failed',
        response: { status: 500 }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(results[0].success).toBe(false);
      expect(results[0].statusCode).toBe(500);
      expect(results[0].error).toBe('Request failed');
    }, 10000);
  });

  describe('Webhook Testing', () => {
    test('should test webhook with test event', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      const webhook = webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      const result = await webhookManager.testWebhook(webhook.id);

      expect(result.success).toBe(true);
      expect(axiosPostSpy).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          event: 'webhook.test',
          data: expect.objectContaining({
            message: 'This is a test webhook delivery'
          })
        }),
        expect.any(Object)
      );
    });

    test('should throw error when testing non-existent webhook', async () => {
      await expect(
        webhookManager.testWebhook('non-existent-id')
      ).rejects.toThrow('Webhook not found');
    });
  });

  describe('Event History', () => {
    test('should track event history', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      const history = webhookManager.getEventHistory();

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('order.placed');
      expect(history[0].data).toEqual({ orderId: '12345' });
      expect(history[0].deliveries).toHaveLength(1);
    });

    test('should filter event history by type', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed', 'job.found']
      });

      await webhookManager.triggerEvent('order.placed', { orderId: '1' });
      await webhookManager.triggerEvent('job.found', { jobId: '2' });
      await webhookManager.triggerEvent('order.placed', { orderId: '3' });

      const history = webhookManager.getEventHistory({
        eventType: 'order.placed'
      });

      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('order.placed');
      expect(history[1].type).toBe('order.placed');
    });

    test('should limit event history', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      await webhookManager.triggerEvent('order.placed', { orderId: '1' });
      await webhookManager.triggerEvent('order.placed', { orderId: '2' });
      await webhookManager.triggerEvent('order.placed', { orderId: '3' });

      const history = webhookManager.getEventHistory({ limit: 2 });

      expect(history).toHaveLength(2);
      expect(history[0].data.orderId).toBe('2');
      expect(history[1].data.orderId).toBe('3');
    });

    test('should maintain max history size', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook',
        events: ['order.placed']
      });

      // Override maxHistorySize for testing
      const originalMaxSize = webhookManager.maxHistorySize;
      webhookManager.maxHistorySize = 5;

      // Trigger more events than max size
      for (let i = 0; i < 10; i++) {
        await webhookManager.triggerEvent('order.placed', { orderId: `${i}` });
      }

      const history = webhookManager.getEventHistory();

      expect(history.length).toBeLessThanOrEqual(5);

      // Restore original value
      webhookManager.maxHistorySize = originalMaxSize;
    });
  });

  describe('Multiple Webhooks', () => {
    test('should trigger multiple webhooks for same event', async () => {
      axiosPostSpy.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook1',
        events: ['order.placed']
      });
      webhookManager.registerWebhook({
        url: 'https://example.com/webhook2',
        events: ['order.placed']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(axiosPostSpy).toHaveBeenCalledTimes(2);
    });

    test('should continue delivery even if one webhook fails', async () => {
      axiosPostSpy
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          data: { success: true }
        });

      webhookManager.registerWebhook({
        url: 'https://example.com/webhook1',
        events: ['order.placed']
      });
      webhookManager.registerWebhook({
        url: 'https://example.com/webhook2',
        events: ['order.placed']
      });

      const results = await webhookManager.triggerEvent('order.placed', {
        orderId: '12345'
      });

      // First webhook should fail after retries, second should succeed
      expect(results).toHaveLength(2);
    }, 10000);
  });
});
