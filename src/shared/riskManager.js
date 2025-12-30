/**
 * Risk management module for trading risk controls
 */

import webhookManager from './webhookManager.js';

class RiskManager {
  constructor() {
    this.maxPositionSize = parseFloat(process.env.MAX_POSITION_SIZE) || 10000;
    this.maxDailyLoss = parseFloat(process.env.MAX_DAILY_LOSS) || 1000;
    this.riskLevel = process.env.RISK_LEVEL || 'moderate';
    this.dailyLoss = 0;
    this.positions = new Map();
    this.riskEvents = [];
    // Add configurable limit to prevent unbounded memory growth
    this.maxRiskEvents = 1000;
  }

  /**
   * Evaluate trade risk
   * @param {object} trade - Trade details
   * @returns {object} Risk assessment
   */
  evaluateTradeRisk(trade) {
    if (!trade || !trade.size || !trade.price) {
      throw new Error('Invalid trade data');
    }

    const tradeValue = trade.size * trade.price;
    const risks = [];
    let riskScore = 0;

    // Check position size
    if (tradeValue > this.maxPositionSize) {
      risks.push('Position size exceeds maximum allowed');
      riskScore += 30;
    }

    // Check daily loss limit
    if (this.dailyLoss + tradeValue * 0.1 > this.maxDailyLoss) {
      risks.push('Trade may exceed daily loss limit');
      riskScore += 25;
    }

    // Check portfolio concentration
    const concentration = this.calculateConcentration(trade.symbol, tradeValue);
    if (concentration > 0.3) {
      risks.push('High portfolio concentration');
      riskScore += 20;
    }

    // Volatility check
    if (trade.volatility && trade.volatility > 0.5) {
      risks.push('High volatility detected');
      riskScore += 15;
    }

    const assessment = {
      approved: riskScore < 50,
      riskScore,
      risks,
      tradeValue,
      timestamp: new Date().toISOString()
    };

    this.riskEvents.push(assessment);
    
    // Keep only the most recent risk events to prevent memory leaks
    if (this.riskEvents.length > this.maxRiskEvents) {
      const excess = this.riskEvents.length - this.maxRiskEvents;
      this.riskEvents.splice(0, excess);
    }
    
    // Trigger risk alert webhook if trade is not approved
    if (!assessment.approved) {
      webhookManager.triggerEvent('risk.alert', {
        riskScore,
        risks,
        tradeValue,
        symbol: trade.symbol,
        timestamp: assessment.timestamp
      }).catch(err => {
        console.error('Webhook delivery failed:', err);
      });
    }
    
    return assessment;
  }

  /**
   * Calculate portfolio concentration
   * @param {string} symbol - Asset symbol
   * @param {number} additionalValue - Additional position value
   * @returns {number} Concentration ratio
   */
  calculateConcentration(symbol, additionalValue) {
    const currentPosition = this.positions.get(symbol) || 0;
    const totalValue = Array.from(this.positions.values()).reduce((sum, value) => sum + value, 0);
    const newTotal = totalValue + additionalValue;
    
    if (newTotal === 0) return 0;
    return (currentPosition + additionalValue) / newTotal;
  }

  /**
   * Update position
   * @param {string} symbol - Asset symbol
   * @param {number} value - Position value
   */
  updatePosition(symbol, value) {
    this.positions.set(symbol, value);
  }

  /**
   * Record loss
   * @param {number} amount - Loss amount
   */
  recordLoss(amount) {
    this.dailyLoss += Math.abs(amount);
  }

  /**
   * Reset daily metrics
   */
  resetDailyMetrics() {
    this.dailyLoss = 0;
  }

  /**
   * Check if stop-loss should trigger
   * @param {object} position - Position details
   * @param {number} currentPrice - Current market price
   * @returns {boolean} True if stop-loss triggered
   */
  checkStopLoss(position, currentPrice) {
    if (!position.stopLoss) {
      return false;
    }

    if (position.side === 'LONG' && currentPrice <= position.stopLoss) {
      return true;
    }

    if (position.side === 'SHORT' && currentPrice >= position.stopLoss) {
      return true;
    }

    return false;
  }

  /**
   * Calculate optimal position size
   * @param {number} accountBalance - Account balance
   * @param {number} riskPercentage - Risk percentage per trade
   * @param {number} stopLossDistance - Distance to stop-loss
   * @returns {number} Optimal position size
   */
  calculatePositionSize(accountBalance, riskPercentage, stopLossDistance) {
    if (accountBalance <= 0 || riskPercentage <= 0 || stopLossDistance <= 0) {
      throw new Error('All parameters must be positive');
    }

    const riskAmount = accountBalance * (riskPercentage / 100);
    const positionSize = riskAmount / stopLossDistance;
    
    return Math.min(positionSize, this.maxPositionSize);
  }

  /**
   * Get risk statistics
   * @returns {object} Risk statistics
   */
  getRiskStatistics() {
    const totalEvents = this.riskEvents.length;
    const approvedTrades = this.riskEvents.filter(event => event.approved).length;
    const averageRiskScore = totalEvents > 0
      ? this.riskEvents.reduce((sum, event) => sum + event.riskScore, 0) / totalEvents
      : 0;

    return {
      totalEvents,
      approvedTrades,
      rejectedTrades: totalEvents - approvedTrades,
      avgRiskScore: averageRiskScore,
      dailyLoss: this.dailyLoss,
      maxDailyLoss: this.maxDailyLoss,
      riskLevel: this.riskLevel
    };
  }

  /**
   * Get risk events
   * @param {number} limit - Number of events to return
   * @returns {array} Recent risk events
   */
  getRiskEvents(limit = 10) {
    return this.riskEvents.slice(-limit);
  }

  /**
   * Set risk parameters
   * @param {object} params - Risk parameters
   */
  setRiskParameters(params) {
    if (params.maxPositionSize) this.maxPositionSize = params.maxPositionSize;
    if (params.maxDailyLoss) this.maxDailyLoss = params.maxDailyLoss;
    if (params.riskLevel) this.riskLevel = params.riskLevel;
  }
}

export default new RiskManager();
