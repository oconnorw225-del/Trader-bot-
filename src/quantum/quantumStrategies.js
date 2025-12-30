/**
 * Quantum strategies module for advanced trading algorithms
 */

import riskManager from '../shared/riskManager.js';

/**
 * Quantum superposition strategy - evaluates multiple market states simultaneously
 * @param {array} marketStates - Array of possible market states
 * @param {object} weights - Probability weights for each state
 * @param {object} riskParams - Optional risk parameters {checkRisk: boolean, symbol: string, size: number}
 * @returns {object} Optimal strategy
 */
export function quantumSuperposition(marketStates, weights = {}, riskParams = {}) {
  if (!Array.isArray(marketStates) || marketStates.length === 0) {
    throw new Error('Market states array is required');
  }

  // Calculate weighted average of all possible outcomes
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0) || marketStates.length;
  
  const weightedSum = marketStates.reduce((sum, state, index) => {
    const weight = weights[index] || 1;
    return sum + (state.price * weight);
  }, 0);

  const optimalPrice = weightedSum / totalWeight;
  const confidence = calculateConfidence(marketStates);
  const recommendation = optimalPrice > marketStates[0].price ? 'BUY' : 'SELL';

  // Optional risk assessment
  let riskAssessment = null;
  if (riskParams.checkRisk && riskParams.symbol && riskParams.size) {
    riskAssessment = riskManager.evaluateTradeRisk({
      symbol: riskParams.symbol,
      size: riskParams.size,
      price: optimalPrice,
      volatility: calculateVolatility(marketStates)
    });
  }
  
  return {
    strategy: 'quantum_superposition',
    optimalPrice,
    confidence,
    recommendation,
    riskAssessment,
    shouldExecute: riskAssessment ? riskAssessment.approved : true
  };
}

/**
 * Quantum entanglement strategy - identifies correlated asset pairs
 * @param {array} asset1Data - Historical data for asset 1
 * @param {array} asset2Data - Historical data for asset 2
 * @returns {object} Correlation analysis
 */
export function quantumEntanglement(asset1Data, asset2Data) {
  if (!asset1Data || !asset2Data || asset1Data.length !== asset2Data.length) {
    throw new Error('Valid asset data arrays of equal length required');
  }

  const correlation = calculateCorrelation(asset1Data, asset2Data);
  const entanglementStrength = Math.abs(correlation);

  return {
    strategy: 'quantum_entanglement',
    correlation,
    entanglementStrength,
    isEntangled: entanglementStrength > 0.7,
    tradingSignal: correlation > 0.5 ? 'FOLLOW' : correlation < -0.5 ? 'INVERSE' : 'NEUTRAL'
  };
}

/**
 * Quantum tunneling strategy - identifies breakthrough opportunities
 * @param {object} resistance - Resistance level data
 * @param {object} currentPrice - Current price data
 * @param {number} momentum - Market momentum
 * @returns {object} Tunneling analysis
 */
export function quantumTunneling(resistance, currentPrice, momentum) {
  if (!resistance || !currentPrice) {
    throw new Error('Resistance and current price data required');
  }

  const priceGapToResistance = resistance.level - currentPrice.price;
  const tunnelingProbability = calculateTunnelingProbability(priceGapToResistance, momentum);

  return {
    strategy: 'quantum_tunneling',
    tunnelingProbability,
    canTunnel: tunnelingProbability > 0.6,
    expectedBreakthrough: currentPrice.price + (priceGapToResistance * tunnelingProbability),
    recommendation: tunnelingProbability > 0.6 ? 'BUY' : 'HOLD'
  };
}

/**
 * Quantum interference strategy - combines multiple signals
 * Optimized with single-pass counting instead of multiple filters
 * @param {array} signals - Array of trading signals
 * @param {object} riskParams - Optional risk parameters {checkRisk: boolean, symbol: string, size: number, price: number}
 * @returns {object} Combined signal
 */
export function quantumInterference(signals, riskParams = {}) {
  if (!Array.isArray(signals) || signals.length === 0) {
    throw new Error('Signals array is required');
  }

  // Count all signal types in a single pass for better performance
  let buySignals = 0;
  let sellSignals = 0;
  let holdSignals = 0;
  
  for (const signal of signals) {
    if (signal.type === 'BUY') buySignals++;
    else if (signal.type === 'SELL') sellSignals++;
    else if (signal.type === 'HOLD') holdSignals++;
  }

  const interferencePattern = {
    constructive: Math.max(buySignals, sellSignals),
    destructive: Math.min(buySignals, sellSignals),
    neutral: holdSignals
  };

  let finalSignal = 'HOLD';
  if (buySignals > sellSignals && buySignals > holdSignals) {
    finalSignal = 'BUY';
  } else if (sellSignals > buySignals && sellSignals > holdSignals) {
    finalSignal = 'SELL';
  }

  const strength = Math.max(buySignals, sellSignals, holdSignals) / signals.length;

  // Optional risk assessment
  let riskAssessment = null;
  if (riskParams.checkRisk && riskParams.symbol && riskParams.size && riskParams.price) {
    riskAssessment = riskManager.evaluateTradeRisk({
      symbol: riskParams.symbol,
      size: riskParams.size,
      price: riskParams.price,
      volatility: 1 - strength // Lower strength = higher volatility
    });
  }

  return {
    strategy: 'quantum_interference',
    interferencePattern,
    finalSignal,
    strength,
    riskAssessment,
    shouldExecute: riskAssessment ? riskAssessment.approved : true
  };
}

/**
 * Calculate confidence score
 * @param {array} states - Market states
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(marketStates) {
  if (marketStates.length < 2) return 0.5;
  
  const prices = marketStates.map(state => state.price);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const priceVariance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(priceVariance);
  
  // Lower standard deviation = higher confidence
  return Math.max(0, Math.min(1, 1 - (standardDeviation / averagePrice)));
}

/**
 * Calculate volatility from market states
 * @param {array} marketStates - Array of market states
 * @returns {number} Volatility (0-1)
 */
function calculateVolatility(marketStates) {
  if (marketStates.length < 2) return 0;
  
  const prices = marketStates.map(state => state.price);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const priceVariance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(priceVariance);
  
  // Normalize volatility to 0-1 range
  return Math.min(1, standardDeviation / averagePrice);
}

/**
 * Calculate correlation between two datasets
 * Optimized to compute sums in a single pass
 * @param {array} data1 - First dataset
 * @param {array} data2 - Second dataset
 * @returns {number} Correlation coefficient (-1 to 1)
 */
function calculateCorrelation(data1, data2) {
  const dataPointCount = data1.length;
  
  // Calculate all sums in a single pass for better performance
  let sumDataset1 = 0;
  let sumDataset2 = 0;
  let sumDataset1Squared = 0;
  let sumDataset2Squared = 0;
  let sumProductOfDatasets = 0;
  
  for (let index = 0; index < dataPointCount; index++) {
    const value1 = data1[index];
    const value2 = data2[index];
    sumDataset1 += value1;
    sumDataset2 += value2;
    sumDataset1Squared += value1 * value1;
    sumDataset2Squared += value2 * value2;
    sumProductOfDatasets += value1 * value2;
  }
  
  const numerator = sumProductOfDatasets - (sumDataset1 * sumDataset2 / dataPointCount);
  const denominator = Math.sqrt((sumDataset1Squared - sumDataset1 * sumDataset1 / dataPointCount) * (sumDataset2Squared - sumDataset2 * sumDataset2 / dataPointCount));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate tunneling probability
 * @param {number} gap - Price gap to resistance
 * @param {number} momentum - Market momentum
 * @returns {number} Probability (0-1)
 */
function calculateTunnelingProbability(priceGapToResistance, marketMomentum) {
  // Simplified quantum tunneling model based on WKB approximation
  const barrierHeight = Math.abs(priceGapToResistance);
  const particleEnergy = Math.abs(marketMomentum);
  
  if (barrierHeight === 0) return 1;
  if (particleEnergy === 0) return 0;
  
  // Add small constant (1) to energy to prevent division by zero and ensure smooth probability curve
  // This represents the minimum energy threshold in the quantum tunneling model
  const MINIMUM_ENERGY_THRESHOLD = 1;
  const tunnelingProbability = Math.exp(-barrierHeight / (particleEnergy + MINIMUM_ENERGY_THRESHOLD));
  return Math.max(0, Math.min(1, tunnelingProbability));
}

export default {
  quantumSuperposition,
  quantumEntanglement,
  quantumTunneling,
  quantumInterference
};
