"""
Configuration module for NDAX Quantum Engine Trading System
Contains MODE settings, risk limits, and promotion criteria
"""

# Trading mode: PAPER (simulation), LIVE_LIMITED (live with limits), HALTED (no trading)
MODE = "PAPER"   # PAPER | LIVE_LIMITED | HALTED

# Risk management limits
RISK_LIMITS = {
    "capital_cap": 0.50,           # Use max 50% of total capital
    "max_position": 0.05,          # Max 5% of usable capital per position
    "max_trades_per_hour": 100,    # Maximum trades allowed per hour
    "hard_stop_loss": 0.30,        # Hard stop at 30% drawdown
    "max_daily_loss": 0.50,        # Max 50% daily loss allowed
    "kill_switch": True            # Enable emergency kill switch
}

# Promotion criteria from PAPER to LIVE_LIMITED
PROMOTION = {
    "min_minutes": 60,             # Minimum runtime in minutes
    "min_trades": 30,              # Minimum number of trades
    "min_win_rate": 0.70           # Minimum 70% win rate required
}

# Safety lock - must be manually enabled for live trading
ALLOW_LIVE = False  # 🔒 must be manually flipped
