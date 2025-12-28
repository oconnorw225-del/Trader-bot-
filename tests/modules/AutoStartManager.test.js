import { jest, describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
/**
 * Tests for AutoStartManager
 * Basic Jest tests for job selection strategies
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
      strategy: 'balanced',
      scanInterval: 30000,
      maxConcurrentJobs: 5,
      minPayment: 0.01,
      encryptionKey: 'test-key-12345678901234567890123'
    });
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
  });

  describe('Job Selection Strategy', () => {
    test('should select jobs with quick-payout strategy', () => {
      const mockJobs = [
        { id: 'job1', title: 'Quick Task', payment: 0.05, estimatedTime: 5, platform: 'toloka', payoutSpeed: 'weekly', successRate: 0.85, difficulty: 'easy' },
        { id: 'job2', title: 'Medium Task', payment: 0.15, estimatedTime: 15, platform: 'remotasks', payoutSpeed: 'instant', successRate: 0.88, difficulty: 'medium' },
        { id: 'job3', title: 'Long Task', payment: 0.50, estimatedTime: 60, platform: 'scaleai', payoutSpeed: 'monthly', successRate: 0.75, difficulty: 'hard' }
      ];

      const selected = manager.selectJobsByStrategy(mockJobs, 'quick-payout');

      expect(selected).toBeDefined();
      expect(Array.isArray(selected)).toBe(true);
      expect(selected.length).toBeGreaterThan(0);
      
      // Quick payout should prefer instant/weekly payout
      if (selected.length > 0) {
        expect(['instant', 'weekly']).toContain(selected[0].payoutSpeed);
      }
    });

    test('should select jobs with big-yield strategy', () => {
      const mockJobs = [
        { id: 'job1', title: 'Small Task', payment: 0.05, estimatedTime: 5, platform: 'toloka', payoutSpeed: 'weekly', successRate: 0.85, difficulty: 'easy' },
        { id: 'job2', title: 'Medium Task', payment: 0.15, estimatedTime: 15, platform: 'remotasks', payoutSpeed: 'weekly', successRate: 0.88, difficulty: 'medium' },
        { id: 'job3', title: 'Big Task', payment: 0.50, estimatedTime: 30, platform: 'scaleai', payoutSpeed: 'weekly', successRate: 0.75, difficulty: 'hard' }
      ];

      const selected = manager.selectJobsByStrategy(mockJobs, 'big-yield');

      expect(selected).toBeDefined();
      expect(Array.isArray(selected)).toBe(true);
      expect(selected.length).toBeGreaterThan(0);
      
      // Big yield should prefer jobs with higher payment
      if (selected.length > 1) {
        expect(selected[0].payment).toBeGreaterThanOrEqual(selected[1].payment);
      }
    });

    test('should select jobs with guaranteed-completion strategy', () => {
      const mockJobs = [
        { id: 'job1', title: 'Hard Task', payment: 0.50, difficulty: 'hard', platform: 'scaleai', payoutSpeed: 'weekly', successRate: 0.75 },
        { id: 'job2', title: 'Easy Task', payment: 0.05, difficulty: 'easy', platform: 'toloka', payoutSpeed: 'weekly', successRate: 0.92 },
        { id: 'job3', title: 'Medium Task', payment: 0.15, difficulty: 'medium', platform: 'remotasks', payoutSpeed: 'weekly', successRate: 0.88 }
      ];

      const selected = manager.selectJobsByStrategy(mockJobs, 'guaranteed-completion');

      expect(selected).toBeDefined();
      expect(Array.isArray(selected)).toBe(true);
      expect(selected.length).toBeGreaterThan(0);
      
      // Guaranteed completion should prefer easier jobs
      const firstJob = selected[0];
      expect(['easy', 'medium']).toContain(firstJob.difficulty);
    });

    test('should select jobs with balanced strategy', () => {
      const mockJobs = [
        { id: 'job1', title: 'Task 1', payment: 0.05, estimatedTime: 5, difficulty: 'easy', platform: 'toloka', payoutSpeed: 'weekly', successRate: 0.85 },
        { id: 'job2', title: 'Task 2', payment: 0.15, estimatedTime: 15, difficulty: 'medium', platform: 'remotasks', payoutSpeed: 'instant', successRate: 0.88 },
        { id: 'job3', title: 'Task 3', payment: 0.30, estimatedTime: 30, difficulty: 'medium', platform: 'scaleai', payoutSpeed: 'weekly', successRate: 0.75 },
        { id: 'job4', title: 'Task 4', payment: 0.50, estimatedTime: 60, difficulty: 'hard', platform: 'appen', payoutSpeed: 'monthly', successRate: 0.80 }
      ];

      const selected = manager.selectJobsByStrategy(mockJobs, 'balanced');

      expect(selected).toBeDefined();
      expect(Array.isArray(selected)).toBe(true);
      expect(selected.length).toBeGreaterThan(0);
      
      // Balanced strategy considers multiple factors
      expect(selected.length).toBeLessThanOrEqual(mockJobs.length);
    });

    test('should limit number of selected jobs to maxConcurrentJobs', () => {
      const mockJobs = Array.from({ length: 10 }, (_, i) => ({
        id: `job${i}`,
        title: `Task ${i}`,
        payment: 0.10,
        estimatedTime: 10,
        difficulty: 'medium',
        platform: 'toloka',
        payoutSpeed: 'weekly',
        successRate: 0.85
      }));

      manager.config.maxConcurrentJobs = 3;
      const selected = manager.selectJobsByStrategy(mockJobs, 'balanced');

      expect(selected.length).toBeLessThanOrEqual(3);
    });

    test('should filter jobs below minimum payment', () => {
      const mockJobs = [
        { id: 'job1', title: 'Low Pay', payment: 0.005, estimatedTime: 5, platform: 'toloka', payoutSpeed: 'weekly', successRate: 0.85, difficulty: 'easy' },
        { id: 'job2', title: 'Good Pay', payment: 0.15, estimatedTime: 15, platform: 'remotasks', payoutSpeed: 'weekly', successRate: 0.88, difficulty: 'medium' }
      ];

      manager.config.minPayment = 0.01;
      const selected = manager.selectJobsByStrategy(mockJobs, 'balanced');

      // Should only select jobs above minimum payment
      selected.forEach(job => {
        expect(job.payment).toBeGreaterThanOrEqual(0.01);
      });
    });

    test('should return empty array for empty job list', () => {
      const selected = manager.selectJobsByStrategy([], 'balanced');

      expect(selected).toBeDefined();
      expect(Array.isArray(selected)).toBe(true);
      expect(selected.length).toBe(0);
    });

    test('should handle undefined strategy by using default', () => {
      const mockJobs = [
        { id: 'job1', title: 'Task 1', payment: 0.10, estimatedTime: 10, platform: 'toloka', payoutSpeed: 'weekly', successRate: 0.85, difficulty: 'easy' }
      ];

      const selected = manager.selectJobsByStrategy(mockJobs);

      expect(selected).toBeDefined();
      expect(Array.isArray(selected)).toBe(true);
    });
  });

  describe('Manager Configuration', () => {
    test('should initialize with default configuration', () => {
      const defaultManager = new AutoStartManager();

      expect(defaultManager.config).toBeDefined();
      expect(defaultManager.config.strategy).toBeDefined();
      expect(defaultManager.config.maxConcurrentJobs).toBeGreaterThan(0);
      expect(defaultManager.config.minPayment).toBeGreaterThanOrEqual(0);

      defaultManager.destroy();
    });

    test('should allow configuration updates', () => {
      manager.updateConfig({ strategy: 'quick-payout', maxConcurrentJobs: 10 });

      expect(manager.config.strategy).toBe('quick-payout');
      expect(manager.config.maxConcurrentJobs).toBe(10);
    });

    test('should validate strategy values', () => {
      const validStrategies = ['quick-payout', 'big-yield', 'guaranteed-completion', 'balanced'];

      validStrategies.forEach(strategy => {
        manager.updateConfig({ strategy });
        expect(manager.config.strategy).toBe(strategy);
      });
    });
  });

  describe('Platform Management', () => {
    test('should get list of available platforms', () => {
      const platforms = manager.getPlatforms();

      expect(platforms).toBeDefined();
      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms.length).toBeGreaterThan(0);
    });

    test('should provide platform information', () => {
      const platforms = manager.getPlatforms();
      const platform = platforms[0];

      expect(platform).toHaveProperty('name');
      expect(platform).toHaveProperty('signupUrl');
      expect(platform).toHaveProperty('requirements');
    });
  });

  describe('Event Emitter', () => {
    test('should emit events', (done) => {
      const testEvent = 'test-event';
      const testData = { test: 'data' };

      manager.on(testEvent, (data) => {
        expect(data).toEqual(testData);
        done();
      });

      manager.emit(testEvent, testData);
    });

    test('should support multiple event listeners', () => {
      let count = 0;
      const incrementCount = () => count++;

      manager.on('test', incrementCount);
      manager.on('test', incrementCount);

      manager.emit('test');

      expect(count).toBe(2);
    });
  });

  describe('Lifecycle', () => {
    test('should start and stop correctly', async () => {
      await manager.start();
      expect(manager.isRunning).toBe(true);

      await manager.stop();
      expect(manager.isRunning).toBe(false);
    });

    test('should clean up resources on destroy', () => {
      const initialManager = new AutoStartManager();
      initialManager.destroy();

      expect(initialManager.isRunning).toBe(false);
    });
  });
});
