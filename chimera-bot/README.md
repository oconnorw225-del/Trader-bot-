# Chimera-Bot Modular Architecture

A modular, production-ready trading bot with comprehensive risk management and routing capabilities.

## 📁 Directory Structure

```
chimera-bot/
│
├── main.py                # Entry point - orchestrates all components
├── config.py              # Risk + mode configuration
├── execution/
│   ├── governor.py        # Risk wrapper (safety rules)
│   ├── executor.py        # Live/paper routing
│   └── __init__.py
│
├── platforms/
│   ├── ndax_test.py       # Test paths / platform info
│   ├── ndax_live.py       # Live paths (locked for safety)
│   └── __init__.py
│
├── strategy/
│   ├── chimera_core.py    # Core strategy logic (customizable)
│   └── __init__.py
│
├── reporting/
│   ├── hourly.py          # Periodic reporting and analytics
│   └── __init__.py
│
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
cd chimera-bot
pip install -r requirements.txt
```

### Configuration

Set environment variables or create a `.env` file in the project root:

```bash
# Trading mode (paper, live, test)
TRADING_MODE=paper

# Risk level (conservative, moderate, aggressive)
RISK_LEVEL=moderate

# Position limits
MAX_POSITION_SIZE=0.1
MAX_DAILY_LOSS=0.05
MAX_OPEN_POSITIONS=5
MAX_TRADES_PER_DAY=20

# Platform
PLATFORM=ndax
TESTNET=true

# API Credentials (required for live mode)
NDAX_API_KEY=your_api_key
NDAX_API_SECRET=your_api_secret
NDAX_USER_ID=your_user_id
NDAX_ACCOUNT_ID=your_account_id

# Reporting
REPORTING_INTERVAL=3600
LOG_LEVEL=INFO
```

### Running the Bot

```bash
# Run in paper trading mode (safe)
python main.py

# Or run as a module
python -m chimera-bot.main
```

## 🛡️ Safety Features

### Risk Management (Governor)

The Governor enforces multiple layers of safety:

- **Daily Trade Limit**: Prevents excessive trading
- **Daily Loss Limit**: Stops trading if losses exceed threshold
- **Position Limits**: Controls maximum open positions
- **Position Size Limits**: Caps individual trade sizes
- **Signal Quality Checks**: Filters low-confidence signals

### Trading Modes

1. **Paper Trading** (Default)
   - Safe simulation mode
   - No real money at risk
   - Perfect for testing and development
   - Uses `ndax_test.py` platform

2. **Live Trading** (Locked)
   - 🔒 Real money trading
   - Requires explicit safety lock removal
   - Requires valid API credentials
   - Uses `ndax_live.py` platform
   - Rate limiting enforced

3. **Test Mode**
   - Development and testing
   - Mock data and execution

### Risk Levels

**Conservative**
- Max position: 5% of portfolio
- Max daily loss: 2%
- Stop loss: 1%
- Max open positions: 3
- Max trades/day: 10

**Moderate** (Default)
- Max position: 10% of portfolio
- Max daily loss: 5%
- Stop loss: 2%
- Max open positions: 5
- Max trades/day: 20

**Aggressive**
- Max position: 20% of portfolio
- Max daily loss: 10%
- Stop loss: 3%
- Max open positions: 10
- Max trades/day: 50

## 📊 Components

### Main Entry Point (`main.py`)

Orchestrates all components:
1. Loads configuration
2. Initializes strategy, governor, executor, reporter
3. Runs execution cycle
4. Handles errors and logging

### Configuration (`config.py`)

- Defines trading modes and risk levels
- Loads settings from environment
- Validates configuration
- Provides risk parameter presets

### Execution Layer

**Governor (`execution/governor.py`)**
- Evaluates every trading signal
- Enforces risk rules
- Tracks daily metrics
- Approves/rejects trades

**Executor (`execution/executor.py`)**
- Routes trades to appropriate platform
- Handles order execution
- Manages positions and balances
- Provides execution history

### Platform Layer

**Test Platform (`platforms/ndax_test.py`)**
- Paper trading simulation
- Mock order execution
- Simulated market data
- Safe for development

**Live Platform (`platforms/ndax_live.py`)**
- 🔒 Real NDAX exchange integration
- SAFETY_LOCK must be disabled
- Real order execution
- Rate limiting
- Full API integration

### Strategy Layer

**Chimera Core (`strategy/chimera_core.py`)**
- Your existing strategy logic
- Generates trading signals
- Technical analysis (placeholder)
- Quantum algorithms (placeholder)
- **Customizable** - replace with your logic

### Reporting Layer

**Hourly Reporter (`reporting/hourly.py`)**
- Periodic report generation
- Performance metrics
- Trade logging
- Export capabilities

## 🔧 Customization

### Implementing Your Strategy

Replace the placeholder logic in `strategy/chimera_core.py`:

```python
class ChimeraCore:
    def generate_signal(self) -> Dict[str, Any]:
        # Your analysis logic here
        
        return {
            'symbol': 'BTC/USD',
            'action': 'buy',  # or 'sell'
            'price': current_price,
            'confidence': 0.85,
            'position_size': 0.1,
            'reason': 'Your reasoning'
        }
```

### Adding New Platforms

Create a new platform connector in `platforms/`:

```python
class NewExchange:
    def place_order(self, order: Dict) -> Dict:
        # Implementation
        pass
    
    def cancel_order(self, order_id: str) -> Dict:
        # Implementation
        pass
    
    # ... other methods
```

## 📈 Usage Examples

### Basic Usage

```python
from chimera-bot import ChimeraBot, Config

# Load configuration
config = Config.from_env()

# Initialize bot
bot = ChimeraBot(config)

# Check status
status = bot.status()
print(status)

# Run execution cycle
result = bot.run()
print(result)
```

### Custom Configuration

```python
from chimera-bot import Config, TradingMode, RiskLevel

config = Config(
    mode=TradingMode.PAPER,
    risk_level=RiskLevel.CONSERVATIVE,
    max_position_size=0.05,
    max_daily_loss=0.02
)

bot = ChimeraBot(config)
```

## 🔒 Enabling Live Trading

**⚠️ WARNING: Live trading uses real money. Only enable if you understand the risks.**

1. Verify all risk parameters
2. Confirm API credentials are correct
3. Test thoroughly in paper mode first
4. Edit `platforms/ndax_live.py`:

```python
class NDAXLive:
    # Change this to False to enable live trading
    SAFETY_LOCK = False
```

5. Set environment: `TRADING_MODE=live`
6. Run with caution

## 📝 Logging

Logs are saved to `chimera-bot.log` and stdout.

View logs:
```bash
tail -f chimera-bot.log
```

## 📊 Reports

Reports are saved in the `reports/` directory:

- `report_YYYYMMDD_HHMMSS.json` - Timestamped reports
- `latest_report.json` - Most recent report

## 🧪 Testing

```bash
# Test configuration
python -c "from config import Config; c = Config.from_env(); c.validate(); print('✅ Config valid')"

# Test imports
python -c "from chimera-bot import ChimeraBot, Config; print('✅ Imports working')"

# Dry run
python main.py
```

## 🔍 Monitoring

Check bot status:
```python
status = bot.status()
# Returns: mode, risk_level, executor_status, reporter_status
```

Check governor stats:
```python
stats = bot.governor.get_stats()
# Returns: daily_trades, daily_loss, open_positions, etc.
```

## 🛠️ Troubleshooting

**Import Errors**
```bash
pip install -r requirements.txt
```

**Permission Errors (Live Mode)**
- Safety lock is enabled by default
- Follow instructions in "Enabling Live Trading" section

**Configuration Errors**
- Check environment variables
- Validate with `config.validate()`

## 📚 Additional Resources

- [NDAX API Documentation](https://ndaxlo.github.io/API/)
- Main repository README for full system documentation
- `.env.example` for configuration template

## 🔐 Security

- Never commit `.env` files or API keys
- Keep `SAFETY_LOCK = True` unless actively live trading
- Monitor daily loss limits
- Use testnet for development
- Regularly review execution logs

## 📄 License

Part of the NDAX Quantum Engine project.
See main repository for license information.

---

**Last Updated**: 2025-12-28
