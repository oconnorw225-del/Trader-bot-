"""
Configuration module for NDAX Quantum Engine Trading System
Contains MODE settings, risk limits, and promotion criteria
"""

import os

# Trading mode: PAPER (simulation), LIVE_LIMITED (live with limits), HALTED (no trading)
MODE = os.getenv("BOT_MODE", "PAPER")   # PAPER | LIVE_LIMITED | HALTED

# Risk management limits
RISK_LIMITS = {
    "capital_cap": float(os.getenv("CAPITAL_CAP", 0.5)),           # Use max 50% of total capital
    "max_position": float(os.getenv("MAX_POSITION", 0.05)),        # Max 5% of usable capital per position
    "max_trades_per_hour": int(os.getenv("MAX_TRADES_HOUR", 100)), # Maximum trades allowed per hour
    "hard_stop_loss": float(os.getenv("HARD_STOP_LOSS", 0.30)),    # Hard stop at 30% drawdown
    "max_daily_loss": float(os.getenv("MAX_DAILY_LOSS", 0.50)),    # Max 50% daily loss allowed
    "kill_switch": True                                             # Enable emergency kill switch
}

# Promotion criteria from PAPER to LIVE_LIMITED
PROMOTION = {
    "min_minutes": int(os.getenv("MIN_PAPER_MINUTES", 15)),        # Minimum runtime in minutes (reduced to 15)
    "min_trades": int(os.getenv("MIN_PAPER_TRADES", 8)),           # Minimum number of trades (adjusted for 15min)
    "min_win_rate": float(os.getenv("MIN_PAPER_WINRATE", 0.70)),   # Minimum 70% win rate required
    "skip_after_good_runs": int(os.getenv("SKIP_PAPER_AFTER", 3)) # Skip paper after N consecutive good live runs
}

# Demotion criteria from LIVE_LIMITED back to PAPER
DEMOTION = {
    "min_live_minutes": int(os.getenv("MIN_LIVE_MINUTES", 60)),    # Check performance after 60 min live
    "min_win_rate": float(os.getenv("DEMOTION_WINRATE", 0.60)),    # Demote if win rate drops below 60%
    "retraining_minutes": int(os.getenv("RETRAINING_MINUTES", 15)),# 15 min paper mode for retraining (reduced)
    "good_run_threshold": float(os.getenv("GOOD_RUN_THRESHOLD", 0.75)) # 75% win rate considered "good"
}

# Platform prioritization configuration
PLATFORM_PRIORITY = {
    "enabled": os.getenv("PLATFORM_PRIORITY_ENABLED", "True") == "True",
    "recalculate_hours": int(os.getenv("PRIORITY_RECALC_HOURS", 4)),  # Recalculate priority every 4 hours
    "top_allocation": float(os.getenv("TOP_ALLOCATION", 0.60)),        # 60% to top performer
    "second_allocation": float(os.getenv("SECOND_ALLOCATION", 0.30)),  # 30% to second
    "explore_allocation": float(os.getenv("EXPLORE_ALLOCATION", 0.10)) # 10% to exploration
}

# Safety lock - must be manually enabled for live trading
ALLOW_LIVE = os.getenv("ALLOW_LIVE", "False") == "True"  # 🔒 must be manually flipped
