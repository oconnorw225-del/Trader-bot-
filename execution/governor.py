"""
Governor module for risk management and position sizing
Enforces risk limits and validates trades before execution
"""

from config import RISK_LIMITS, MODE


def risk_check(state):
    """
    Performs comprehensive risk checks on current trading state
    
    Args:
        state: Dictionary containing current account state with keys:
               - drawdown: Current drawdown percentage
               - daily_pnl: Daily profit/loss percentage
               - trades_last_hour: Number of trades in the last hour
    
    Returns:
        bool: True if all risk checks pass, False otherwise
    """
    # Check if drawdown exceeds hard stop loss limit
    if state["drawdown"] >= RISK_LIMITS["hard_stop_loss"]:
        return False
    
    # Check if daily loss exceeds maximum allowed
    if state["daily_pnl"] <= -RISK_LIMITS["max_daily_loss"]:
        return False
    
    # Check if trade frequency exceeds limit
    if state["trades_last_hour"] >= RISK_LIMITS["max_trades_per_hour"]:
        return False
    
    return True


def allowed_size(balance):
    """
    Calculates the maximum allowed position size based on balance and risk limits
    
    Args:
        balance: Total account balance
    
    Returns:
        float: Maximum allowed position size
    """
    # Calculate usable capital (capital_cap % of total balance)
    usable = balance * RISK_LIMITS["capital_cap"]
    
    # Calculate max position size (max_position % of usable capital)
    return usable * RISK_LIMITS["max_position"]
