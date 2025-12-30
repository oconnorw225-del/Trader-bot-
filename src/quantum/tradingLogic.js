/**
 * Trading logic module for order execution and management
 */

import webhookManager from '../shared/webhookManager.js';
import riskManager from '../shared/riskManager.js';

class TradingEngine {
  constructor() {
    this.orders = [];
    this.positions = new Map();
    this.balance = 10000; // Default balance
    this.riskManager = riskManager;
  }

  /**
   * Place a market order
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {number} price - Current market price
   * @param {object} options - Optional parameters (skipRiskCheck, stopLoss, volatility)
   * @returns {object} Order result
   */
  placeMarketOrder(symbol, side, quantity, price, options = {}) {
    if (!symbol || !side || quantity <= 0 || price <= 0) {
      throw new Error('Invalid order parameters');
    }

    const orderValue = quantity * price;

    // Perform risk check unless explicitly skipped (for testing)
    if (!options.skipRiskCheck) {
      const riskAssessment = this.riskManager.evaluateTradeRisk({
        symbol,
        size: quantity,
        price,
        volatility: options.volatility || 0
      });

      if (!riskAssessment.approved) {
        throw new Error(`Trade rejected by risk manager: ${riskAssessment.risks.join(', ')}`);
      }
    }
    
    if (side === 'BUY' && orderValue > this.balance) {
      throw new Error('Insufficient balance');
    }

    const order = {
      id: Date.now(),
      symbol,
      side,
      quantity,
      price,
      type: 'MARKET',
      status: 'FILLED',
      stopLoss: options.stopLoss,
      timestamp: new Date().toISOString()
    };

    this.orders.push(order);
    this.updatePosition(symbol, side, quantity, price, options.stopLoss);

    // Update risk manager position tracking
    const position = this.positions.get(symbol);
    if (position) {
      this.riskManager.updatePosition(symbol, position.quantity * position.avgPrice);
    }

    // Trigger webhook event
    webhookManager.triggerEvent('order.placed', {
      orderId: order.id,
      symbol,
      side,
      quantity,
      price,
      type: 'MARKET',
      status: 'FILLED',
      timestamp: order.timestamp
    }).catch(err => {
      console.error('Webhook delivery failed:', err);
    });

    return order;
  }

  /**
   * Place a limit order
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {number} limitPrice - Limit price
   * @returns {object} Order result
   */
  placeLimitOrder(symbol, side, quantity, limitPrice) {
    if (!symbol || !side || quantity <= 0 || limitPrice <= 0) {
      throw new Error('Invalid order parameters');
    }

    const order = {
      id: Date.now(),
      symbol,
      side,
      quantity,
      price: limitPrice,
      type: 'LIMIT',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    this.orders.push(order);
    return order;
  }

  /**
   * Cancel an order
   * @param {number} orderId - Order ID to cancel
   * @returns {boolean} Success status
   */
  cancelOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'FILLED') {
      throw new Error('Cannot cancel filled order');
    }

    order.status = 'CANCELLED';
    return true;
  }

  /**
   * Update position after order execution
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {number} price - Execution price
   * @param {number} stopLoss - Optional stop-loss price
   */
  updatePosition(symbol, side, quantity, price, stopLoss = null) {
    const position = this.positions.get(symbol) || {
      symbol,
      quantity: 0,
      avgPrice: 0,
      unrealizedPnL: 0,
      stopLoss: null,
      side: null
    };

    if (side === 'BUY') {
      const totalCost = (position.quantity * position.avgPrice) + (quantity * price);
      position.quantity += quantity;
      position.avgPrice = totalCost / position.quantity;
      position.side = 'LONG';
      if (stopLoss) position.stopLoss = stopLoss;
      this.balance -= quantity * price;
    } else if (side === 'SELL') {
      if (position.quantity < quantity) {
        throw new Error('Insufficient position to sell');
      }
      position.quantity -= quantity;
      this.balance += quantity * price;
      
      // Calculate realized PnL
      const realizedPnL = (price - position.avgPrice) * quantity;
      if (realizedPnL < 0) {
        this.riskManager.recordLoss(Math.abs(realizedPnL));
      }
      
      // Trigger position closed webhook if position is fully closed
      if (position.quantity === 0) {
        webhookManager.triggerEvent('position.closed', {
          symbol,
          quantity,
          avgPrice: position.avgPrice,
          exitPrice: price,
          pnl: realizedPnL,
          timestamp: new Date().toISOString()
        }).catch(err => {
          console.error('Webhook delivery failed:', err);
        });
      }
    }

    if (position.quantity > 0) {
      this.positions.set(symbol, position);
    } else {
      this.positions.delete(symbol);
    }
  }

  /**
   * Get current position for a symbol
   * @param {string} symbol - Trading symbol
   * @returns {object} Position details
   */
  getPosition(symbol) {
    return this.positions.get(symbol) || null;
  }

  /**
   * Get all positions
   * @returns {array} All positions
   */
  getAllPositions() {
    return Array.from(this.positions.values());
  }

  /**
   * Get order history
   * @param {string} symbol - Optional symbol filter
   * @returns {array} Order history
   */
  getOrderHistory(symbol = null) {
    if (symbol) {
      return this.orders.filter(order => order.symbol === symbol);
    }
    return this.orders;
  }

  /**
   * Calculate unrealized PnL for a position
   * @param {string} symbol - Trading symbol
   * @param {number} currentPrice - Current market price
   * @returns {number} Unrealized PnL
   */
  calculateUnrealizedPnL(symbol, currentPrice) {
    const position = this.positions.get(symbol);
    if (!position) {
      return 0;
    }
    return (currentPrice - position.avgPrice) * position.quantity;
  }

  /**
   * Check stop-loss conditions for all positions
   * @param {object} currentPrices - Map of symbol to current price
   * @returns {array} Stop-loss triggered positions
   */
  checkStopLoss(currentPrices = {}) {
    const triggeredPositions = [];
    
    for (const [symbol, position] of this.positions) {
      if (!position.stopLoss || !currentPrices[symbol]) {
        continue;
      }
      
      const shouldTrigger = this.riskManager.checkStopLoss(position, currentPrices[symbol]);
      
      if (shouldTrigger) {
        triggeredPositions.push({
          symbol,
          position,
          currentPrice: currentPrices[symbol],
          stopLoss: position.stopLoss
        });
      }
    }
    
    return triggeredPositions;
  }

  /**
   * Execute stop-loss for a position
   * @param {string} symbol - Trading symbol
   * @param {number} currentPrice - Current market price
   * @returns {object} Closed position details
   */
  executeStopLoss(symbol, currentPrice) {
    const position = this.positions.get(symbol);
    if (!position) {
      throw new Error('Position not found');
    }

    // Place sell order at current price with risk check skipped (emergency exit)
    const order = this.placeMarketOrder(
      symbol, 
      'SELL', 
      position.quantity, 
      currentPrice,
      { skipRiskCheck: true }
    );

    return {
      order,
      reason: 'stop-loss',
      stopLossPrice: position.stopLoss,
      actualPrice: currentPrice,
      pnl: (currentPrice - position.avgPrice) * position.quantity
    };
  }

  /**
   * Get account balance
   * @returns {number} Current balance
   */
  getBalance() {
    return this.balance;
  }

  /**
   * Calculate risk-adjusted position size
   * @param {string} symbol - Trading symbol
   * @param {number} currentPrice - Current market price
   * @param {number} stopLossPrice - Stop-loss price
   * @param {number} riskPercentage - Risk percentage of balance (default 2%)
   * @returns {object} Position sizing recommendation
   */
  calculateRiskAdjustedSize(symbol, currentPrice, stopLossPrice, riskPercentage = 2) {
    if (!symbol || currentPrice <= 0 || stopLossPrice <= 0) {
      throw new Error('Invalid parameters for position sizing');
    }

    const stopLossDistance = Math.abs(currentPrice - stopLossPrice);
    const optimalSize = this.riskManager.calculatePositionSize(
      this.balance,
      riskPercentage,
      stopLossDistance
    );

    const optimalQuantity = optimalSize / currentPrice;
    const maxAffordableQuantity = this.balance / currentPrice;

    return {
      symbol,
      currentPrice,
      stopLossPrice,
      riskPercentage,
      optimalPositionSize: optimalSize,
      optimalQuantity: Math.min(optimalQuantity, maxAffordableQuantity),
      maxAffordableQuantity,
      stopLossDistance,
      potentialRisk: optimalQuantity * stopLossDistance
    };
  }

  /**
   * Get total portfolio value
   * @param {object} currentPrices - Map of symbol to current price
   * @returns {number} Total portfolio value
   */
  getPortfolioValue(currentPrices = {}) {
    let positionsValue = 0;
    for (const [symbol, position] of this.positions) {
      const price = currentPrices[symbol] || position.avgPrice;
      positionsValue += position.quantity * price;
    }
    return this.balance + positionsValue;
  }

  /**
   * Reset engine state
   */
  reset() {
    this.orders = [];
    this.positions.clear();
    this.balance = 10000;
    this.riskManager.resetDailyMetrics();
  }
}

export default TradingEngine;
