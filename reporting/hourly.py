"""
Hourly reporting module
Generates periodic reports on trading activity and performance
"""

from datetime import datetime


def report(state):
    """
    Generates and prints an hourly report of the trading system state
    
    Args:
        state: Dictionary containing current system state (balance, PnL, metrics, etc.)
    """
    print("\n=== HOURLY REPORT ===")
    print("Time:", datetime.utcnow())
    for k, v in state.items():
        print(f"{k}: {v}")
