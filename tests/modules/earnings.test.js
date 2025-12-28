/**
 * Tests for EarningsTracker service
 */

import { EarningsTracker } from '../../src/services/EarningsTracker.js';

describe('EarningsTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new EarningsTracker();
    tracker.clear();
  });

  afterEach(() => {
    tracker.clear();
  });

  describe('initialization', () => {
    test('should initialize with zero earnings', async () => {
      await tracker.initialize();
      expect(tracker.tradingProfit).toBe(0);
      expect(tracker.freelanceEarnings).toBe(0);
      expect(tracker.earningsHistory).toHaveLength(0);
    });

    test('should set initialized flag after initialization', async () => {
      await tracker.initialize();
      expect(tracker.initialized).toBe(true);
    });

    test('should not reinitialize if already initialized', async () => {
      await tracker.initialize();
      const firstInit = tracker.initialized;
      await tracker.initialize();
      expect(tracker.initialized).toBe(firstInit);
    });
  });

  describe('recordTrade', () => {
    test('should record positive trading profit', () => {
      const trade = {
        symbol: 'BTC/USD',
        side: 'BUY',
        profit: 100.50,
        entryPrice: 45000,
        exitPrice: 46000,
        quantity: 0.1
      };

      const result = tracker.recordTrade(trade);

      expect(result.success).toBe(true);
      expect(result.totalTradingProfit).toBe(100.50);
      expect(tracker.earningsHistory).toHaveLength(1);
      expect(tracker.earningsHistory[0].type).toBe('trading');
      expect(tracker.earningsHistory[0].amount).toBe(100.50);
    });

    test('should record negative trading loss', () => {
      const trade = {
        symbol: 'ETH/USD',
        side: 'SELL',
        profit: -50.25,
        entryPrice: 3000,
        exitPrice: 2950,
        quantity: 1
      };

      const result = tracker.recordTrade(trade);

      expect(result.success).toBe(true);
      expect(result.totalTradingProfit).toBe(-50.25);
      expect(tracker.tradingProfit).toBe(-50.25);
    });

    test('should accumulate multiple trades', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', side: 'BUY', profit: 100 });
      tracker.recordTrade({ symbol: 'ETH/USD', side: 'SELL', profit: 50 });
      tracker.recordTrade({ symbol: 'BTC/USD', side: 'BUY', profit: -25 });

      expect(tracker.tradingProfit).toBe(125); // 100 + 50 - 25
      expect(tracker.earningsHistory).toHaveLength(3);
    });
  });

  describe('recordFreelanceEarning', () => {
    test('should record freelance job earnings', () => {
      const job = {
        id: 'job_123',
        platform: 'upwork',
        title: 'Web Development',
        earnings: 500,
        difficulty: 'medium'
      };

      const result = tracker.recordFreelanceEarning(job);

      expect(result.success).toBe(true);
      expect(result.totalFreelanceEarnings).toBe(500);
      expect(tracker.earningsHistory).toHaveLength(1);
      expect(tracker.earningsHistory[0].type).toBe('freelance');
      expect(tracker.earningsHistory[0].source).toBe('upwork');
    });

    test('should use payment field if earnings not provided', () => {
      const job = {
        platform: 'fiverr',
        title: 'Logo Design',
        payment: 250
      };

      tracker.recordFreelanceEarning(job);

      expect(tracker.freelanceEarnings).toBe(250);
    });

    test('should accumulate multiple freelance earnings', () => {
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });
      tracker.recordFreelanceEarning({ platform: 'fiverr', earnings: 250 });
      tracker.recordFreelanceEarning({ platform: 'freelancer', earnings: 300 });

      expect(tracker.freelanceEarnings).toBe(1050); // 500 + 250 + 300
      expect(tracker.earningsHistory).toHaveLength(3);
    });
  });

  describe('getTotalEarnings', () => {
    test('should calculate total from all sources', async () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      tracker.recordTrade({ symbol: 'ETH/USD', profit: 50 });
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });

      const total = await tracker.getTotalEarnings();

      expect(total.total).toBeGreaterThanOrEqual(650); // 100 + 50 + 500
      expect(total.breakdown.trading).toBe(150);
      expect(total.breakdown.freelance).toBe(500);
    });

    test('should return zero when no earnings recorded', async () => {
      const total = await tracker.getTotalEarnings();

      expect(total.total).toBeGreaterThanOrEqual(0);
      expect(total.breakdown.trading).toBe(0);
      expect(total.breakdown.freelance).toBe(0);
    });
  });

  describe('getEarningsByPeriod', () => {
    test('should filter earnings by daily period', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      
      const dailyEarnings = tracker.getEarningsByPeriod('daily');

      expect(dailyEarnings.period).toBe('daily');
      expect(dailyEarnings.total).toBe(100);
      expect(dailyEarnings.trading).toBe(100);
      expect(dailyEarnings.freelance).toBe(0);
    });

    test('should filter earnings by weekly period', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });
      
      const weeklyEarnings = tracker.getEarningsByPeriod('weekly');

      expect(weeklyEarnings.period).toBe('weekly');
      expect(weeklyEarnings.total).toBe(600);
      expect(weeklyEarnings.trading).toBe(100);
      expect(weeklyEarnings.freelance).toBe(500);
    });

    test('should return all earnings for "all" period', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });
      
      const allEarnings = tracker.getEarningsByPeriod('all');

      expect(allEarnings.period).toBe('all');
      expect(allEarnings.total).toBe(600);
    });
  });

  describe('getEarningsBySource', () => {
    test('should group earnings by source', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 50 });
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });
      tracker.recordFreelanceEarning({ platform: 'fiverr', earnings: 250 });
      
      const sources = tracker.getEarningsBySource();

      expect(sources['quantum_engine']).toBeDefined();
      expect(sources['quantum_engine'].total).toBe(150);
      expect(sources['quantum_engine'].count).toBe(2);
      
      expect(sources['upwork']).toBeDefined();
      expect(sources['upwork'].total).toBe(500);
      expect(sources['upwork'].count).toBe(1);
      
      expect(sources['fiverr']).toBeDefined();
      expect(sources['fiverr'].total).toBe(250);
    });
  });

  describe('getDetailedReport', () => {
    test('should generate comprehensive earnings report', async () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });

      const report = await tracker.getDetailedReport();

      expect(report.summary).toBeDefined();
      expect(report.summary.totalEarnings).toBeGreaterThanOrEqual(600);
      expect(report.periods).toBeDefined();
      expect(report.periods.daily).toBeDefined();
      expect(report.periods.weekly).toBeDefined();
      expect(report.periods.monthly).toBeDefined();
      expect(report.sources).toBeDefined();
      expect(report.statistics).toBeDefined();
      expect(report.statistics.totalTransactions).toBe(2);
      expect(report.lastUpdated).toBeDefined();
    });
  });

  describe('getRecentEarnings', () => {
    test('should return recent earnings in reverse chronological order', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', side: 'BUY', profit: 100 });
      tracker.recordTrade({ symbol: 'ETH/USD', side: 'SELL', profit: 50 });
      tracker.recordFreelanceEarning({ platform: 'upwork', title: 'Web Dev', earnings: 500 });

      const recent = tracker.getRecentEarnings(10);

      expect(recent).toHaveLength(3);
      expect(recent[0].type).toBe('freelance'); // Most recent
      expect(recent[1].type).toBe('trading');
      expect(recent[2].type).toBe('trading'); // Oldest
    });

    test('should limit results to specified count', () => {
      for (let i = 0; i < 15; i++) {
        tracker.recordTrade({ symbol: 'BTC/USD', profit: 10 });
      }

      const recent = tracker.getRecentEarnings(5);

      expect(recent).toHaveLength(5);
    });
  });

  describe('clear', () => {
    test('should clear all earnings data', () => {
      tracker.recordTrade({ symbol: 'BTC/USD', profit: 100 });
      tracker.recordFreelanceEarning({ platform: 'upwork', earnings: 500 });

      tracker.clear();

      expect(tracker.tradingProfit).toBe(0);
      expect(tracker.freelanceEarnings).toBe(0);
      expect(tracker.earningsHistory).toHaveLength(0);
    });
  });
});
