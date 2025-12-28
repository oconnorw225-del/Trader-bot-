/**
 * EXTREME STRESS TEST SUITE - SUPERSONIC SPEED
 * Maximum load, edge cases, failure scenarios
 */

process.env.ENCRYPTION_KEY = 'test-key-32-chars-long-enough!!';

import TradingEngine from '../../src/quantum/tradingLogic.js';
import { calculateSMA } from '../../src/quantum/quantumMath.js';
import { quantumSuperposition } from '../../src/quantum/quantumStrategies.js';
import riskManager from '../../src/freelance/riskManager.js';
import { encrypt, decrypt } from '../../src/shared/encryption.js';
import recovery from '../../src/shared/crashRecovery.js';

// Test configuration constants
const QUANTUM_STATES_COUNT = 50;
const MEMORY_LIMIT_MB = 15;

describe('🔥 EXTREME STRESS TESTS 🔥', () => {
  
  test('💥 1000 rapid trades - no crashes', () => {
    const engine = new TradingEngine();
    let count = 0;
    for (let i = 0; i < 1000; i++) {
      try {
        engine.placeMarketOrder('BTC/USD', 'BUY', 0.001, 1000);
        count++;
      } catch (e) { /* expected */ }
    }
    expect(count).toBeGreaterThan(0);
  });

  test('⚡ 10000 SMA calculations - under 2 seconds', () => {
    const data = Array.from({ length: 10000 }, () => 100 + Math.random() * 10);
    const start = Date.now();
    const sma = calculateSMA(data, 200);
    expect(Date.now() - start).toBeLessThan(2000);
    expect(sma).toBeGreaterThan(0);
  });

  test('🧪 100 quantum superpositions - stability check', () => {
    for (let i = 0; i < 100; i++) {
      const states = Array.from({ length: QUANTUM_STATES_COUNT }, () => ({ price: 40000 + Math.random() * 5000 }));
      const result = quantumSuperposition(states);
      expect(result.optimalPrice).toBeGreaterThan(0);
    }
  });

  test('🛡️ 1000 risk evaluations - consistency', () => {
    riskManager.positions.clear();
    riskManager.dailyLoss = 0;
    riskManager.riskEvents = [];
    
    for (let i = 0; i < 1000; i++) {
      riskManager.evaluateTradeRisk({ size: 1, price: 5000, symbol: 'BTC' });
    }
    expect(riskManager.riskEvents.length).toBe(1000);
  });

  test('🔐 1000 encrypt/decrypt cycles - under 3s', () => {
    const data = { test: 'data', value: 123 };
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      const enc = encrypt(data);
      const dec = decrypt(enc);
      expect(dec).toEqual(data);
    }
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('💾 100 crash recovery snapshots', () => {
    recovery.clearSnapshots();
    for (let i = 0; i < 100; i++) {
      recovery.createSnapshot({ iteration: i });
    }
    expect(recovery.listSnapshots().length).toBeLessThanOrEqual(10);
  });

  test('🚀 Memory stability - 2000 operations', () => {
    const engine = new TradingEngine();
    const before = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 2000; i++) {
      try { 
        engine.placeMarketOrder('BTC/USD', 'BUY', 0.001, 1000); 
      } catch (error) {
        // Expected to fail sometimes in stress test
      }
      engine.getOrderHistory();
    }
    
    const after = process.memoryUsage().heapUsed;
    expect(after - before).toBeLessThan(MEMORY_LIMIT_MB * 1024 * 1024);
  });

  test('⚠️ Edge cases - extreme values', () => {
    const engine = new TradingEngine();
    expect(() => engine.placeMarketOrder('BTC', 'BUY', 0, 1000)).toThrow();
    expect(() => engine.placeMarketOrder('BTC', 'BUY', -1, 1000)).toThrow();
    expect(() => calculateSMA([], 10)).toThrow();
  });
});
