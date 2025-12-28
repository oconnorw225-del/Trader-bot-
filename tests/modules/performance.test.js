/**
 * Performance validation tests for optimization improvements
 */

import { calculateMACD, calculateSMA } from '../../src/quantum/quantumMath.js';
import { quantumInterference, quantumEntanglement } from '../../src/quantum/quantumStrategies.js';
import analytics from '../../src/shared/analytics.js';
import recovery from '../../src/shared/crashRecovery.js';

describe('Performance Optimization Tests', () => {
  
  describe('MACD Performance', () => {
    test('should calculate MACD on large dataset quickly', () => {
      const data = Array.from({ length: 1000 }, (_, i) => 100 + Math.sin(i / 10) * 10);
      const start = performance.now();
      const result = calculateMACD(data, 12, 26, 9);
      const duration = performance.now() - start;
      
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
      // Should be much faster than 100ms for 1000 points
      expect(duration).toBeLessThan(100);
    });

    test('should handle very large datasets efficiently', () => {
      const data = Array.from({ length: 5000 }, () => 100 + Math.random() * 20);
      const start = performance.now();
      calculateMACD(data, 12, 26, 9);
      const duration = performance.now() - start;
      
      // Even 5000 points should complete in under 200ms
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Quantum Interference Performance', () => {
    test('should process large signal arrays efficiently', () => {
      const signals = Array.from({ length: 1000 }, (_, i) => ({
        type: ['BUY', 'SELL', 'HOLD'][i % 3]
      }));
      
      const start = performance.now();
      const result = quantumInterference(signals);
      const duration = performance.now() - start;
      
      expect(result).toHaveProperty('finalSignal');
      // Single-pass implementation should be very fast
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Correlation Performance', () => {
    test('should calculate correlation efficiently on large datasets', () => {
      const data1 = Array.from({ length: 1000 }, () => Math.random() * 100);
      const data2 = Array.from({ length: 1000 }, () => Math.random() * 100);
      
      const start = performance.now();
      const result = quantumEntanglement(data1, data2);
      const duration = performance.now() - start;
      
      expect(result).toHaveProperty('correlation');
      // Single-pass implementation should be fast
      expect(duration).toBeLessThan(20);
    });
  });

  describe('Analytics Memory Management', () => {
    beforeEach(() => {
      analytics.clear();
    });

    test('should limit events to maxEvents', () => {
      // Add more events than the limit
      for (let i = 0; i < 1500; i++) {
        analytics.trackEvent('test_event', { index: i });
      }
      
      const allEvents = analytics.events;
      // Should not exceed maxEvents (1000)
      expect(allEvents.length).toBeLessThanOrEqual(1000);
      // Should keep most recent events
      expect(allEvents[allEvents.length - 1].data.index).toBe(1499);
    });

    test('should limit metrics to maxMetricValues', () => {
      // Add more metric values than the limit
      for (let i = 0; i < 700; i++) {
        analytics.recordMetric('test_metric', i);
      }
      
      const metricValues = analytics.metrics['test_metric'];
      // Should not exceed maxMetricValues (500)
      expect(metricValues.length).toBeLessThanOrEqual(500);
      // Should keep most recent values
      expect(metricValues[metricValues.length - 1].value).toBe(699);
    });

    test('should handle multiple metrics efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        analytics.recordMetric('metric1', i);
        analytics.recordMetric('metric2', i * 2);
        analytics.recordMetric('metric3', i * 3);
      }
      
      const duration = performance.now() - start;
      
      // All metrics should have correct max length
      expect(analytics.metrics['metric1'].length).toBeLessThanOrEqual(500);
      expect(analytics.metrics['metric2'].length).toBeLessThanOrEqual(500);
      expect(analytics.metrics['metric3'].length).toBeLessThanOrEqual(500);
      
      // Should complete quickly even with bounds checking
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Crash Recovery Performance', () => {
    beforeEach(() => {
      recovery.clearSnapshots();
    });

    test('should create snapshots efficiently', () => {
      const largeState = {
        positions: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          symbol: `SYM${i}`,
          quantity: Math.random() * 100,
          price: Math.random() * 1000
        })),
        orders: Array.from({ length: 200 }, (_, i) => ({
          id: i,
          type: 'LIMIT',
          status: 'PENDING'
        }))
      };
      
      const start = performance.now();
      recovery.createSnapshot(largeState);
      const duration = performance.now() - start;
      
      // Structured cloning should be faster than JSON
      expect(duration).toBeLessThan(50);
    });

    test('should restore snapshots efficiently', () => {
      const state = { value: 123, nested: { data: 'test' } };
      const snapshot = recovery.createSnapshot(state);
      
      const start = performance.now();
      const restored = recovery.restoreSnapshot(snapshot.id);
      const duration = performance.now() - start;
      
      expect(restored).toEqual(state);
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Combined Performance Test', () => {
    test('should handle complex operations efficiently', () => {
      const data = Array.from({ length: 500 }, () => 100 + Math.random() * 20);
      
      const start = performance.now();
      
      // Perform multiple operations
      calculateSMA(data, 50);
      calculateMACD(data, 12, 26, 9);
      
      const signals = Array.from({ length: 100 }, (_, i) => ({
        type: ['BUY', 'SELL', 'HOLD'][i % 3]
      }));
      quantumInterference(signals);
      
      // Track some analytics
      for (let i = 0; i < 50; i++) {
        analytics.trackEvent('calculation', { iteration: i });
      }
      
      const duration = performance.now() - start;
      
      // All operations combined should be fast
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Memory Management for Unbounded Arrays', () => {
    test('should limit AIOrchestrator tasks array', async () => {
      const orchestrator = (await import('../../src/freelance/ai/orchestrator.js')).default;
      
      // Clear existing tasks
      orchestrator.tasks = [];
      orchestrator.activeJobs.clear();
      
      // Add more tasks than the limit
      for (let i = 0; i < 1500; i++) {
        try {
          await orchestrator.executeTask('analysis', { data: i });
        } catch (error) {
          // Some tasks may fail, that's ok
        }
      }
      
      // Should not exceed maxTasks (1000)
      expect(orchestrator.tasks.length).toBeLessThanOrEqual(1000);
    });

    test('should limit LearningModule training data array', async () => {
      const learningModule = (await import('../../src/freelance/ai/feedbackLearning.js')).default;
      
      // Clear existing training data
      learningModule.trainingData = [];
      
      // Add more training data than the limit
      for (let i = 0; i < 12000; i++) {
        learningModule.addTrainingData({ feature: i }, i % 2);
      }
      
      // Should not exceed maxTrainingData (10000)
      expect(learningModule.trainingData.length).toBeLessThanOrEqual(10000);
      // Should keep most recent data
      expect(learningModule.trainingData[learningModule.trainingData.length - 1].data.feature).toBe(11999);
    });

    test('should limit RiskManager risk events array', async () => {
      const riskManager = (await import('../../src/freelance/riskManager.js')).default;
      
      // Clear existing risk events
      riskManager.riskEvents = [];
      
      // Add more risk events than the limit
      for (let i = 0; i < 1500; i++) {
        riskManager.evaluateTradeRisk({
          symbol: 'BTC/USD',
          size: 1,
          price: 50000 + i
        });
      }
      
      // Should not exceed maxRiskEvents (1000)
      expect(riskManager.riskEvents.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Debounced localStorage Writes', () => {
    // Skip these tests in Node environment (no localStorage/Storage)
    test.skip('should debounce configManager saves', async () => {
      // This would test in browser environment only
    });

    test.skip('should debounce featureToggleManager saves', async () => {
      // This would test in browser environment only
    });
  });
});
