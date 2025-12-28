"""
Promotion module for managing paper-to-live trading progression
Tracks performance metrics and determines eligibility for live trading
Includes adaptive demotion system for performance-based mode switching
"""

from datetime import datetime
from config import PROMOTION, DEMOTION, RISK_LIMITS, ALLOW_LIVE
import config


# Global stats tracking
START_TIME = datetime.now()
LIVE_START_TIME = None  # Track when live trading started
RETRAINING_START_TIME = None  # Track when retraining period started

stats = {
    "paper_trades": 0,
    "wins": 0,
    "losses": 0,
    "drawdown": 0.0,
    "daily_pnl": 0.0,
    "trades_last_hour": 0,
    "live_trades": 0,
    "live_wins": 0,
    "live_losses": 0,
    "mode_switches": 0,
    "consecutive_good_runs": 0,  # Track consecutive successful live sessions
    "current_session_start": None,  # Track current session performance
    "can_skip_paper": False  # Flag indicating if paper mode can be skipped
}


def win_rate():
    """
    Calculates the current win rate
    
    Returns:
        float: Win rate as a decimal (0.0 to 1.0)
    """
    total = stats["wins"] + stats["losses"]
    return stats["wins"] / total if total > 0 else 0


def live_win_rate():
    """
    Calculates the win rate during live trading
    
    Returns:
        float: Live win rate as a decimal (0.0 to 1.0)
    """
    total = stats["live_wins"] + stats["live_losses"]
    return stats["live_wins"] / total if total > 0 else 0


def can_promote():
    """
    Checks if paper trading performance meets promotion criteria
    Implements adaptive paper trading skip after consecutive good runs
    
    Returns:
        bool: True if all promotion criteria are met
    """
    global RETRAINING_START_TIME
    
    # Check if we can skip paper trading entirely (after 3+ consecutive good runs)
    if stats["consecutive_good_runs"] >= PROMOTION["skip_after_good_runs"]:
        stats["can_skip_paper"] = True
        # Instant promotion - no paper trading needed
        return True
    
    # If in retraining period, check if retraining is complete
    if RETRAINING_START_TIME is not None:
        retraining_duration = (datetime.now() - RETRAINING_START_TIME).total_seconds() / 60
        if retraining_duration < DEMOTION["retraining_minutes"]:
            return False  # Still in retraining period
        else:
            # Retraining complete, reset timer
            RETRAINING_START_TIME = None
    
    runtime = (datetime.now() - START_TIME).total_seconds() / 60
    return all([
        runtime >= PROMOTION["min_minutes"],
        stats["paper_trades"] >= PROMOTION["min_trades"],
        win_rate() >= PROMOTION["min_win_rate"],
        stats["drawdown"] <= RISK_LIMITS["hard_stop_loss"]
    ])


def should_demote():
    """
    Checks if live trading performance requires demotion back to PAPER
    
    Returns:
        bool: True if performance has degraded and demotion is needed
    """
    global LIVE_START_TIME
    
    if LIVE_START_TIME is None:
        return False
    
    live_duration = (datetime.now() - LIVE_START_TIME).total_seconds() / 60
    
    # Check performance after minimum live trading period
    if live_duration < DEMOTION["min_live_minutes"]:
        return False
    
    # Demote if win rate drops below threshold
    current_live_win_rate = live_win_rate()
    if current_live_win_rate < DEMOTION["min_win_rate"]:
        return True
    
    # Demote if drawdown exceeds limits
    if stats["drawdown"] >= RISK_LIMITS["hard_stop_loss"]:
        return True
    
    return False


def check_promotion():
    """
    Checks promotion criteria and upgrades MODE if eligible
    Requires ALLOW_LIVE to be True for safety
    Implements adaptive promotion with paper skip after good runs
    """
    global LIVE_START_TIME
    
    if config.MODE == "PAPER" and can_promote() and ALLOW_LIVE:
        config.MODE = "LIVE_LIMITED"
        LIVE_START_TIME = datetime.now()
        stats["mode_switches"] += 1
        stats["current_session_start"] = datetime.now()
        
        print("\n" + "="*60)
        if stats["can_skip_paper"]:
            print("🚀 INSTANT PROMOTION: PAPER SKIPPED (Proven Strategy)")
            print("="*60)
            print(f"   Consecutive good runs: {stats['consecutive_good_runs']}")
            print(f"   Paper trading: SKIPPED")
        else:
            print("⚡ PROMOTION TRIGGERED: LIVE_LIMITED MODE ENABLED")
            print("="*60)
            print(f"   Paper runtime: {(datetime.now() - START_TIME).total_seconds() / 60:.1f} min")
            print(f"   Paper trades: {stats['paper_trades']}")
            print(f"   Paper win rate: {win_rate():.1%}")
        print(f"   Mode switches: {stats['mode_switches']}")
        print("="*60 + "\n")
        
        # Reset skip flag after use
        stats["can_skip_paper"] = False


def check_demotion():
    """
    Checks if live trading performance warrants demotion back to PAPER
    Implements adaptive learning by returning to paper mode for strategy adjustment
    Tracks consecutive good runs for paper trading optimization
    """
    global LIVE_START_TIME, RETRAINING_START_TIME, START_TIME
    
    if config.MODE == "LIVE_LIMITED":
        # Check if session ended successfully (good performance)
        if LIVE_START_TIME and stats["current_session_start"]:
            session_duration = (datetime.now() - stats["current_session_start"]).total_seconds() / 60
            
            # If session is long enough, evaluate performance
            if session_duration >= DEMOTION["min_live_minutes"]:
                current_live_wr = live_win_rate()
                
                # Check if this was a "good run" (above threshold)
                if current_live_wr >= DEMOTION["good_run_threshold"]:
                    stats["consecutive_good_runs"] += 1
                    print(f"✅ Good live session completed! Consecutive good runs: {stats['consecutive_good_runs']}")
                    
                    # Reset session tracking for next session
                    stats["current_session_start"] = None
                    
                    # Don't demote - continue live trading or allow easy re-entry
                    if stats["consecutive_good_runs"] >= PROMOTION["skip_after_good_runs"]:
                        print(f"🎯 Paper trading will be SKIPPED on next promotion (proven strategy)")
                
        # Check if demotion is needed (poor performance)
        if should_demote():
            config.MODE = "PAPER"
            RETRAINING_START_TIME = datetime.now()
            START_TIME = datetime.now()  # Reset paper timer for quick retraining
            stats["mode_switches"] += 1
            
            # Reset consecutive good runs counter on poor performance
            stats["consecutive_good_runs"] = 0
            stats["current_session_start"] = None
            
            live_duration = (datetime.now() - LIVE_START_TIME).total_seconds() / 60
            LIVE_START_TIME = None
            
            print("\n" + "="*60)
            print("⚠️  DEMOTION TRIGGERED: RETURNING TO PAPER MODE")
            print("="*60)
            print(f"   Live duration: {live_duration:.1f} min")
            print(f"   Live trades: {stats['live_trades']}")
            print(f"   Live win rate: {live_win_rate():.1%}")
            print(f"   Retraining for: {DEMOTION['retraining_minutes']} minutes")
            print(f"   Mode switches: {stats['mode_switches']}")
            print(f"   Consecutive good runs: RESET to 0")
            print("="*60 + "\n")


def record_trade(outcome, pnl=0.0):
    """
    Records a trade outcome and updates statistics
    Tracks both paper and live trading separately
    
    Args:
        outcome: "win" or "loss"
        pnl: Profit/loss amount (optional)
    """
    # Track overall stats
    stats["paper_trades"] += 1
    
    if outcome == "win":
        stats["wins"] += 1
    elif outcome == "loss":
        stats["losses"] += 1
    
    # Track live trading stats separately
    if config.MODE == "LIVE_LIMITED":
        stats["live_trades"] += 1
        if outcome == "win":
            stats["live_wins"] += 1
        elif outcome == "loss":
            stats["live_losses"] += 1
    
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


def get_mode_info():
    """
    Returns current mode information and timers
    
    Returns:
        dict: Mode information including timers and status
    """
    info = {
        "current_mode": config.MODE,
        "total_runtime_minutes": (datetime.now() - START_TIME).total_seconds() / 60
    }
    
    if LIVE_START_TIME:
        info["live_duration_minutes"] = (datetime.now() - LIVE_START_TIME).total_seconds() / 60
    
    if RETRAINING_START_TIME:
        retraining_elapsed = (datetime.now() - RETRAINING_START_TIME).total_seconds() / 60
        info["retraining_elapsed_minutes"] = retraining_elapsed
        info["retraining_remaining_minutes"] = DEMOTION["retraining_minutes"] - retraining_elapsed
    
    return info
