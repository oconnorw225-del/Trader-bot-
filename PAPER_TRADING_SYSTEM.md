# NDAX Paper/Live Trading Mode System

## Overview

This is a Python-based trading system for the NDAX Quantum Engine with comprehensive paper trading support, risk management, and safety controls. The system implements a modular architecture with clear separation of concerns between configuration, execution, platform integration, strategy, and reporting.

## Architecture

```
config.py              # Configuration: MODE, RISK_LIMITS, PROMOTION, ALLOW_LIVE
├── platform/          # Exchange platform integrations
│   └── ndax_test.py   # NDAX test client for paper trading
├── execution/         # Trade execution and risk management
│   ├── governor.py    # Risk checks and position sizing
│   └── executor.py    # Trade execution across modes
├── strategy/          # Trading strategies
│   └── chimera_core.py # Core decision logic
├── reporting/         # Performance reporting
│   └── hourly.py      # Hourly reports
└── main.py            # Main bot runner
```

## Features

### Trading Modes
- **PAPER**: Simulated trading with no real orders (default)
- **LIVE_LIMITED**: Live trading with enforced risk limits (requires `ALLOW_LIVE = True`)
- **HALTED**: All trading stopped

### Risk Management
- **Capital Cap**: Uses max 50% of total capital
- **Position Sizing**: Max 5% of usable capital per position
- **Trade Frequency**: Max 100 trades per hour
- **Hard Stop Loss**: Halts at 30% drawdown
- **Daily Loss Limit**: Max 50% daily loss
- **Kill Switch**: Emergency shutdown capability

### Promotion Criteria (PAPER → LIVE_LIMITED)
To promote from paper to live trading, the system must achieve:
- Minimum 60 minutes runtime
- Minimum 30 trades executed
- Minimum 70% win rate

## Installation

No additional dependencies required beyond the main project requirements.

## Usage

### Running the Bot

```bash
# Run in PAPER mode (default)
python3 main.py
```

The bot will:
1. Initialize the NDAX test client
2. Print platform information
3. Enter the main trading loop
4. Execute trades every 60 seconds based on strategy signals
5. Apply risk checks before each trade

### Switching to Live Trading

**WARNING: Only enable live trading after thorough testing!**

To enable live trading:

1. Edit `config.py`:
   ```python
   MODE = "LIVE_LIMITED"
   ALLOW_LIVE = True  # 🔒 manually enable
   ```

2. Ensure promotion criteria are met
3. Configure live NDAX API credentials in your environment
4. Run the bot

### Halting Trading

To stop all trading:

```python
# In config.py
MODE = "HALTED"
```

## Configuration

### Risk Limits (`config.py`)

Adjust risk limits according to your risk tolerance:

```python
RISK_LIMITS = {
    "capital_cap": 0.50,           # 0-1: Fraction of capital to use
    "max_position": 0.05,          # 0-1: Max position size per trade
    "max_trades_per_hour": 100,    # Integer: Rate limit
    "hard_stop_loss": 0.30,        # 0-1: Drawdown kill switch
    "max_daily_loss": 0.50,        # 0-1: Daily loss limit
    "kill_switch": True            # Boolean: Enable emergency stop
}
```

## Testing

Run the test suite:

```bash
python3 tests/python/test_trading_system.py
```

This tests:
- Configuration module
- NDAX test client
- Risk management (governor)
- Trade execution
- Strategy decisions
- Reporting functions

## Safety Features

1. **ALLOW_LIVE Lock**: Must be manually enabled for live trading
2. **Multi-Layer Risk Checks**: Every trade passes through risk validation
3. **Mode Separation**: Clear distinction between PAPER and LIVE modes
4. **Kill Switch**: Emergency halt capability
5. **Rate Limiting**: Prevents runaway trading

## Module Documentation

### config.py
Central configuration for trading modes, risk limits, and promotion criteria.

### platform/ndax_test.py
Mock NDAX client for paper trading. Returns simulated market data and balances.

### execution/governor.py
Risk management module. Performs comprehensive checks on:
- Drawdown levels
- Daily P&L
- Trade frequency
- Position sizing

### execution/executor.py
Trade execution dispatcher. Routes trades to appropriate handlers based on MODE:
- PAPER: Simulated execution with console output
- LIVE_LIMITED: Real execution with risk controls
- HALTED: No execution

### strategy/chimera_core.py
Core trading strategy. Currently returns simple signals; in production would contain advanced ML/quantum algorithms.

### reporting/hourly.py
Performance reporting. Generates periodic snapshots of trading state.

### main.py
Main bot orchestrator. Manages the trading loop and coordinates all modules.

## Expected Output

### Paper Mode
```
Platform: {'exchange': 'NDAX', 'mode': 'TEST', 'pairs': ['BTC/CAD', 'ETH/CAD'], 'rate_limit': 'safe'}
[PAPER] BUY 250.0 @ 50000.0
[PAPER] BUY 250.0 @ 50000.0
...
```

### Live Mode (when enabled)
```
Platform: {'exchange': 'NDAX', 'mode': 'LIVE', ...}
[LIVE] BUY 250.0 @ 50000.0
```

## Troubleshooting

### Bot doesn't trade
- Check MODE setting in config.py
- Verify risk checks are passing (check drawdown, daily_pnl, trades_last_hour)
- Ensure strategy is returning valid signals

### Live trading not working
- Verify ALLOW_LIVE = True in config.py
- Confirm MODE = "LIVE_LIMITED"
- Check NDAX API credentials are configured

### Risk checks failing
- Review current state values (drawdown, daily_pnl, trades_last_hour)
- Adjust RISK_LIMITS if needed
- Wait for conditions to improve

## Future Enhancements

- [ ] Add actual NDAX live API integration
- [ ] Implement advanced Chimera strategy logic
- [ ] Add database persistence for trades and metrics
- [ ] Create web dashboard for monitoring
- [ ] Add email/SMS alerts for important events
- [ ] Implement backtesting framework
- [ ] Add more exchange platform connectors

## License

MIT License - See main project LICENSE file

## Contributing

This module is part of the NDAX Quantum Engine project. Follow the main project's contribution guidelines.
