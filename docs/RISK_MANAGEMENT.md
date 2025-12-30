# Risk Management Integration Guide

**Last Updated:** December 30, 2025

## Overview

The NDAX Quantum Engine includes comprehensive risk management features integrated throughout the trading system. This guide explains how risk management works and how to use it effectively.

## Table of Contents

1. [Architecture](#architecture)
2. [Key Features](#key-features)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [Risk Parameters](#risk-parameters)
6. [Best Practices](#best-practices)
7. [API Reference](#api-reference)

## Architecture

Risk management is centralized in `src/shared/riskManager.js` and integrated into:

- **Trading Engine** (`src/quantum/tradingLogic.js`) - Automatic risk checks for all orders
- **Quantum Strategies** (`src/quantum/quantumStrategies.js`) - Risk-aware strategy recommendations
- **Backend Server** - Risk validation endpoints

```
┌─────────────────┐
│  Trading Engine │
└────────┬────────┘
         │
         ├──> Risk Manager (validates all trades)
         │
         ├──> Quantum Strategies (risk-aware recommendations)
         │
         └──> Position Management (stop-loss, sizing)
```

## Key Features

### 1. Automatic Risk Validation

All market orders go through risk validation automatically:

```javascript
// Risk check happens automatically
const order = engine.placeMarketOrder('BTC/USD', 'BUY', 1, 50000);
// Throws error if risk limits exceeded
```

### 2. Stop-Loss Management

Positions can have stop-loss prices with automatic execution:

```javascript
// Place order with stop-loss
engine.placeMarketOrder('BTC/USD', 'BUY', 1, 50000, {
  skipRiskCheck: false,
  stopLoss: 48000  // Exit if price falls to $48,000
});

// Check stop-loss conditions
const triggered = engine.checkStopLoss({ 'BTC/USD': 47500 });

// Execute stop-loss
if (triggered.length > 0) {
  engine.executeStopLoss('BTC/USD', 47500);
}
```

### 3. Risk-Adjusted Position Sizing

Calculate optimal position size based on risk parameters:

```javascript
const sizing = engine.calculateRiskAdjustedSize(
  'BTC/USD',    // symbol
  50000,        // current price
  48000,        // stop-loss price
  2             // risk 2% of balance
);

console.log(sizing);
// {
//   optimalQuantity: 0.1,
//   potentialRisk: 200,
//   stopLossDistance: 2000,
//   ...
// }
```

### 4. Risk-Aware Quantum Strategies

Quantum strategies can include risk assessment in their recommendations:

```javascript
import { quantumSuperposition } from './quantum/quantumStrategies.js';

const result = quantumSuperposition(marketStates, weights, {
  checkRisk: true,
  symbol: 'BTC/USD',
  size: 1
});

if (result.shouldExecute && result.recommendation === 'BUY') {
  // Safe to execute trade
  engine.placeMarketOrder('BTC/USD', 'BUY', 1, result.optimalPrice);
}
```

## Configuration

Risk parameters can be configured via environment variables or programmatically:

### Environment Variables

```bash
# .env file
MAX_POSITION_SIZE=10000    # Maximum position value in USD
MAX_DAILY_LOSS=1000        # Maximum daily loss in USD
RISK_LEVEL=moderate        # Risk level: conservative, moderate, aggressive
```

### Programmatic Configuration

```javascript
import riskManager from './shared/riskManager.js';

riskManager.setRiskParameters({
  maxPositionSize: 15000,
  maxDailyLoss: 2000,
  riskLevel: 'conservative'
});
```

## Usage Examples

### Example 1: Safe Order Placement

```javascript
import TradingEngine from './quantum/tradingLogic.js';

const engine = new TradingEngine();

try {
  // Risk check happens automatically
  const order = engine.placeMarketOrder('ETH/USD', 'BUY', 2, 3000);
  console.log('Order placed successfully:', order);
} catch (error) {
  if (error.message.includes('risk manager')) {
    console.error('Trade rejected due to risk limits:', error.message);
  } else {
    console.error('Order failed:', error.message);
  }
}
```

### Example 2: Risk-Aware Trading Strategy

```javascript
import TradingEngine from './quantum/tradingLogic.js';
import { quantumInterference } from './quantum/quantumStrategies.js';

const engine = new TradingEngine();

// Collect trading signals from various indicators
const signals = [
  { type: 'BUY' },   // RSI oversold
  { type: 'BUY' },   // MACD bullish cross
  { type: 'HOLD' }   // Bollinger Bands neutral
];

// Get risk-aware recommendation
const strategy = quantumInterference(signals, {
  checkRisk: true,
  symbol: 'BTC/USD',
  size: 0.5,
  price: 50000
});

console.log('Strategy:', strategy.finalSignal);
console.log('Risk approved:', strategy.shouldExecute);

if (strategy.shouldExecute && strategy.finalSignal === 'BUY') {
  // Calculate optimal size
  const sizing = engine.calculateRiskAdjustedSize(
    'BTC/USD',
    50000,
    48000,  // 4% stop-loss
    2       // Risk 2% of balance
  );
  
  // Place order with stop-loss
  engine.placeMarketOrder('BTC/USD', 'BUY', sizing.optimalQuantity, 50000, {
    stopLoss: 48000
  });
}
```

### Example 3: Portfolio Protection

```javascript
import TradingEngine from './quantum/tradingLogic.js';

const engine = new TradingEngine();

// Monitor positions and execute stop-losses
setInterval(() => {
  // Get current market prices
  const currentPrices = {
    'BTC/USD': getCurrentPrice('BTC/USD'),
    'ETH/USD': getCurrentPrice('ETH/USD')
  };
  
  // Check stop-loss conditions
  const triggered = engine.checkStopLoss(currentPrices);
  
  // Execute stop-losses if needed
  for (const item of triggered) {
    console.log(`Stop-loss triggered for ${item.symbol}`);
    engine.executeStopLoss(item.symbol, item.currentPrice);
  }
}, 5000); // Check every 5 seconds
```

## Risk Parameters

### Position Size Limits

| Risk Level | Max Position Size | Description |
|------------|-------------------|-------------|
| Conservative | $5,000 | Suitable for beginners or small accounts |
| Moderate | $10,000 | Balanced risk/reward (default) |
| Aggressive | $25,000 | For experienced traders with larger capital |

### Daily Loss Limits

Daily loss limits prevent catastrophic losses:

- **Conservative**: $500/day
- **Moderate**: $1,000/day (default)
- **Aggressive**: $2,500/day

### Portfolio Concentration

Maximum concentration in a single asset:

- **Conservative**: 20% of portfolio
- **Moderate**: 30% of portfolio (default)
- **Aggressive**: 40% of portfolio

### Volatility Thresholds

High volatility detection:

- **Low**: volatility < 0.3
- **Medium**: 0.3 ≤ volatility < 0.5
- **High**: volatility ≥ 0.5

Trades with high volatility receive additional risk score penalties.

## Best Practices

### 1. Always Use Stop-Losses

```javascript
// ✅ GOOD: With stop-loss
engine.placeMarketOrder('BTC/USD', 'BUY', 1, 50000, {
  stopLoss: 48000
});

// ❌ BAD: No stop-loss
engine.placeMarketOrder('BTC/USD', 'BUY', 1, 50000);
```

### 2. Use Risk-Adjusted Sizing

```javascript
// ✅ GOOD: Calculate optimal size
const sizing = engine.calculateRiskAdjustedSize('BTC/USD', 50000, 48000, 2);
engine.placeMarketOrder('BTC/USD', 'BUY', sizing.optimalQuantity, 50000);

// ❌ BAD: Arbitrary position size
engine.placeMarketOrder('BTC/USD', 'BUY', 5, 50000);
```

### 3. Monitor Daily Losses

```javascript
// Get risk statistics
const stats = riskManager.getRiskStatistics();
console.log('Daily loss:', stats.dailyLoss);
console.log('Max daily loss:', stats.maxDailyLoss);

// Stop trading if approaching limit
if (stats.dailyLoss > stats.maxDailyLoss * 0.8) {
  console.warn('Approaching daily loss limit - pausing trading');
  return;
}
```

### 4. Reset Daily Metrics

```javascript
// Reset at start of each trading day
const resetTime = new Date();
resetTime.setHours(0, 0, 0, 0);

if (Date.now() >= resetTime.getTime()) {
  riskManager.resetDailyMetrics();
}
```

### 5. Review Risk Events

```javascript
// Get recent risk events
const recentEvents = riskManager.getRiskEvents(20);

// Analyze rejected trades
const rejected = recentEvents.filter(e => !e.approved);
console.log('Rejected trades:', rejected.length);
rejected.forEach(event => {
  console.log('Reason:', event.risks.join(', '));
});
```

## API Reference

### TradingEngine Methods

#### placeMarketOrder(symbol, side, quantity, price, options)

Place a market order with automatic risk validation.

**Parameters:**
- `symbol` (string): Trading symbol (e.g., 'BTC/USD')
- `side` (string): 'BUY' or 'SELL'
- `quantity` (number): Order quantity
- `price` (number): Current market price
- `options` (object): Optional parameters
  - `skipRiskCheck` (boolean): Skip risk validation (for testing)
  - `stopLoss` (number): Stop-loss price
  - `volatility` (number): Market volatility (0-1)

**Returns:** Order object with status

**Throws:** Error if risk limits exceeded or insufficient balance

#### calculateRiskAdjustedSize(symbol, currentPrice, stopLossPrice, riskPercentage)

Calculate optimal position size based on risk parameters.

**Parameters:**
- `symbol` (string): Trading symbol
- `currentPrice` (number): Current market price
- `stopLossPrice` (number): Stop-loss price
- `riskPercentage` (number): Percentage of balance to risk (default: 2)

**Returns:** Object with position sizing details

#### checkStopLoss(currentPrices)

Check stop-loss conditions for all positions.

**Parameters:**
- `currentPrices` (object): Map of symbol to current price

**Returns:** Array of triggered positions

#### executeStopLoss(symbol, currentPrice)

Execute stop-loss for a specific position.

**Parameters:**
- `symbol` (string): Trading symbol
- `currentPrice` (number): Current market price

**Returns:** Closed position details

### RiskManager Methods

#### evaluateTradeRisk(trade)

Evaluate risk for a proposed trade.

**Parameters:**
- `trade` (object): Trade details
  - `symbol` (string): Trading symbol
  - `size` (number): Position size
  - `price` (number): Trade price
  - `volatility` (number): Market volatility

**Returns:** Risk assessment object with approval status

#### calculatePositionSize(accountBalance, riskPercentage, stopLossDistance)

Calculate optimal position size.

**Parameters:**
- `accountBalance` (number): Account balance
- `riskPercentage` (number): Risk percentage
- `stopLossDistance` (number): Distance to stop-loss

**Returns:** Optimal position size

#### getRiskStatistics()

Get risk statistics.

**Returns:** Object with risk metrics

#### setRiskParameters(params)

Update risk parameters.

**Parameters:**
- `params` (object): Risk parameters to update

### Quantum Strategy Methods

#### quantumSuperposition(marketStates, weights, riskParams)

Quantum superposition strategy with optional risk assessment.

**Parameters:**
- `marketStates` (array): Array of market states
- `weights` (object): Probability weights
- `riskParams` (object): Optional risk parameters
  - `checkRisk` (boolean): Enable risk assessment
  - `symbol` (string): Trading symbol
  - `size` (number): Position size

**Returns:** Strategy recommendation with risk assessment

#### quantumInterference(signals, riskParams)

Quantum interference strategy with optional risk assessment.

**Parameters:**
- `signals` (array): Array of trading signals
- `riskParams` (object): Optional risk parameters

**Returns:** Combined signal with risk assessment

## Security Considerations

1. **Never disable risk checks in production** - Only use `skipRiskCheck: true` for testing
2. **Use environment variables** - Keep risk parameters in `.env` file
3. **Monitor risk events** - Review rejected trades regularly
4. **Set conservative limits initially** - Adjust based on experience
5. **Implement circuit breakers** - Stop trading after multiple consecutive losses

## Troubleshooting

### Trade Rejected: Position size exceeds maximum

**Solution:** Reduce position size or increase `MAX_POSITION_SIZE` in environment variables.

### Trade Rejected: Daily loss limit

**Solution:** Stop trading for the day or increase `MAX_DAILY_LOSS`. Review trading strategy.

### Trade Rejected: High portfolio concentration

**Solution:** Diversify positions across multiple assets instead of concentrating on one.

### Trade Rejected: High volatility detected

**Solution:** Wait for market to stabilize or use smaller position size for volatile markets.

## Additional Resources

- [Trading Logic Documentation](./TRADING_LOGIC.md)
- [Quantum Strategies Guide](./QUANTUM_STRATEGIES.md)
- [API Reference](../docs/API.md)
- [Quick Start Guide](./QUICK_START.md)

---

**Version:** 2.1.0  
**Status:** Production Ready  
**Last Updated:** December 30, 2025
