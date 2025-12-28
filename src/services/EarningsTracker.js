/**
 * Earnings Tracker Service
 * Aggregates and tracks earnings from multiple sources:
 * - Trading profits/losses
 * - Freelance job completions
 * - Payment transactions
 */

import { getDatabase } from '../models/Database.js';
import paymentManager from '../freelance/paymentManager.js';

class EarningsTracker {
  constructor() {
    this.earningsHistory = [];
    this.tradingProfit = 0;
    this.freelanceEarnings = 0;
    this.initialized = false;
  }

  /**
   * Initialize the earnings tracker
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Load historical data if available
    this.loadHistoricalData();
    this.initialized = true;
  }

  /**
   * Load historical earnings data
   */
  loadHistoricalData() {
    // In a production system, this would load from persistent storage
    // For now, we'll start fresh each time
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('earnings_history');
        if (stored) {
          const data = JSON.parse(stored);
          this.earningsHistory = data.history || [];
          this.tradingProfit = data.tradingProfit || 0;
          this.freelanceEarnings = data.freelanceEarnings || 0;
        }
      }
    } catch (error) {
      console.log('Could not load historical earnings data:', error.message);
    }
  }

  /**
   * Save earnings data to persistent storage
   */
  saveHistoricalData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = {
          history: this.earningsHistory,
          tradingProfit: this.tradingProfit,
          freelanceEarnings: this.freelanceEarnings,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('earnings_history', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Could not save earnings data:', error.message);
    }
  }

  /**
   * Record a trading profit/loss
   * @param {object} trade - Trade details
   * @returns {object} Updated earnings
   */
  recordTrade(trade) {
    const profit = trade.profit || 0;
    this.tradingProfit += profit;

    const record = {
      id: `trade_${Date.now()}`,
      type: 'trading',
      source: 'quantum_engine',
      amount: profit,
      symbol: trade.symbol,
      side: trade.side,
      timestamp: new Date().toISOString(),
      metadata: {
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity
      }
    };

    this.earningsHistory.push(record);
    this.saveHistoricalData();

    return {
      success: true,
      totalTradingProfit: this.tradingProfit,
      record
    };
  }

  /**
   * Record freelance job earnings
   * @param {object} job - Job details
   * @returns {object} Updated earnings
   */
  recordFreelanceEarning(job) {
    const earnings = job.earnings || job.payment || 0;
    this.freelanceEarnings += earnings;

    const record = {
      id: job.id || `freelance_${Date.now()}`,
      type: 'freelance',
      source: job.platform || 'unknown',
      amount: earnings,
      jobTitle: job.title,
      timestamp: new Date().toISOString(),
      metadata: {
        difficulty: job.difficulty,
        estimatedTime: job.estimatedTime
      }
    };

    this.earningsHistory.push(record);
    this.saveHistoricalData();

    return {
      success: true,
      totalFreelanceEarnings: this.freelanceEarnings,
      record
    };
  }

  /**
   * Get total earnings from all sources
   * @returns {object} Earnings summary
   */
  async getTotalEarnings() {
    await this.initialize();

    // Get bot state earnings if database is available
    let botStateEarnings = 0;
    try {
      const db = getDatabase();
      const botState = await db.getBotState();
      botStateEarnings = botState.totalEarnings || 0;
    } catch (error) {
      // Database not available, use local tracking
    }

    // Get payment manager balance
    const paymentBalance = paymentManager.getBalance();
    const paymentStats = paymentManager.getStatistics();

    // Calculate total from all sources
    const total = this.tradingProfit + this.freelanceEarnings + botStateEarnings + paymentBalance;

    return {
      total,
      breakdown: {
        trading: this.tradingProfit,
        freelance: this.freelanceEarnings,
        botState: botStateEarnings,
        payments: paymentBalance
      },
      paymentStats,
      recordCount: this.earningsHistory.length
    };
  }

  /**
   * Get earnings by time period
   * @param {string} period - 'daily', 'weekly', 'monthly', 'all'
   * @returns {object} Period earnings
   */
  getEarningsByPeriod(period = 'all') {
    const now = new Date();
    let cutoffDate;

    switch (period) {
      case 'daily':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }

    const periodRecords = this.earningsHistory.filter(
      record => new Date(record.timestamp) >= cutoffDate
    );

    const trading = periodRecords
      .filter(r => r.type === 'trading')
      .reduce((sum, r) => sum + r.amount, 0);

    const freelance = periodRecords
      .filter(r => r.type === 'freelance')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      period,
      total: trading + freelance,
      trading,
      freelance,
      recordCount: periodRecords.length,
      records: periodRecords
    };
  }

  /**
   * Get earnings by source
   * @returns {object} Earnings grouped by source
   */
  getEarningsBySource() {
    const sources = {};

    this.earningsHistory.forEach(record => {
      const source = record.source || 'unknown';
      if (!sources[source]) {
        sources[source] = {
          total: 0,
          count: 0,
          type: record.type
        };
      }
      sources[source].total += record.amount;
      sources[source].count++;
    });

    return sources;
  }

  /**
   * Get detailed earnings report
   * @returns {object} Comprehensive earnings report
   */
  async getDetailedReport() {
    await this.initialize();

    const totalEarnings = await this.getTotalEarnings();
    const dailyEarnings = this.getEarningsByPeriod('daily');
    const weeklyEarnings = this.getEarningsByPeriod('weekly');
    const monthlyEarnings = this.getEarningsByPeriod('monthly');
    const sourceBreakdown = this.getEarningsBySource();

    return {
      summary: {
        totalEarnings: totalEarnings.total,
        breakdown: totalEarnings.breakdown
      },
      periods: {
        daily: {
          total: dailyEarnings.total,
          trading: dailyEarnings.trading,
          freelance: dailyEarnings.freelance
        },
        weekly: {
          total: weeklyEarnings.total,
          trading: weeklyEarnings.trading,
          freelance: weeklyEarnings.freelance
        },
        monthly: {
          total: monthlyEarnings.total,
          trading: monthlyEarnings.trading,
          freelance: monthlyEarnings.freelance
        }
      },
      sources: sourceBreakdown,
      statistics: {
        totalTransactions: this.earningsHistory.length,
        tradingTransactions: this.earningsHistory.filter(r => r.type === 'trading').length,
        freelanceJobs: this.earningsHistory.filter(r => r.type === 'freelance').length,
        averageEarningPerTransaction: this.earningsHistory.length > 0
          ? (this.tradingProfit + this.freelanceEarnings) / this.earningsHistory.length
          : 0
      },
      paymentInfo: totalEarnings.paymentStats,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get recent earnings (last N records)
   * @param {number} limit - Number of recent records to return
   * @returns {array} Recent earnings records
   */
  getRecentEarnings(limit = 10) {
    return this.earningsHistory
      .slice(-limit)
      .reverse()
      .map(record => ({
        id: record.id,
        type: record.type,
        source: record.source,
        amount: record.amount,
        timestamp: record.timestamp,
        description: record.type === 'trading'
          ? `${record.side} ${record.symbol}`
          : record.jobTitle || 'Job completed'
      }));
  }

  /**
   * Clear all earnings data (for testing)
   */
  clear() {
    this.earningsHistory = [];
    this.tradingProfit = 0;
    this.freelanceEarnings = 0;
    this.saveHistoricalData();
  }
}

// Singleton instance
const earningsTracker = new EarningsTracker();

export default earningsTracker;
export { EarningsTracker };
