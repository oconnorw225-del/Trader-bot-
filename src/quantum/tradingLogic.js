/**
 * Trading logic module for order execution and management
 */

import webhookManager from '../shared/webhookManager.js';

class TradingEngine {
  constructor() {
    this.orders = [];
    this.positions = new Map();
    this.balance = 10000; // Default balance
  }

  /**
   * Place a market order
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {number} price - Current market price
   * @returns {object} Order result
   */
  placeMarketOrder(symbol, side, quantity, price) {
    if (!symbol || !side || quantity <= 0 || price <= 0) {
      throw new Error('Invalid order parameters');
    }

    const orderValue = quantity * price;
    
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
      timestamp: new Date().toISOString()
    };

    this.orders.push(order);
    this.updatePosition(symbol, side, quantity, price);

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
   */
  updatePosition(symbol, side, quantity, price) {
    const position = this.positions.get(symbol) || {
      symbol,
      quantity: 0,
      avgPrice: 0,
      unrealizedPnL: 0
    };

    if (side === 'BUY') {
      const totalCost = (position.quantity * position.avgPrice) + (quantity * price);
      position.quantity += quantity;
      position.avgPrice = totalCost / position.quantity;
      this.balance -= quantity * price;
    } else if (side === 'SELL') {
      if (position.quantity < quantity) {
        throw new Error('Insufficient position to sell');
      }
      position.quantity -= quantity;
      this.balance += quantity * price;
      
      // Trigger position closed webhook if position is fully closed
      if (position.quantity === 0) {
        webhookManager.triggerEvent('position.closed', {
          symbol,
          quantity,
          avgPrice: position.avgPrice,
          exitPrice: price,
          pnl: (price - position.avgPrice) * quantity,
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
   * Get account balance
   * @returns {number} Current balance
   */
  getBalance() {
    return this.balance;
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
  }
}

export default TradingEngine;
