/**
 * Fee calculation module for trading costs
 */

// Fee structures for different exchanges
const FEE_STRUCTURES = {
  NDAX: {
    maker: 0.002,  // 0.2%
    taker: 0.004,  // 0.4%
    withdrawal: {
      BTC: 0.0005,
      ETH: 0.01,
      USDT: 25,
      USDC: 25
    }
  },
  BINANCE: {
    maker: 0.001,  // 0.1%
    taker: 0.001,  // 0.1%
    withdrawal: {
      BTC: 0.0004,
      ETH: 0.008,
      USDT: 15,
      USDC: 15
    }
  },
  COINBASE: {
    maker: 0.005,  // 0.5%
    taker: 0.005,  // 0.5%
    withdrawal: {
      BTC: 0.0001,
      ETH: 0.005,
      USDT: 10,
      USDC: 10
    }
  }
};

/**
 * Calculate trading fee
 * @param {number} amount - Trade amount
 * @param {string} orderType - 'MAKER' or 'TAKER'
 * @param {string} exchange - Exchange name
 * @returns {object} Fee details
 */
export function calculateTradingFee(amount, orderType = 'TAKER', exchange = 'NDAX') {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const feeStructure = FEE_STRUCTURES[exchange.toUpperCase()];
  if (!feeStructure) {
    throw new Error(`Unknown exchange: ${exchange}`);
  }

  const rate = orderType.toUpperCase() === 'MAKER' ? feeStructure.maker : feeStructure.taker;
  const fee = amount * rate;

  return {
    amount,
    feeRate: rate,
    fee,
    netAmount: amount - fee,
    orderType,
    exchange
  };
}

/**
 * Calculate withdrawal fee
 * @param {number} amount - Withdrawal amount
 * @param {string} currency - Currency symbol
 * @param {string} exchange - Exchange name
 * @returns {object} Withdrawal fee details
 */
export function calculateWithdrawalFee(amount, currency, exchange = 'NDAX') {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const feeStructure = FEE_STRUCTURES[exchange.toUpperCase()];
  if (!feeStructure) {
    throw new Error(`Unknown exchange: ${exchange}`);
  }

  const fee = feeStructure.withdrawal[currency.toUpperCase()] || 0;
  
  if (fee >= amount) {
    throw new Error('Withdrawal amount must be greater than fee');
  }

  return {
    amount,
    fee,
    netAmount: amount - fee,
    currency,
    exchange
  };
}

/**
 * Calculate total trading costs including fees and slippage
 * @param {number} amount - Trade amount
 * @param {number} price - Trade price
 * @param {string} orderType - 'MAKER' or 'TAKER'
 * @param {number} slippage - Slippage percentage (0-1)
 * @param {string} exchange - Exchange name
 * @returns {object} Total cost breakdown
 */
export function calculateTotalTradingCost(amount, price, orderType = 'TAKER', slippage = 0.001, exchange = 'NDAX') {
  const tradeValue = amount * price;
  const feeInfo = calculateTradingFee(tradeValue, orderType, exchange);
  const slippageCost = tradeValue * slippage;
  const totalCost = feeInfo.fee + slippageCost;

  return {
    tradeValue,
    tradingFee: feeInfo.fee,
    slippageCost,
    totalCost,
    netValue: tradeValue - totalCost,
    costPercentage: (totalCost / tradeValue) * 100
  };
}

/**
 * Calculate profit after fees
 * @param {number} buyPrice - Purchase price
 * @param {number} sellPrice - Sell price
 * @param {number} quantity - Trade quantity
 * @param {string} exchange - Exchange name
 * @returns {object} Profit details
 */
export function calculateProfitAfterFees(buyPrice, sellPrice, quantity, exchange = 'NDAX') {
  if (buyPrice <= 0 || sellPrice <= 0 || quantity <= 0) {
    throw new Error('All values must be positive');
  }

  const buyValue = buyPrice * quantity;
  const sellValue = sellPrice * quantity;
  
  const buyFee = calculateTradingFee(buyValue, 'TAKER', exchange).fee;
  const sellFee = calculateTradingFee(sellValue, 'MAKER', exchange).fee;
  
  const grossProfit = sellValue - buyValue;
  const totalFees = buyFee + sellFee;
  const netProfit = grossProfit - totalFees;
  const profitPercentage = (netProfit / buyValue) * 100;

  return {
    buyValue,
    sellValue,
    grossProfit,
    buyFee,
    sellFee,
    totalFees,
    netProfit,
    profitPercentage
  };
}

/**
 * Calculate breakeven price
 * @param {number} entryPrice - Entry price
 * @param {string} side - 'BUY' or 'SELL'
 * @param {string} exchange - Exchange name
 * @returns {number} Breakeven price
 */
export function calculateBreakevenPrice(entryPrice, side = 'BUY', exchange = 'NDAX') {
  if (entryPrice <= 0) {
    throw new Error('Entry price must be positive');
  }

  const feeStructure = FEE_STRUCTURES[exchange.toUpperCase()];
  if (!feeStructure) {
    throw new Error(`Unknown exchange: ${exchange}`);
  }

  // Account for both entry and exit fees
  const totalFeeRate = feeStructure.taker + feeStructure.maker;

  if (side.toUpperCase() === 'BUY') {
    return entryPrice * (1 + totalFeeRate);
  } else {
    return entryPrice * (1 - totalFeeRate);
  }
}

/**
 * Get fee structure for an exchange
 * @param {string} exchange - Exchange name
 * @returns {object} Fee structure
 */
export function getFeeStructure(exchange = 'NDAX') {
  const feeStructure = FEE_STRUCTURES[exchange.toUpperCase()];
  if (!feeStructure) {
    throw new Error(`Unknown exchange: ${exchange}`);
  }
  return feeStructure;
}

export default {
  calculateTradingFee,
  calculateWithdrawalFee,
  calculateTotalTradingCost,
  calculateProfitAfterFees,
  calculateBreakevenPrice,
  getFeeStructure
};
