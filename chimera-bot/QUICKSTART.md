# Chimera-Bot Quick Start Guide

Get up and running with Chimera-Bot in under 5 minutes!

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

```bash
cd chimera-bot
pip install -r requirements.txt
```

## Quick Test Run (Paper Trading)

The safest way to test the system:

```bash
# Run in paper trading mode (default)
python main.py
```

Expected output:
```
============================================================
CHIMERA-BOT Starting
============================================================
ChimeraCore strategy initialized
Governor initialized with risk level: moderate
NDAX Test Platform initialized (PAPER TRADING)
Executor initialized in paper mode
Hourly Reporter initialized (interval: 3600s)
ChimeraBot initialized in TradingMode.PAPER mode
...
✅ Execution cycle completed successfully
============================================================
CHIMERA-BOT Finished
============================================================
```

## Configuration

### Environment Variables

Create a `.env` file in the project root or set these environment variables:

```bash
# Trading Configuration
TRADING_MODE=paper          # Options: paper, live, test
RISK_LEVEL=moderate         # Options: conservative, moderate, aggressive

# Risk Parameters (optional, defaults provided)
MAX_POSITION_SIZE=0.1       # 10% of portfolio
MAX_DAILY_LOSS=0.05         # 5% daily loss limit
MAX_OPEN_POSITIONS=5
MAX_TRADES_PER_DAY=20

# Platform
PLATFORM=ndax
TESTNET=true

# API Credentials (only required for LIVE mode)
NDAX_API_KEY=your_api_key
NDAX_API_SECRET=your_api_secret
NDAX_USER_ID=your_user_id
NDAX_ACCOUNT_ID=your_account_id

# Reporting
REPORTING_INTERVAL=3600     # 1 hour
LOG_LEVEL=INFO
```

### Risk Levels Explained

**Conservative** (Safest)
- Small position sizes (5% max)
- Tight stop losses (1%)
- Low daily loss limit (2%)
- Fewer trades (max 10/day)

**Moderate** (Balanced - Default)
- Medium position sizes (10% max)
- Moderate stop losses (2%)
- Reasonable daily loss limit (5%)
- Moderate trading (max 20/day)

**Aggressive** (Highest Risk)
- Large position sizes (20% max)
- Wider stop losses (3%)
- Higher daily loss limit (10%)
- More frequent trading (max 50/day)

## Running Different Modes

### Paper Trading (Recommended for Testing)

```bash
export TRADING_MODE=paper
python main.py
```

Features:
- ✅ No real money at risk
- ✅ Simulated market execution
- ✅ Starting balance: $10,000
- ✅ Full feature testing

### Test Mode

```bash
export TRADING_MODE=test
python main.py
```

Features:
- Development and debugging
- Mock data
- Faster execution

### Live Trading (⚠️ Real Money)

**WARNING: Only use after thorough testing in paper mode!**

1. Set environment variables:
```bash
export TRADING_MODE=live
export NDAX_API_KEY=your_key
export NDAX_API_SECRET=your_secret
export NDAX_USER_ID=your_user_id
export NDAX_ACCOUNT_ID=your_account_id
```

2. Edit `platforms/ndax_live.py` to disable safety lock:
```python
class NDAXLive:
    SAFETY_LOCK = False  # Change from True to False
```

3. Run with extra caution:
```bash
python main.py
```

## Customizing Your Strategy

Replace the placeholder logic in `strategy/chimera_core.py`:

```python
def generate_signal(self) -> Dict[str, Any]:
    # Add your analysis here
    # - Fetch real market data
    # - Run technical indicators
    # - Apply your algorithms
    
    return {
        'symbol': 'BTC/USD',
        'action': 'buy',  # or 'sell'
        'price': current_price,
        'confidence': 0.85,  # 0-1 scale
        'position_size': 0.1,
        'reason': 'Your reasoning'
    }
```

## Viewing Reports

Reports are saved in the `reports/` directory:

```bash
# View latest report
cat reports/latest_report.json

# View all reports
ls -lh reports/
```

Report includes:
- Trade summary (total, successful, failed)
- Performance metrics (P&L, win rate, profit factor)
- Individual trade details

## Monitoring

### Check Bot Status

```python
from chimera-bot import ChimeraBot, Config

config = Config.from_env()
bot = ChimeraBot(config)

# Get current status
status = bot.status()
print(status)
```

### View Logs

```bash
# Follow real-time logs
tail -f chimera-bot.log

# View recent logs
tail -100 chimera-bot.log
```

### Check Governor Stats

The governor tracks your trading activity:

```python
stats = bot.governor.get_stats()
print(f"Trades today: {stats['daily_trades']}/{stats['trades_remaining']}")
print(f"Open positions: {stats['open_positions']}")
```

## Troubleshooting

### Import Errors

```bash
# Ensure you're in the chimera-bot directory
cd chimera-bot
pip install -r requirements.txt
```

### Configuration Errors

```bash
# Test configuration validity
python -c "from config import Config; c = Config.from_env(); c.validate(); print('✅ Config valid')"
```

### Permission Errors (Live Mode)

If you get "Safety lock enabled" errors in live mode:
- Verify API credentials are set
- Confirm you've disabled SAFETY_LOCK in `platforms/ndax_live.py`
- Understand that live mode uses real money

## Testing Your Setup

Run this comprehensive test:

```bash
python3 -c "
import sys
import os
sys.path.insert(0, '.')

os.environ['TRADING_MODE'] = 'paper'
os.environ['RISK_LEVEL'] = 'moderate'

from config import Config
from strategy.chimera_core import ChimeraCore
from execution.governor import Governor

config = Config.from_env()
strategy = ChimeraCore(config)
governor = Governor(config)

signal = strategy.generate_signal()
print(f'✅ Strategy generated signal: {signal[\"action\"]} {signal[\"symbol\"]}')

risk_check = governor.evaluate(signal)
print(f'✅ Governor evaluated: {\"APPROVED\" if risk_check[\"approved\"] else \"REJECTED\"}')

print('\\n🎉 All tests passed! System is ready.')
"
```

## Next Steps

1. **Test in Paper Mode**: Run multiple cycles to understand behavior
2. **Monitor Reports**: Check `reports/` directory for performance data
3. **Customize Strategy**: Implement your trading logic in `strategy/chimera_core.py`
4. **Adjust Risk**: Fine-tune risk parameters in `.env`
5. **Review Logs**: Check `chimera-bot.log` for detailed execution info

## Getting Help

- Read the full [README.md](README.md) for comprehensive documentation
- Review code comments in each module
- Check logs for error messages: `tail -f chimera-bot.log`

## Safety Reminders

- ✅ Start with paper trading
- ✅ Test thoroughly before going live
- ✅ Understand all risk parameters
- ✅ Monitor regularly
- ✅ Never trade with money you can't afford to lose
- ✅ Keep SAFETY_LOCK enabled until you're absolutely ready

---

**Ready to start trading? Run:**
```bash
python main.py
```

Good luck! 🚀
