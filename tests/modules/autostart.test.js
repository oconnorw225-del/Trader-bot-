import { jest, describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
/**
 * Tests for AutoStartManager
 */

import { AutoStartManager } from '../../src/services/AutoStartManager.js';

describe('AutoStartManager', () => {
  let manager;
  let consoleLogSpy;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    manager = new AutoStartManager({
      scanInterval: 1000,
      strategy: 'balanced',
      encryptionKey: 'test-encryption-key-32-characters'
    });
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(manager).toBeDefined();
      expect(manager.config.strategy).toBe('balanced');
      expect(manager.config.scanInterval).toBe(1000);
      expect(manager.isRunning).toBe(false);
    });

    test('should initialize all 12 platforms', () => {
      expect(manager.platforms.size).toBe(12);
      expect(manager.platforms.has('toloka')).toBe(true);
      expect(manager.platforms.has('spare5')).toBe(true);
    });

    test('should initialize with correct stats', () => {
      expect(manager.stats.totalJobs).toBe(0);
      expect(manager.stats.completedJobs).toBe(0);
      expect(manager.stats.totalEarnings).toBe(0);
    });
  });

  describe('Platform Management', () => {
    test('should connect platform with valid API key', async () => {
      const result = await manager.connectPlatform('toloka', 'test-api-key-123');
      
      expect(result.success).toBe(true);
      expect(result.platformId).toBe('toloka');
      
      const platform = manager.platforms.get('toloka');
      expect(platform.connected).toBe(true);
      expect(platform.status).toBe('connected');
    });

    test('should reject connection with invalid platform', async () => {
      await expect(
        manager.connectPlatform('invalid-platform', 'test-key')
      ).rejects.toThrow('Unknown platform');
    });

    test('should get platform statuses', () => {
      const statuses = manager.getPlatformStatuses();
      
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBe(12);
      expect(statuses[0]).toHaveProperty('id');
      expect(statuses[0]).toHaveProperty('name');
      expect(statuses[0]).toHaveProperty('status');
    });
  });

  describe('API Key Encryption', () => {
    test('should encrypt API key', () => {
      const apiKey = 'my-secret-api-key';
      const encrypted = manager.encryptApiKey(apiKey);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(apiKey);
      expect(typeof encrypted).toBe('string');
    });

    test('should decrypt API key', () => {
      const apiKey = 'my-secret-api-key';
      const encrypted = manager.encryptApiKey(apiKey);
      const decrypted = manager.decryptApiKey(encrypted);
      
      expect(decrypted).toBe(apiKey);
    });

    test('should throw error if encryption key not configured', () => {
      const managerNoKey = new AutoStartManager({ encryptionKey: null });
      
      expect(() => {
        managerNoKey.encryptApiKey('test');
      }).toThrow('Encryption key not configured');
      
      managerNoKey.destroy();
    });
  });

  describe('System Control', () => {
    test('should start system', async () => {
      const result = await manager.start();
      
      expect(result.success).toBe(true);
      expect(manager.isRunning).toBe(true);
      expect(manager.scanTimer).toBeDefined();
    });

    test('should not start if already running', async () => {
      await manager.start();
      const result = await manager.start();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Already running');
    });

    test('should stop system', async () => {
      await manager.start();
      const result = manager.stop();
      
      expect(result.success).toBe(true);
      expect(manager.isRunning).toBe(false);
      expect(manager.scanTimer).toBeNull();
    });

    test('should not stop if not running', () => {
      const result = manager.stop();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not running');
    });

    test('should emergency stop and cancel jobs', async () => {
      await manager.start();
      manager.activeJobs.add('job-1');
      manager.activeJobs.add('job-2');
      
      const result = await manager.emergencyStop();
      
      expect(result.success).toBe(true);
      expect(result.cancelledJobs).toBe(2);
      expect(manager.isRunning).toBe(false);
    });
  });

  describe('Strategy Management', () => {
    test('should change strategy', () => {
      const result = manager.changeStrategy('quick-payout');
      
      expect(result.success).toBe(true);
      expect(manager.config.strategy).toBe('quick-payout');
    });

    test('should reject invalid strategy', () => {
      const result = manager.changeStrategy('invalid-strategy');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid strategy');
    });

    test('should get available strategies', () => {
      const strategies = AutoStartManager.getStrategies();
      
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBe(4);
      expect(strategies[0]).toHaveProperty('id');
      expect(strategies[0]).toHaveProperty('name');
      expect(strategies[0]).toHaveProperty('description');
    });
  });

  describe('Job Management', () => {
    test('should approve job', async () => {
      const job = {
        id: 'test-job-1',
        title: 'Test Job',
        payment: 0.10,
        requiresApproval: true,
        estimatedTime: 1, // Short time for testing
        successRate: 0.9,
        payoutSpeed: 'instant',
        difficulty: 'easy',
        platformId: 'toloka'
      };
      
      manager.jobs.push(job);
      
      const result = await manager.approveJob('test-job-1');
      
      expect(result.success).toBe(true);
    }, 10000); // 10 second timeout

    test('should reject approval for non-existent job', async () => {
      const result = await manager.approveJob('non-existent-job');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Job not found');
    });

    test('should cancel active job', async () => {
      manager.activeJobs.add('test-job-1');
      
      const result = await manager.cancelJob('test-job-1');
      
      expect(result.success).toBe(true);
      expect(manager.activeJobs.has('test-job-1')).toBe(false);
    });
  });

  describe('Status Reporting', () => {
    test('should get complete status', () => {
      const status = manager.getCompleteStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('strategy');
      expect(status).toHaveProperty('platforms');
      expect(status).toHaveProperty('stats');
      expect(status).toHaveProperty('config');
      expect(Array.isArray(status.platforms)).toBe(true);
    });

    test('should include active jobs in stats', async () => {
      manager.activeJobs.add('job-1');
      manager.activeJobs.add('job-2');
      
      const status = manager.getCompleteStatus();
      
      expect(status.stats.activeJobs).toBe(2);
      expect(status.stats.availableSlots).toBe(3); // 5 max - 2 active
    });
  });

  describe('Event Emission', () => {
    test('should emit system:started event', (done) => {
      manager.on('system:started', () => {
        expect(manager.isRunning).toBe(true);
        done();
      });
      
      manager.start();
    });

    test('should emit system:stopped event', (done) => {
      manager.on('system:stopped', () => {
        expect(manager.isRunning).toBe(false);
        done();
      });
      
      manager.start().then(() => {
        manager.stop();
      });
    });

    test('should emit platform:connected event', (done) => {
      manager.on('platform:connected', ({ platformId, platform }) => {
        expect(platformId).toBe('toloka');
        expect(platform).toBe('Toloka');
        done();
      });
      
      manager.connectPlatform('toloka', 'test-api-key');
    });

    test('should emit strategy:changed event', (done) => {
      manager.on('strategy:changed', ({ oldStrategy, newStrategy }) => {
        expect(oldStrategy).toBe('balanced');
        expect(newStrategy).toBe('quick-payout');
        done();
      });
      
      manager.changeStrategy('quick-payout');
    });
  });

  describe('Platform Configurations', () => {
    test('should get platform configurations', () => {
      const configs = AutoStartManager.getPlatformConfigs();
      
      expect(configs).toBeDefined();
      expect(configs.toloka).toBeDefined();
      expect(configs.toloka.name).toBe('Toloka');
      expect(configs.toloka.signupUrl).toContain('http');
      expect(configs.toloka.apiUrl).toContain('http');
    });

    test('should have all required platform properties', () => {
      const configs = AutoStartManager.getPlatformConfigs();
      
      Object.values(configs).forEach(platform => {
        expect(platform).toHaveProperty('name');
        expect(platform).toHaveProperty('signupUrl');
        expect(platform).toHaveProperty('apiUrl');
        expect(platform).toHaveProperty('loginUrl');
        expect(platform).toHaveProperty('requirements');
        expect(platform).toHaveProperty('autoApproval');
        expect(platform).toHaveProperty('payoutSpeed');
        expect(platform).toHaveProperty('avgPayout');
        expect(platform).toHaveProperty('successRate');
        expect(platform).toHaveProperty('difficulty');
      });
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources on destroy', () => {
      manager.start();
      manager.destroy();
      
      expect(manager.isRunning).toBe(false);
      expect(manager.scanTimer).toBeNull();
      expect(manager.platforms.size).toBe(0);
      expect(manager.jobs.length).toBe(0);
    });
  });
});
