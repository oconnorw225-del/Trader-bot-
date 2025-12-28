# Quick Reference: Live Trading Setup

This is a quick reference guide for the three main tasks required to enable live trading with NDAX.

## Task 1: Add NDAX API Credentials to .env File

### Quick Steps:

1. **Get your NDAX API credentials:**
   - Log in to [NDAX.io](https://ndax.io)
   - Go to Settings → API Management
   - Create new API key (enable View + Trade permissions)
   - Copy: API Key, API Secret, User ID, Account ID

2. **Update .env file:**
   ```bash
   # Copy example if needed
   cp .env.example .env
   
   # Edit .env file
   nano .env  # or use your preferred editor
   ```

3. **Add credentials to .env:**
   ```bash
   NDAX_API_KEY=your_actual_api_key_here
   NDAX_API_SECRET=your_actual_api_secret_here
   NDAX_USER_ID=your_user_id_here
   NDAX_ACCOUNT_ID=your_account_id_here
   ```

4. **Keep live trading disabled for now:**
   ```bash
   USE_LIVE_TRADING=false
   ```

5. **Verify .env is not tracked by git:**
   ```bash
   grep "^\.env$" .gitignore
   # Should show: .env
   ```

✅ **Task 1 Complete** - Your credentials are configured but not yet active.

---

## Task 2: Replace Mock Client with Live NDAX Client

### Quick Steps:

1. **Open main.py:**
   ```bash
   nano main.py  # or use your preferred editor
   ```

2. **Uncomment the import (around line 8):**
   
   **BEFORE:**
   ```python
   # from platform.ndax_live import NDAXLiveClient
   ```
   
   **AFTER:**
   ```python
   from platform.ndax_live import NDAXLiveClient
   ```

3. **Update client initialization in main() function (around line 35):**
   
   **BEFORE:**
   ```python
   if use_live:
       print("⚠️  WARNING: Live trading mode requested")
       # ... warnings ...
       client = NDAXTestClient()
   else:
       client = NDAXTestClient()
   ```
   
   **AFTER:**
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

4. **Save the file**

✅ **Task 2 Complete** - Live client is ready (but not active until USE_LIVE_TRADING=true)

---

## Task 3: Implement Real Chimera Strategy

### Quick Steps:

1. **Open strategy/chimera_core.py:**
   ```bash
   nano strategy/chimera_core.py
   ```

2. **Replace the placeholder with your strategy:**

   **CURRENT (Placeholder):**
   ```python
   def decide(market_state):
       # Placeholder logic
       return "BUY"  # Always returns BUY for testing
   ```

   **EXAMPLE (Simple strategy):**
   ```python
   def decide(market_state):
       import logging
       logger = logging.getLogger(__name__)
       
       price = market_state.get("price", 0)
       
       # Example: Simple price-based strategy
       if price < 45000:
           logger.info(f"BUY signal: Price {price} below 45000")
           return "BUY"
       elif price > 55000:
           logger.info(f"SELL signal: Price {price} above 55000")
           return "SELL"
       else:
           logger.info(f"HOLD signal: Price {price} in range")
           return "HOLD"
   ```

   **YOUR STRATEGY:** Replace with your actual trading logic using:
   - Technical indicators (SMA, RSI, MACD, Bollinger Bands)
   - Machine learning models
   - Quantum algorithms
   - Multi-indicator combinations
   - Your proprietary trading logic

3. **Add proper logging:**
   ```python
   import logging
   logger = logging.getLogger(__name__)
   
   def decide(market_state):
       # Log all decisions
       logger.info(f"Analyzing market state: {market_state}")
       
       # Your strategy logic here
       signal = calculate_signal(market_state)
       
       logger.info(f"Decision: {signal}")
       return signal
   ```

4. **Save the file**

✅ **Task 3 Complete** - Your real trading strategy is implemented.

---

## Testing Your Setup

### Test in Paper Trading Mode First:

```bash
# Ensure live trading is disabled
grep USE_LIVE_TRADING .env
# Should show: USE_LIVE_TRADING=false

# Run the bot
python main.py

# Monitor output for:
# - Correct signal generation
# - No errors or exceptions
# - Expected behavior
```

### Run Paper Trading for 1-2 Weeks:

Monitor these metrics:
- Win rate (target: >60%)
- Average profit per trade
- Maximum drawdown
- Number of trades per day

### Enable Live Trading (Only After Successful Paper Trading):

```bash
# Edit .env
nano .env

# Change this line:
USE_LIVE_TRADING=true

# Start with SMALL position sizes!
MAX_POSITION_SIZE=100
MAX_DAILY_LOSS=50

# Run the bot
python main.py

# ACTIVELY MONITOR the first live trades!
```

---

## Complete Implementation Checklist

- [ ] **Task 1: Add NDAX API credentials**
  - [ ] Got API credentials from NDAX.io
  - [ ] Added to .env file
  - [ ] Verified .env is in .gitignore
  - [ ] Kept USE_LIVE_TRADING=false

- [ ] **Task 2: Replace mock client**
  - [ ] Uncommented NDAXLiveClient import
  - [ ] Updated client initialization in main()
  - [ ] Tested that code runs without errors

- [ ] **Task 3: Implement strategy**
  - [ ] Replaced placeholder logic in chimera_core.py
  - [ ] Added your actual trading strategy
  - [ ] Included logging and error handling
  - [ ] Tested strategy logic with sample data

- [ ] **Testing (CRITICAL - DO NOT SKIP)**
  - [ ] Ran paper trading for 1-2 weeks minimum
  - [ ] Achieved >60% win rate consistently
  - [ ] Verified risk management works
  - [ ] No errors or exceptions in logs
  - [ ] Ready for small live trades

- [ ] **Live Trading (Only after successful testing)**
  - [ ] Set USE_LIVE_TRADING=true
  - [ ] Started with small position sizes
  - [ ] Actively monitoring first trades
  - [ ] Ready to stop if issues arise

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `.env` | Your API credentials and configuration (NOT committed to git) |
| `main.py` | Main bot runner - update client initialization here |
| `strategy/chimera_core.py` | Your trading strategy logic - implement decide() here |
| `platform/ndax_live.py` | Live NDAX client - implement API calls here (if needed) |
| `platform/ndax_test.py` | Test client for paper trading |
| `LIVE_TRADING_SETUP_GUIDE.md` | Comprehensive setup guide with detailed instructions |
| `NDAX_TRADING_SETUP.md` | NDAX-specific setup and configuration guide |

---

## Emergency Stop

If anything goes wrong during live trading:

1. **Stop the bot:** Press `Ctrl+C`
2. **Cancel orders:** Log in to NDAX web interface
3. **Disable live trading:**
   ```bash
   nano .env
   # Change: USE_LIVE_TRADING=false
   ```
4. **Review logs:** Check what went wrong
5. **Return to paper trading:** Test fixes thoroughly

---

## Need Help?

- **Detailed Guide:** See `LIVE_TRADING_SETUP_GUIDE.md`
- **NDAX Setup:** See `NDAX_TRADING_SETUP.md`
- **API Reference:** See `NDAX_API_REFERENCE.md`
- **Strategy Help:** See comments in `strategy/chimera_core.py`

---

**⚠️ REMEMBER:** Live trading uses REAL MONEY. Always test thoroughly in paper trading mode first. Start with small amounts. Never risk more than you can afford to lose.

---

**Last Updated:** December 2024  
**Version:** 2.1.0
