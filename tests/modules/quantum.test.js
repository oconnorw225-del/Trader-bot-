/**
 * Tests for quantum strategies module
 */

import {
  quantumSuperposition,
  quantumEntanglement,
  quantumTunneling,
  quantumInterference
} from '../../src/quantum/quantumStrategies.js';

describe('Quantum Strategies', () => {
  describe('quantumSuperposition', () => {
    test('should calculate optimal price from multiple states', () => {
      const marketStates = [
        { price: 100 },
        { price: 110 },
        { price: 105 }
      ];
      
      const result = quantumSuperposition(marketStates);
      
      expect(result).toHaveProperty('strategy', 'quantum_superposition');
      expect(result).toHaveProperty('optimalPrice');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('recommendation');
      expect(result.optimalPrice).toBeGreaterThan(0);
    });

    test('should throw error for empty market states', () => {
      expect(() => quantumSuperposition([])).toThrow();
    });

    test('should handle weighted states', () => {
      const marketStates = [
        { price: 100 },
        { price: 200 }
      ];
      const weights = { 0: 0.8, 1: 0.2 };
      
      const result = quantumSuperposition(marketStates, weights);
      
      expect(result.optimalPrice).toBeLessThan(150);
    });
  });

  describe('quantumEntanglement', () => {
    test('should calculate correlation between assets', () => {
      const asset1 = [100, 110, 105, 115];
      const asset2 = [50, 55, 52.5, 57.5];
      
      const result = quantumEntanglement(asset1, asset2);
      
      expect(result).toHaveProperty('strategy', 'quantum_entanglement');
      expect(result).toHaveProperty('correlation');
      expect(result).toHaveProperty('entanglementStrength');
      expect(result.correlation).toBeGreaterThanOrEqual(-1);
      expect(result.correlation).toBeLessThanOrEqual(1);
    });

    test('should throw error for mismatched data lengths', () => {
      const asset1 = [100, 110];
      const asset2 = [50];
      
      expect(() => quantumEntanglement(asset1, asset2)).toThrow();
    });
  });

  describe('quantumTunneling', () => {
    test('should calculate tunneling probability', () => {
      const resistance = { level: 110 };
      const currentPrice = { price: 100 };
      const momentum = 5;
      
      const result = quantumTunneling(resistance, currentPrice, momentum);
      
      expect(result).toHaveProperty('strategy', 'quantum_tunneling');
      expect(result).toHaveProperty('tunnelingProbability');
      expect(result.tunnelingProbability).toBeGreaterThanOrEqual(0);
      expect(result.tunnelingProbability).toBeLessThanOrEqual(1);
    });

    test('should throw error for missing parameters', () => {
      expect(() => quantumTunneling(null, { price: 100 }, 5)).toThrow();
    });
  });

  describe('quantumInterference', () => {
    test('should combine multiple signals', () => {
      const signals = [
        { type: 'BUY' },
        { type: 'BUY' },
        { type: 'SELL' }
      ];
      
      const result = quantumInterference(signals);
      
      expect(result).toHaveProperty('strategy', 'quantum_interference');
      expect(result).toHaveProperty('finalSignal');
      expect(['BUY', 'SELL', 'HOLD']).toContain(result.finalSignal);
    });

    test('should throw error for empty signals', () => {
      expect(() => quantumInterference([])).toThrow();
    });
  });
});
