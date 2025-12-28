# NDAX Wallet & Trading Integration Setup

## 🎯 Overview

Complete guide for integrating your NDAX wallet with the Quantum Engine for automated trading and earnings management.

## 📋 Prerequisites

1. **NDAX Account** - Active account on NDAX.io
2. **Verified Identity** - KYC verification completed
3. **API Access** - API credentials generated
4. **Funded Wallet** - Minimum balance for trading

## 🔑 Step 1: Get NDAX API Credentials

### A. Create NDAX Account

1. Visit [https://ndax.io](https://ndax.io)
2. Click "Sign Up"
3. Complete registration with email and password
4. Verify email address

### B. Complete KYC Verification

1. Log in to NDAX account
2. Navigate to **Settings → Verification**
3. Upload required documents:
   - Government-issued ID
   - Proof of address
   - Selfie for identity verification
4. Wait for approval (usually 1-3 business days)

### C. Generate API Keys

1. Go to **Settings → API Management**
2. Click "Create New API Key"
3. Set permissions:
   - ✅ **View** - Read account information
   - ✅ **Trade** - Place and cancel orders
   - ✅ **Withdraw** (Optional) - Withdraw funds
4. Save the credentials:
   - **API Key** - Public identifier
   - **API Secret** - Private key (shown only once!)
   - **User ID** - Your NDAX user ID

⚠️ **IMPORTANT:** Save your API Secret immediately. It cannot be recovered.

## 🔧 Step 2: Configure NDAX Quantum Engine

### A. Set Environment Variables

Edit your `.env` file:

```bash
# NDAX Trading API
NDAX_API_KEY=your_ndax_api_key_here
NDAX_API_SECRET=your_ndax_api_secret_here
NDAX_USER_ID=your_ndax_user_id_here

# Trading Configuration
NDAX_BASE_URL=https://api.ndax.io/api
NDAX_WEBSOCKET_URL=wss://api.ndax.io/ws

# Risk Management
MAX_POSITION_SIZE=10000
MAX_DAILY_LOSS=1000
RISK_LEVEL=moderate

# Enable Trading
DEMO_MODE=false
ENABLE_LIVE_TRADING=true
```

### B. Validate Configuration

Run the validation script:

```bash
npm run register
```

This will:
- ✅ Verify API credentials
- ✅ Test connection to NDAX
- ✅ Check account balance
- ✅ Validate permissions

### C. Configure Wizard

1. Start the application:
   ```bash
   npm start
   ```

2. Navigate to **Dashboard → Wizard**

3. Follow the setup wizard:
   - **Step 1:** Enter NDAX API credentials
   - **Step 2:** Set trading parameters
   - **Step 3:** Configure risk limits
   - **Step 4:** Test connection

## 💰 Step 3: Fund Your NDAX Wallet

### Deposit Methods

1. **Bank Transfer (ACH)** - Low fees, 1-3 days
2. **Wire Transfer** - Fast, higher fees
3. **Cryptocurrency** - Instant, network fees apply
4. **Interac e-Transfer** (Canada) - Fast, low fees

### Recommended Initial Balance

- **Demo/Testing:** $100 - $500
- **Conservative Trading:** $1,000 - $5,000
- **Active Trading:** $5,000+

### Deposit Steps

1. Log in to NDAX
2. Navigate to **Wallet → Deposit**
3. Select currency (CAD, USD, BTC, ETH, etc.)
4. Choose deposit method
5. Follow instructions for selected method
6. Wait for confirmation (time varies by method)

## ⚛️ Step 4: Configure Quantum Trading

### A. Select Trading Strategies

Available quantum strategies:

1. **Superposition** - Multi-state market analysis
   - Best for: Volatile markets
   - Risk: Medium
   - Expected Return: 5-15%

2. **Entanglement** - Correlated asset trading
   - Best for: Multiple asset pairs
   - Risk: Low-Medium
   - Expected Return: 3-8%

3. **Tunneling** - Breakthrough resistance/support
   - Best for: Range-bound markets
   - Risk: Medium-High
   - Expected Return: 8-20%

4. **Interference** - Pattern-based predictions
   - Best for: Trending markets
   - Risk: Low
   - Expected Return: 2-6%

### B. Set Strategy Parameters

In Dashboard → Quantum Engine:

```javascript
{
  "strategy": "superposition",
  "riskLevel": "moderate",
  "maxTradeSize": 1000,
  "stopLoss": 0.02,        // 2% stop loss
  "takeProfit": 0.05,       // 5% take profit
  "tradingPairs": [
    "BTC/CAD",
    "ETH/CAD",
    "BTC/USD"
  ],
  "timeframe": "1h",
  "indicators": {
    "rsi": true,
    "macd": true,
    "bollingerBands": true
  }
}
```

### C. Configure Risk Management

```javascript
{
  "positionSizing": {
    "method": "fixed",        // fixed, percentage, kelly
    "amount": 1000,           // Max $1000 per trade
    "maxPositions": 5         // Max 5 open positions
  },
  "riskLimits": {
    "maxDailyLoss": 1000,     // Stop trading after $1000 loss
    "maxDailyTrades": 20,     // Max 20 trades per day
    "maxDrawdown": 0.10       // Max 10% account drawdown
  },
  "emergencyStop": {
    "enabled": true,
    "trigger": "manual"       // manual, automated, scheduled
  }
}
```

## 🤖 Step 5: Enable Autonomous Trading

### A. Set Trading Hours

```javascript
{
  "schedule": {
    "timezone": "America/Toronto",
    "tradingHours": {
      "monday": { "start": "09:00", "end": "17:00" },
      "tuesday": { "start": "09:00", "end": "17:00" },
      "wednesday": { "start": "09:00", "end": "17:00" },
      "thursday": { "start": "09:00", "end": "17:00" },
      "friday": { "start": "09:00", "end": "17:00" },
      "saturday": { "enabled": false },
      "sunday": { "enabled": false }
    },
    "pauseDuringNews": true   // Pause during major economic news
  }
}
```

### B. Enable Auto-Trading

Via API:

```bash
curl -X POST http://localhost:3000/api/quantum/auto-trade \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "strategy": "superposition",
    "riskLevel": "moderate"
  }'
```

Via Dashboard:

1. Navigate to **Settings → Trading**
2. Toggle "Enable Auto-Trading"
3. Select strategy
4. Set risk parameters
5. Click "Save & Start"

## 💸 Step 6: Earnings & Withdrawals

### A. Track Earnings

View earnings in:
- **Dashboard** - Real-time P&L
- **Activity Log** - Trade history
- **Analytics** - Performance reports

### B. Automatic Withdrawals

Configure automatic withdrawals to NDAX wallet:

```javascript
{
  "autoWithdraw": {
    "enabled": true,
    "threshold": 1000,        // Withdraw when balance > $1000
    "frequency": "weekly",    // daily, weekly, monthly
    "destination": "NDAX",    // NDAX wallet
    "keepMinimum": 500        // Keep $500 for trading
  }
}
```

### C. Manual Withdrawal

1. Navigate to **Dashboard → Wallet**
2. Click "Withdraw"
3. Select destination (NDAX wallet)
4. Enter amount
5. Confirm transaction
6. Verify via 2FA

## 🔒 Step 7: Security Best Practices

### A. API Key Security

✅ **DO:**
- Store API keys in `.env` file only
- Use separate API keys for testing/production
- Set IP whitelist on NDAX (if available)
- Enable 2FA on NDAX account
- Regularly rotate API keys (monthly)

❌ **DON'T:**
- Commit API keys to Git
- Share API keys via email/chat
- Use API keys with withdraw permission (unless needed)
- Store API keys in frontend code
- Disable security features

### B. Enable Encryption

Ensure encryption is enabled:

```bash
# Generate encryption key
openssl rand -base64 32

# Add to .env
ENCRYPTION_KEY=your_generated_key_here
```

### C. Monitor Activity

Enable alerts for:
- Large trades (>$1000)
- Daily loss limit approaching
- API authentication failures
- Unusual trading patterns
- Withdrawal requests

## 📊 Step 8: Monitoring & Optimization

### A. Performance Metrics

Track these KPIs:

- **Win Rate** - % of profitable trades
- **Average Return** - Average % gain per trade
- **Sharpe Ratio** - Risk-adjusted return
- **Max Drawdown** - Largest peak-to-trough decline
- **Daily P&L** - Daily profit/loss

### B. Strategy Optimization

Review and adjust weekly:

1. Analyze winning/losing trades
2. Identify market conditions for best performance
3. Adjust risk parameters
4. Fine-tune strategy parameters
5. Backtest changes in Test Lab

### C. Automated Reporting

Enable daily reports:

```javascript
{
  "reporting": {
    "enabled": true,
    "frequency": "daily",
    "email": "your-email@example.com",
    "include": [
      "trades",
      "performance",
      "balance",
      "alerts"
    ]
  }
}
```

## 🧪 Step 9: Testing Before Live Trading

### A. Demo Mode

Test strategies in demo mode:

```bash
# Enable demo mode in .env
DEMO_MODE=true
ENABLE_LIVE_TRADING=false
```

### B. Paper Trading

1. Navigate to **Test Lab**
2. Select "Paper Trading"
3. Configure same settings as live
4. Run for 1-2 weeks
5. Analyze results
6. Switch to live when confident

### C. Backtesting

Test strategies on historical data:

1. Go to **Test Lab → Backtest**
2. Select strategy
3. Set date range (e.g., last 6 months)
4. Run backtest
5. Review results:
   - Total return
   - Max drawdown
   - Win rate
   - Risk metrics

## 🆘 Troubleshooting

### API Connection Issues

**Problem:** Cannot connect to NDAX API

**Solutions:**
1. Check API credentials are correct
2. Verify account is verified (KYC complete)
3. Check NDAX API status page
4. Ensure IP not blocked
5. Test with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.ndax.io/api/v1/account
   ```

### Trading Not Executing

**Problem:** Quantum engine running but no trades

**Solutions:**
1. Check DEMO_MODE is false
2. Verify sufficient balance
3. Check trading hours configuration
4. Review risk limits (may be too restrictive)
5. Check strategy parameters

### Withdrawal Issues

**Problem:** Cannot withdraw to NDAX wallet

**Solutions:**
1. Verify API key has withdraw permission
2. Check minimum withdrawal amount
3. Verify 2FA is enabled
4. Check daily withdrawal limits
5. Contact NDAX support if persists

### High Losses

**Problem:** Strategy losing money consistently

**Solutions:**
1. **STOP TRADING IMMEDIATELY**
2. Review trade history
3. Check market conditions (volatile, trending, etc.)
4. Reduce position size
5. Lower risk parameters
6. Switch to demo mode for testing
7. Consider different strategy

## 📞 Support Resources

### NDAX Support

- **Website:** [https://ndax.io/support](https://ndax.io/support)
- **Email:** support@ndax.io
- **Phone:** 1-800-123-4567 (example)
- **Live Chat:** Available 24/7

### Quantum Engine Support

- **GitHub Issues:** [Issues Page](https://github.com/oconnorw225-del/ndax-quantum-engine/issues)
- **Documentation:** `docs/` directory
- **API Reference:** [docs/API.md](docs/API.md)

## 📈 Next Steps

Once NDAX integration is complete:

1. ✅ Configure freelance automation for additional income
2. ✅ Enable autonomous mode for 24/7 operation
3. ✅ Set up webhook notifications
4. ✅ Configure mobile app for monitoring
5. ✅ Join community for strategy sharing

## ⚠️ Legal Disclaimer

**IMPORTANT:** Cryptocurrency trading involves substantial risk of loss. This software is provided "as is" without warranties. Use at your own risk. The developers are not responsible for trading losses. Always:

- Trade with money you can afford to lose
- Start with small amounts
- Test thoroughly in demo mode
- Understand the risks involved
- Consult with financial advisors
- Comply with local regulations

---

**Version:** 2.1.0  
**Last Updated:** 2025-12-20  
**Status:** ✅ Production Ready
