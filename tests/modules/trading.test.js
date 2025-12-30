/**
 * Tests for trading module
 */

import TradingEngine from '../../src/quantum/tradingLogic.js';
import { calculateSMA, calculateRSI, calculateBollingerBands } from '../../src/quantum/quantumMath.js';
import { calculateTradingFee, calculateProfitAfterFees } from '../../src/quantum/feeCalculator.js';

describe('Trading Engine', () => {
  let engine;

  beforeEach(() => {
    engine = new TradingEngine();
  });

  test('should place market order', () => {
    const order = engine.placeMarketOrder('BTC/USD', 'BUY', 0.1, 1000, { skipRiskCheck: true });
    
    expect(order).toHaveProperty('id');
    expect(order.symbol).toBe('BTC/USD');
    expect(order.side).toBe('BUY');
    expect(order.status).toBe('FILLED');
  });

  test('should throw error for insufficient balance', () => {
    expect(() => engine.placeMarketOrder('BTC/USD', 'BUY', 1, 50000, { skipRiskCheck: true })).toThrow();
  });

  test('should update position after order', () => {
    engine.placeMarketOrder('BTC/USD', 'BUY', 1, 1000, { skipRiskCheck: true });
    const position = engine.getPosition('BTC/USD');
    
    expect(position).toBeTruthy();
    expect(position.quantity).toBe(1);
  });

  test('should cancel pending order', () => {
    const order = engine.placeLimitOrder('ETH/USD', 'BUY', 1, 2000);
    const cancelled = engine.cancelOrder(order.id);
    
    expect(cancelled).toBe(true);
  });

  test('should enforce risk management', () => {
    // Try to place oversized order without skipping risk check (exceeds max position size of 10000)
    expect(() => engine.placeMarketOrder('BTC/USD', 'BUY', 1.1, 9500)).toThrow(/risk manager/);
  });

  test('should calculate risk-adjusted position size', () => {
    const sizing = engine.calculateRiskAdjustedSize('BTC/USD', 1000, 950, 2);
    
    expect(sizing).toHaveProperty('optimalQuantity');
    expect(sizing).toHaveProperty('potentialRisk');
    expect(sizing.optimalQuantity).toBeGreaterThan(0);
  });

  test('should execute stop-loss', () => {
    // Place a buy order with stop-loss
    engine.placeMarketOrder('BTC/USD', 'BUY', 1, 1000, { 
      skipRiskCheck: true, 
      stopLoss: 950 
    });
    
    // Execute stop-loss
    const result = engine.executeStopLoss('BTC/USD', 940);
    
    expect(result).toHaveProperty('reason', 'stop-loss');
    expect(result).toHaveProperty('pnl');
    expect(result.pnl).toBeLessThanOrEqual(0);
  });

  test('should check stop-loss conditions', () => {
    engine.placeMarketOrder('BTC/USD', 'BUY', 1, 1000, { 
      skipRiskCheck: true, 
      stopLoss: 950 
    });
    
    const triggered = engine.checkStopLoss({ 'BTC/USD': 940 });
    
    expect(triggered).toHaveLength(1);
    expect(triggered[0].symbol).toBe('BTC/USD');
  });
});

describe('Trading Math', () => {
  test('should calculate SMA correctly', () => {
    const data = [10, 20, 30, 40, 50];
    const sma = calculateSMA(data, 5);
    
    expect(sma).toBe(30);
  });

  test('should throw error for insufficient data', () => {
    const data = [10, 20];
    expect(() => calculateSMA(data, 5)).toThrow();
  });

  test('should calculate RSI', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 100 + i);
    const rsi = calculateRSI(prices);
    
    expect(rsi).toBeGreaterThanOrEqual(0);
    expect(rsi).toBeLessThanOrEqual(100);
  });

  test('should calculate Bollinger Bands', () => {
    const data = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 
                  110, 112, 111, 113, 115, 114, 116, 118, 117, 119];
    const bands = calculateBollingerBands(data);
    
    expect(bands).toHaveProperty('upper');
    expect(bands).toHaveProperty('middle');
    expect(bands).toHaveProperty('lower');
    expect(bands.upper).toBeGreaterThan(bands.middle);
    expect(bands.middle).toBeGreaterThan(bands.lower);
  });
});

describe('Trading Fees', () => {
  test('should calculate trading fee', () => {
    const fee = calculateTradingFee(1000, 'TAKER', 'NDAX');
    
    expect(fee).toHaveProperty('fee');
    expect(fee).toHaveProperty('netAmount');
    expect(fee.netAmount).toBeLessThan(1000);
  });

  test('should calculate profit after fees', () => {
    const profit = calculateProfitAfterFees(100, 110, 10, 'NDAX');
    
    expect(profit).toHaveProperty('netProfit');
    expect(profit).toHaveProperty('totalFees');
    expect(profit.netProfit).toBeLessThan(profit.grossProfit);
  });

  test('should throw error for invalid amount', () => {
    expect(() => calculateTradingFee(0, 'TAKER', 'NDAX')).toThrow();
  });
});
