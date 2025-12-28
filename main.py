"""
Main Bot Runner for NDAX Quantum Engine Trading System
Orchestrates the trading loop with paper/live mode controls
Includes adaptive promotion/demotion system and comprehensive reporting
"""

from platform.ndax_test import NDAXTestClient
from strategy.chimera_core import decide
from execution.executor import execute
from execution.promotion import (
    check_promotion, check_demotion, record_trade, 
    get_stats, reset_hourly_counter, get_mode_info
)
from reporting.hourly import report
import time
from datetime import datetime


def main():
    """
    Main trading loop
    Initializes the platform, manages state, and executes trading strategies
    Tracks performance and manages adaptive promotion/demotion between modes
    Features:
    - Auto-promotion from PAPER to LIVE after 15min with 70% win rate
    - Auto-demotion from LIVE to PAPER if performance drops below 60%
    - 15-minute retraining period in PAPER mode before returning to LIVE
    - After 3 consecutive good live runs (75%+ win rate), paper trading is SKIPPED
    - Platform prioritization for resource optimization
    """
    # Initialize NDAX test client
    client = NDAXTestClient()
    platform = client.get_platform_info()
    print("Platform:", platform)
    print("Starting NDAX Quantum Engine with Adaptive Mode Switching...")
    print("Mode: PAPER (will auto-promote after 15min with 70%+ win rate)")
    print("Adaptive: Returns to PAPER for 15min retraining if live performance drops")
    print("Smart Skip: After 3 consecutive good runs (75%+), paper training SKIPPED\n")

    # Initialize trading state
    state = {
        "balance": 10000,
        "drawdown": 0.0,
        "daily_pnl": 0.0,
        "trades_last_hour": 0
    }
    
    last_hour = datetime.now().hour
    last_report_minute = -1

    # Main trading loop
    while True:
        try:
            # Get current market price
            price = client.get_price("BTC/CAD")
            
            # Get trading signal from strategy
            signal = decide({"price": price})
            
            # Execute trade based on signal and current state
            execute(signal, state, price)
            
            # Record trade for promotion tracking (simplified - in production, track actual outcomes)
            if signal in ["BUY", "SELL"]:
                state["trades_last_hour"] += 1
                # Simplified: assume 70% win rate for simulation
                import random
                outcome = "win" if random.random() < 0.7 else "loss"
                record_trade(outcome)
            
            # Check for promotion eligibility (PAPER -> LIVE)
            check_promotion()
            
            # Check for demotion necessity (LIVE -> PAPER)
            check_demotion()
            
            # Reset hourly counter if new hour
            current_hour = datetime.now().hour
            if current_hour != last_hour:
                reset_hourly_counter()
                state["trades_last_hour"] = 0
                last_hour = current_hour
            
            # Generate hourly report (at the top of each hour)
            current_minute = datetime.now().minute
            if current_minute == 0 and current_minute != last_report_minute:
                mode_info = get_mode_info()
                report(state, get_stats(), mode_info)
                last_report_minute = current_minute
            
            # Wait 60 seconds before next iteration
            time.sleep(60)
            
        except KeyboardInterrupt:
            print("\n\nShutting down gracefully...")
            print("Final report:")
            mode_info = get_mode_info()
            report(state, get_stats(), mode_info)
            break
        except Exception as e:
            print(f"Error in main loop: {e}")
            time.sleep(5)  # Brief pause before retry


if __name__ == "__main__":
    main()
