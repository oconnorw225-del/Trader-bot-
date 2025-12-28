/**
 * Mathematical utilities for trading calculations
 */

/**
 * Calculate simple moving average
 * @param {array} data - Price data
 * @param {number} period - Period for moving average
 * @returns {number} Moving average
 */
export function calculateSMA(data, period) {
  if (!Array.isArray(data) || data.length < period) {
    throw new Error('Insufficient data for SMA calculation');
  }
  
  const dataSlice = data.slice(-period);
  return dataSlice.reduce((sum, value) => sum + value, 0) / period;
}

/**
 * Calculate exponential moving average
 * @param {array} data - Price data
 * @param {number} period - Period for moving average
 * @returns {number} Exponential moving average
 */
export function calculateEMA(data, period) {
  if (!Array.isArray(data) || data.length < period) {
    throw new Error('Insufficient data for EMA calculation');
  }

  const smoothingMultiplier = 2 / (period + 1);
  let exponentialMovingAverage = data[0];

  for (let index = 1; index < data.length; index++) {
    exponentialMovingAverage = (data[index] - exponentialMovingAverage) * smoothingMultiplier + exponentialMovingAverage;
  }

  return exponentialMovingAverage;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {array} prices - Price data
 * @param {number} period - Period for RSI (default 14)
 * @returns {number} RSI value (0-100)
 */
export function calculateRSI(prices, period = 14) {
  // RSI requires period + 1 data points for initial calculation
  if (!Array.isArray(prices) || prices.length < period + 1) {
    throw new Error(`Insufficient data for RSI calculation. Need at least ${period + 1} data points.`);
  }

  let totalGains = 0;
  let totalLosses = 0;

  // Calculate initial average gain and loss
  for (let index = 1; index <= period; index++) {
    const priceChange = prices[index] - prices[index - 1];
    if (priceChange > 0) {
      totalGains += priceChange;
    } else {
      totalLosses -= priceChange;
    }
  }

  let averageGain = totalGains / period;
  let averageLoss = totalLosses / period;

  // Calculate RSI using Wilder's smoothing
  for (let index = period + 1; index < prices.length; index++) {
    const priceChange = prices[index] - prices[index - 1];
    if (priceChange > 0) {
      averageGain = (averageGain * (period - 1) + priceChange) / period;
      averageLoss = (averageLoss * (period - 1)) / period;
    } else {
      averageGain = (averageGain * (period - 1)) / period;
      averageLoss = (averageLoss * (period - 1) - priceChange) / period;
    }
  }

  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
}

/**
 * Calculate Bollinger Bands
 * @param {array} data - Price data
 * @param {number} period - Period for calculation
 * @param {number} stdDev - Number of standard deviations
 * @returns {object} Bollinger Bands (upper, middle, lower)
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (!Array.isArray(data) || data.length < period) {
    throw new Error('Insufficient data for Bollinger Bands calculation');
  }

  const middle = calculateSMA(data, period);
  const slice = data.slice(-period);
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);

  return {
    upper: middle + (standardDeviation * stdDev),
    middle,
    lower: middle - (standardDeviation * stdDev)
  };
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * Optimized to calculate EMA incrementally instead of recalculating from scratch
 * @param {array} data - Price data
 * @param {number} fastPeriod - Fast EMA period
 * @param {number} slowPeriod - Slow EMA period
 * @param {number} signalPeriod - Signal line period
 * @returns {object} MACD values
 */
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!Array.isArray(data) || data.length < slowPeriod) {
    throw new Error('Insufficient data for MACD calculation');
  }

  // Calculate EMA incrementally for better performance
  const fastSmoothingMultiplier = 2 / (fastPeriod + 1);
  const slowSmoothingMultiplier = 2 / (slowPeriod + 1);
  
  let fastEMA = data[0];
  let slowEMA = data[0];
  
  // Build MACD history incrementally
  const macdHistory = [];
  
  for (let index = 1; index < data.length; index++) {
    fastEMA = (data[index] - fastEMA) * fastSmoothingMultiplier + fastEMA;
    slowEMA = (data[index] - slowEMA) * slowSmoothingMultiplier + slowEMA;
    
    if (index >= slowPeriod - 1) {
      macdHistory.push(fastEMA - slowEMA);
    }
  }

  const macdLine = fastEMA - slowEMA;
  const signalLine = calculateEMA(macdHistory, signalPeriod);
  const histogram = macdLine - signalLine;

  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
}

/**
 * Calculate standard deviation
 * @param {array} data - Data array
 * @returns {number} Standard deviation
 */
export function calculateStdDev(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data for standard deviation calculation');
  }

  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    throw new Error('Old value cannot be zero');
  }
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate compound annual growth rate (CAGR)
 * @param {number} beginValue - Beginning value
 * @param {number} endValue - Ending value
 * @param {number} years - Number of years
 * @returns {number} CAGR percentage
 */
export function calculateCAGR(beginValue, endValue, years) {
  if (beginValue <= 0 || endValue <= 0 || years <= 0) {
    throw new Error('All values must be positive');
  }
  return (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
}

/**
 * Calculate Sharpe Ratio
 * @param {array} returns - Array of returns
 * @param {number} riskFreeRate - Risk-free rate
 * @returns {number} Sharpe Ratio
 */
export function calculateSharpeRatio(returns, riskFreeRate = 0) {
  if (!Array.isArray(returns) || returns.length === 0) {
    throw new Error('Invalid returns data');
  }

  const averageReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const standardDeviation = calculateStdDev(returns);

  if (standardDeviation === 0) return 0;
  return (averageReturn - riskFreeRate) / standardDeviation;
}

export default {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
  calculateStdDev,
  calculatePercentageChange,
  calculateCAGR,
  calculateSharpeRatio
};
