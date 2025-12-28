"""
Main Bot Runner for NDAX Quantum Engine Trading System
Orchestrates the trading loop with paper/live mode controls
"""

from platform.ndax_test import NDAXTestClient
from strategy.chimera_core import decide
from execution.executor import execute
from reporting.hourly import report
import time


def main():
    """
    Main trading loop
    Initializes the platform, manages state, and executes trading strategies
    """
    # Initialize NDAX test client
    client = NDAXTestClient()
    platform = client.get_platform_info()
    print("Platform:", platform)

    # Initialize trading state
    state = {
        "balance": 10000,
        "drawdown": 0.0,
        "daily_pnl": 0.0,
        "trades_last_hour": 0
    }

    # Main trading loop
    while True:
        # Get current market price
        price = client.get_price("BTC/CAD")
        
        # Get trading signal from strategy
        signal = decide({"price": price})
        
        # Execute trade based on signal and current state
        execute(signal, state, price)
        
        # Wait 60 seconds before next iteration
        time.sleep(60)


if __name__ == "__main__":
    main()
