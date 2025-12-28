"""
Executor module for trade execution across different modes
Handles PAPER, LIVE_LIMITED, and HALTED modes
"""

from config import MODE, ALLOW_LIVE
from execution.governor import risk_check, allowed_size


def execute(signal, account, price):
    """
    Executes a trade signal based on current mode and risk checks
    
    Args:
        signal: Trading signal (BUY, SELL, HOLD)
        account: Account state dictionary containing balance and other metrics
        price: Current market price
    
    Returns:
        None - prints execution status to console
    """
    # If trading is halted, do nothing
    if MODE == "HALTED":
        return

    # Perform risk checks before execution
    if not risk_check(account):
        return

    # Calculate allowed position size
    size = allowed_size(account["balance"])

    # Paper trading mode - simulate execution
    if MODE == "PAPER":
        print(f"[PAPER] {signal} {size} @ {price}")
        return

    # Live trading mode - only if explicitly allowed
    if MODE == "LIVE_LIMITED" and ALLOW_LIVE:
        print(f"[LIVE] {signal} {size} @ {price}")
        # In production, this would place actual orders:
        # ndax_live.place_order(...)
