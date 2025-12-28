"""
Promotion module for managing paper-to-live trading progression
Tracks performance metrics and determines eligibility for live trading
"""

from datetime import datetime
from config import PROMOTION, RISK_LIMITS, ALLOW_LIVE
import config


# Global stats tracking
START_TIME = datetime.now()
stats = {
    "paper_trades": 0,
    "wins": 0,
    "losses": 0,
    "drawdown": 0.0,
    "daily_pnl": 0.0,
    "trades_last_hour": 0
}


def win_rate():
    """
    Calculates the current win rate
    
    Returns:
        float: Win rate as a decimal (0.0 to 1.0)
    """
    total = stats["wins"] + stats["losses"]
    return stats["wins"] / total if total > 0 else 0


def can_promote():
    """
    Checks if paper trading performance meets promotion criteria
    
    Returns:
        bool: True if all promotion criteria are met
    """
    runtime = (datetime.now() - START_TIME).total_seconds() / 60
    return all([
        runtime >= PROMOTION["min_minutes"],
        stats["paper_trades"] >= PROMOTION["min_trades"],
        win_rate() >= PROMOTION["min_win_rate"],
        stats["drawdown"] <= RISK_LIMITS["hard_stop_loss"]
    ])


def check_promotion():
    """
    Checks promotion criteria and upgrades MODE if eligible
    Requires ALLOW_LIVE to be True for safety
    """
    if config.MODE == "PAPER" and can_promote() and ALLOW_LIVE:
        config.MODE = "LIVE_LIMITED"
        print("⚡ PROMOTION TRIGGERED: LIVE_LIMITED MODE ENABLED")
        print(f"   Runtime: {(datetime.now() - START_TIME).total_seconds() / 60:.1f} min")
        print(f"   Paper trades: {stats['paper_trades']}")
        print(f"   Win rate: {win_rate():.1%}")


def record_trade(outcome, pnl=0.0):
    """
    Records a trade outcome and updates statistics
    
    Args:
        outcome: "win" or "loss"
        pnl: Profit/loss amount (optional)
    """
    stats["paper_trades"] += 1
    
    if outcome == "win":
        stats["wins"] += 1
    elif outcome == "loss":
        stats["losses"] += 1
    
    if pnl != 0:
        stats["daily_pnl"] += pnl


def get_stats():
    """
    Returns a copy of current trading statistics
    
    Returns:
        dict: Current stats dictionary
    """
    return stats.copy()


def reset_hourly_counter():
    """
    Resets the hourly trade counter
    Should be called every hour
    """
    stats["trades_last_hour"] = 0
