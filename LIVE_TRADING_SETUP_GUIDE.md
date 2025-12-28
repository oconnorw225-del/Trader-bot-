# Live Trading Setup Guide

This guide walks you through the process of transitioning from paper trading to live trading with real NDAX API credentials.

## ⚠️ Important Warnings

**READ THIS BEFORE PROCEEDING:**

- Live trading uses **REAL MONEY**
- Always test thoroughly in paper trading mode first
- Start with small amounts to validate your strategy
- Understand the risks of automated trading
- Never commit your API credentials to version control
- Keep your API secret secure and private

## Prerequisites

Before enabling live trading, ensure you have:

- [ ] An active NDAX account
- [ ] Completed KYC verification on NDAX
- [ ] Tested your trading strategy in paper trading mode for at least 1-2 weeks
- [ ] Positive results from paper trading (>60% win rate recommended)
- [ ] Understanding of the risks involved in automated trading
- [ ] Funds deposited in your NDAX account (start small!)

## Step 1: Get NDAX API Credentials

### 1.1 Create NDAX Account

1. Visit [https://ndax.io](https://ndax.io)
2. Click "Sign Up" and complete registration
3. Verify your email address

### 1.2 Complete KYC Verification

1. Log in to your NDAX account
2. Navigate to **Settings → Verification**
3. Upload required documents:
   - Government-issued ID (driver's license, passport)
   - Proof of address (utility bill, bank statement)
   - Selfie for identity verification
4. Wait for approval (typically 1-3 business days)

### 1.3 Generate API Keys

1. Go to **Settings → API Management**
2. Click "Create New API Key"
3. Set permissions (recommended for testing):
   - ✅ **View** - Read account information
   - ✅ **Trade** - Place and cancel orders
   - ❌ **Withdraw** - Leave disabled initially for safety
4. **IMPORTANT:** Copy and save these credentials immediately:
   - **API Key** - Your public identifier
   - **API Secret** - Your private key (shown only once!)
   - **User ID** - Your NDAX user ID
   - **Account ID** - Your trading account ID

⚠️ **CRITICAL:** Save your API Secret immediately. It cannot be recovered after closing the page.

### 1.4 Security Best Practices

For additional security:
1. Enable IP whitelisting in NDAX API settings
2. Set up 2FA (Two-Factor Authentication) on your NDAX account
3. Use separate API keys for testing and production
4. Regularly rotate your API keys (every 3-6 months)

## Step 2: Add Credentials to .env File

### 2.1 Create Your .env File

If you haven't already, create a `.env` file from the example:

```bash
cp .env.example .env
```

### 2.2 Add NDAX Credentials

Open `.env` file and update the NDAX credentials section:

```bash
# NDAX-specific credentials (REQUIRED for live trading with NDAXLiveClient)
NDAX_API_KEY=your_actual_api_key_from_ndax
NDAX_API_SECRET=your_actual_api_secret_from_ndax
NDAX_USER_ID=your_actual_user_id
NDAX_ACCOUNT_ID=your_actual_account_id
NDAX_BASE_URL=https://api.ndax.io

# Trading Mode Configuration
USE_LIVE_TRADING=false  # Keep as 'false' until you complete all setup steps
```

### 2.3 Verify .env is in .gitignore

**CRITICAL SECURITY CHECK:**

```bash
# Verify .env is in .gitignore
grep "^\.env$" .gitignore

# If not found, add it:
echo ".env" >> .gitignore
```

## Step 3: Update main.py to Use Live Client

### 3.1 Uncomment the Live Client Import

In `main.py`, find this line and uncomment it:

```python
# from platform.ndax_live import NDAXLiveClient
```

Change it to:

```python
from platform.ndax_live import NDAXLiveClient
```

### 3.2 Update Client Initialization

In the `main()` function, find this section:

```python
if use_live:
    print("⚠️  WARNING: Live trading mode requested")
    # ... warning messages ...
    client = NDAXTestClient()
else:
    client = NDAXTestClient()
```

Replace it with:

```python
if use_live:
    print("⚠️  WARNING: Live trading mode enabled")
    print("⚠️  Using REAL MONEY - Ensure all safety checks are in place\n")
    try:
        client = NDAXLiveClient()
        print("✅ Successfully initialized NDAX Live Client")
    except ValueError as e:
        print(f"❌ Failed to initialize live client: {e}")
        print("⚠️  Falling back to TEST mode for safety...\n")
        client = NDAXTestClient()
else:
    client = NDAXTestClient()
```

## Step 4: Implement Your Trading Strategy

### 4.1 Update strategy/chimera_core.py

The `decide()` function in `strategy/chimera_core.py` currently returns a placeholder "BUY" signal. You MUST implement your actual trading logic.

See the comprehensive implementation guide in `strategy/chimera_core.py` for:
- Example strategies (SMA crossover, RSI-based, ML/Quantum)
- Risk management considerations
- Logging and audit trails
- Testing recommendations

### 4.2 Strategy Implementation Checklist

- [ ] Implemented your strategy logic in `decide()` function
- [ ] Added technical indicators (SMA, RSI, MACD, etc.)
- [ ] Integrated risk management checks
- [ ] Added comprehensive logging
- [ ] Tested with historical data (backtesting)
- [ ] Verified edge cases and error handling

## Step 5: Implement Live Trading API Calls

The `NDAXLiveClient` in `platform/ndax_live.py` has TODO placeholders for actual API calls. You need to implement:

### 5.1 Required API Implementations

1. **get_balance()** - Fetch live account balances
2. **get_price()** - Get current market prices
3. **place_order()** - Execute live trades

### 5.2 NDAX API Documentation

Refer to official NDAX API documentation:
- API Docs: [https://ndax.io/api](https://ndax.io/api)
- WebSocket API: For real-time market data
- REST API: For account management and trading

### 5.3 Example Implementation

See the TODO comments in `platform/ndax_live.py` for example API call structures using the `requests` library.

## Step 6: Test in Paper Trading Mode First

**DO NOT SKIP THIS STEP!**

### 6.1 Run Paper Trading Tests

```bash
# Ensure USE_LIVE_TRADING=false in .env
python main.py
```

### 6.2 Monitor Paper Trading Performance

Run paper trading for at least 1-2 weeks and track:
- Win rate (target: >60%)
- Average profit per trade
- Maximum drawdown
- Number of trades per day
- Strategy effectiveness in different market conditions

### 6.3 Review Logs

Check logs for:
- Correct signal generation
- Proper risk management
- No errors or exceptions
- Expected behavior under various conditions

## Step 7: Enable Live Trading (Final Steps)

### 7.1 Final Safety Checklist

Before enabling live trading, verify:

- [ ] NDAX API credentials are correct and tested
- [ ] Paper trading shows consistent positive results (>60% win rate)
- [ ] All API methods are implemented in `platform/ndax_live.py`
- [ ] Trading strategy is fully implemented in `strategy/chimera_core.py`
- [ ] Risk management limits are configured (MAX_POSITION_SIZE, MAX_DAILY_LOSS)
- [ ] Stop-loss and take-profit levels are set
- [ ] You understand and accept the risks
- [ ] You have funds deposited (start with a small amount!)

### 7.2 Enable Live Trading

1. Update `.env` file:
   ```bash
   USE_LIVE_TRADING=true
   ```

2. Set appropriate risk limits:
   ```bash
   MAX_POSITION_SIZE=100      # Start small! (e.g., $100 per trade)
   MAX_DAILY_LOSS=50          # Maximum daily loss limit
   RISK_LEVEL=conservative    # conservative, moderate, or aggressive
   ```

3. Start the bot:
   ```bash
   python main.py
   ```

### 7.3 Monitor Live Trading

**ACTIVELY MONITOR YOUR FIRST LIVE TRADES:**

- Watch the logs in real-time
- Verify orders are executed correctly
- Check that prices are reasonable
- Ensure risk limits are respected
- Be ready to stop the bot if needed (Ctrl+C)

### 7.4 Emergency Stop

If anything goes wrong:

1. **Stop the bot immediately:** Press `Ctrl+C`
2. **Cancel open orders:** Log in to NDAX web interface
3. **Review logs:** Check what went wrong
4. **Disable live trading:** Set `USE_LIVE_TRADING=false` in `.env`
5. **Return to paper trading:** Test fixes thoroughly before trying again

## Step 8: Ongoing Monitoring and Maintenance

### 8.1 Daily Monitoring

- Review trading logs daily
- Check account balance and P&L
- Monitor win rate and performance metrics
- Verify risk limits are working
- Watch for any errors or unusual behavior

### 8.2 Performance Metrics

Track these key metrics:
- **Win Rate:** Percentage of profitable trades (target: >60%)
- **Profit Factor:** Gross profit / Gross loss (target: >1.5)
- **Maximum Drawdown:** Largest peak-to-trough decline (keep below 10%)
- **Sharpe Ratio:** Risk-adjusted return (target: >1.0)
- **Average Trade Duration:** How long positions are held

### 8.3 Strategy Adjustments

Based on performance:
- Adjust position sizes
- Modify risk parameters
- Fine-tune strategy logic
- Update stop-loss/take-profit levels

Always test adjustments in paper trading first!

## Troubleshooting

### Common Issues

#### 1. "Missing NDAX API credentials" Error

**Solution:** Verify your `.env` file has all required credentials:
- NDAX_API_KEY
- NDAX_API_SECRET
- NDAX_USER_ID
- NDAX_ACCOUNT_ID

#### 2. "Authentication Failed" Error

**Solutions:**
- Verify API credentials are correct (copy-paste carefully)
- Check if API key has expired or been revoked
- Ensure API key has correct permissions (View + Trade)
- Verify your NDAX account is in good standing

#### 3. "Rate Limit Exceeded" Error

**Solutions:**
- Reduce trading frequency
- Increase sleep time between requests
- Check NDAX API rate limits
- Ensure you're not running multiple instances

#### 4. Orders Not Executing

**Solutions:**
- Verify sufficient balance in your NDAX account
- Check order parameters (price, quantity)
- Ensure trading pair is correct (e.g., "BTC/CAD")
- Review NDAX order requirements (minimum order size, price increments)

#### 5. Unexpected Losses

**Solutions:**
- Stop the bot immediately (Ctrl+C)
- Review trading logs to identify the issue
- Check if strategy logic is working as expected
- Verify risk management is functioning
- Return to paper trading to test fixes

## Additional Resources

- **NDAX API Documentation:** [https://ndax.io/api](https://ndax.io/api)
- **NDAX Trading Setup Guide:** See `NDAX_TRADING_SETUP.md`
- **NDAX API Reference:** See `NDAX_API_REFERENCE.md`
- **Risk Management:** See `src/shared/riskManager.js`
- **Quantum Strategies:** See `src/quantum/quantumStrategies.js`

## Support

If you encounter issues:

1. Check the logs in `logs/` directory
2. Review error messages carefully
3. Consult NDAX support for API-related issues
4. Test in paper trading mode to isolate the problem
5. Review the implementation guides in the code

## Final Reminder

**Live trading involves real financial risk. Only trade with money you can afford to lose. Past performance does not guarantee future results. Always start small and scale gradually as you gain confidence in your strategy.**

---

**Last Updated:** December 2024  
**Version:** 2.1.0
