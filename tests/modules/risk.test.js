/**
 * Tests for risk management module
 */

import riskManager from '../../src/shared/riskManager.js';

describe('Risk Manager', () => {
  beforeEach(() => {
    riskManager.positions.clear();
    riskManager.dailyLoss = 0;
    riskManager.riskEvents = [];
  });

  test('should evaluate trade risk', () => {
    const trade = {
      size: 1,
      price: 5000,
      symbol: 'BTC/USD'
    };

    const assessment = riskManager.evaluateTradeRisk(trade);

    expect(assessment).toHaveProperty('approved');
    expect(assessment).toHaveProperty('riskScore');
    expect(assessment).toHaveProperty('risks');
  });

  test('should reject oversized positions', () => {
    const trade = {
      size: 10,
      price: 50000,
      symbol: 'BTC/USD'
    };

    const assessment = riskManager.evaluateTradeRisk(trade);

    expect(assessment.approved).toBe(false);
    expect(assessment.risks.length).toBeGreaterThan(0);
  });

  test('should calculate position size', () => {
    const size = riskManager.calculatePositionSize(10000, 2, 100);

    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThanOrEqual(riskManager.maxPositionSize);
  });

  test('should check stop loss', () => {
    const position = {
      side: 'LONG',
      stopLoss: 40000
    };

    expect(riskManager.checkStopLoss(position, 39000)).toBe(true);
    expect(riskManager.checkStopLoss(position, 41000)).toBe(false);
  });

  test('should get risk statistics', () => {
    riskManager.evaluateTradeRisk({ size: 1, price: 1000, symbol: 'BTC' });
    riskManager.evaluateTradeRisk({ size: 1, price: 2000, symbol: 'ETH' });

    const stats = riskManager.getRiskStatistics();

    expect(stats.totalEvents).toBe(2);
    expect(stats).toHaveProperty('avgRiskScore');
  });
});
