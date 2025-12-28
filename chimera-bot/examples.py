#!/usr/bin/env python3
"""
Example: Running Chimera-Bot Programmatically
This demonstrates how to use the bot as a Python module
"""

import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Set environment for demo
os.environ['TRADING_MODE'] = 'paper'
os.environ['RISK_LEVEL'] = 'moderate'

from config import Config, TradingMode, RiskLevel
from main import ChimeraBot


def example_basic_usage():
    """Example 1: Basic usage with default configuration"""
    print("=" * 60)
    print("Example 1: Basic Usage")
    print("=" * 60)
    
    # Load configuration from environment
    config = Config.from_env()
    
    # Create bot instance
    bot = ChimeraBot(config)
    
    # Check status
    status = bot.status()
    print(f"\nBot Status:")
    print(f"  Mode: {status['mode'].value}")
    print(f"  Risk Level: {status['risk_level'].value}")
    print(f"  Platform: {status['executor_status']['platform']}")
    
    # Run one execution cycle
    result = bot.run()
    
    if result['success']:
        print(f"\n✅ Trade executed successfully!")
        print(f"  Symbol: {result['signal']['symbol']}")
        print(f"  Action: {result['signal']['action']}")
        print(f"  Price: ${result['signal']['price']:.2f}")
        print(f"  Confidence: {result['signal']['confidence']:.2%}")
    else:
        print(f"\n❌ Trade rejected: {result.get('reason')}")


def example_custom_config():
    """Example 2: Custom configuration"""
    print("\n\n" + "=" * 60)
    print("Example 2: Custom Configuration")
    print("=" * 60)
    
    # Create custom configuration
    config = Config(
        mode=TradingMode.PAPER,
        risk_level=RiskLevel.CONSERVATIVE,
        max_position_size=0.05,  # Only 5% per trade
        max_daily_loss=0.02,      # Stop at 2% daily loss
        max_trades_per_day=5      # Max 5 trades per day
    )
    
    print(f"\nCustom Configuration:")
    print(f"  Max Position Size: {config.max_position_size:.1%}")
    print(f"  Max Daily Loss: {config.max_daily_loss:.1%}")
    print(f"  Max Trades/Day: {config.max_trades_per_day}")
    
    bot = ChimeraBot(config)
    result = bot.run()
    
    if result['success']:
        print(f"\n✅ Conservative trade executed!")
    else:
        print(f"\n❌ Trade rejected: {result.get('reason')}")


def example_multiple_cycles():
    """Example 3: Running multiple trading cycles"""
    print("\n\n" + "=" * 60)
    print("Example 3: Multiple Trading Cycles")
    print("=" * 60)
    
    config = Config.from_env()
    bot = ChimeraBot(config)
    
    num_cycles = 3
    results = []
    
    print(f"\nRunning {num_cycles} trading cycles...")
    
    for i in range(num_cycles):
        print(f"\n--- Cycle {i + 1} ---")
        result = bot.run()
        results.append(result)
        
        if result['success']:
            print(f"✅ Trade {i + 1}: {result['signal']['action']} {result['signal']['symbol']}")
        else:
            print(f"❌ Trade {i + 1}: Rejected - {result.get('reason')}")
    
    # Summary
    successful = sum(1 for r in results if r['success'])
    print(f"\n📊 Summary: {successful}/{num_cycles} trades executed successfully")


def example_monitoring():
    """Example 4: Monitoring and statistics"""
    print("\n\n" + "=" * 60)
    print("Example 4: Monitoring and Statistics")
    print("=" * 60)
    
    config = Config.from_env()
    bot = ChimeraBot(config)
    
    # Execute a trade
    result = bot.run()
    
    # Get governor statistics
    gov_stats = bot.governor.get_stats()
    print(f"\n📊 Governor Statistics:")
    print(f"  Daily Trades: {gov_stats['daily_trades']}")
    print(f"  Trades Remaining: {gov_stats['trades_remaining']}")
    print(f"  Open Positions: {gov_stats['open_positions']}")
    print(f"  Positions Available: {gov_stats['positions_available']}")
    print(f"  Daily Loss: {gov_stats['daily_loss']:.4f}")
    print(f"  Loss Remaining: {gov_stats['loss_remaining']:.4f}")
    
    # Get executor status
    exec_status = bot.executor.status()
    print(f"\n📊 Executor Statistics:")
    print(f"  Total Executions: {exec_status['total_executions']}")
    print(f"  Platform Connected: {exec_status['platform_status']['connected']}")
    
    # Get reporter status
    reporter_status = bot.reporter.status()
    print(f"\n📊 Reporter Statistics:")
    print(f"  Trades Logged: {reporter_status['total_trades_logged']}")
    print(f"  Report Directory: {reporter_status['report_directory']}")


def example_error_handling():
    """Example 5: Error handling and recovery"""
    print("\n\n" + "=" * 60)
    print("Example 5: Error Handling")
    print("=" * 60)
    
    config = Config.from_env()
    bot = ChimeraBot(config)
    
    # Run multiple cycles and handle errors
    for i in range(5):
        try:
            result = bot.run()
            
            if result['success']:
                print(f"✅ Cycle {i + 1}: Success")
            else:
                print(f"⚠️  Cycle {i + 1}: {result.get('reason')}")
                
                # Handle specific rejection reasons
                if result.get('reason') == 'rejected_by_risk_governor':
                    details = result.get('details', {})
                    print(f"   Rejection reason: {details.get('reason')}")
                    
        except Exception as e:
            print(f"❌ Cycle {i + 1}: Error - {str(e)}")
            continue


def main():
    """Run all examples"""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 10 + "CHIMERA-BOT USAGE EXAMPLES" + " " * 21 + "║")
    print("╚" + "═" * 58 + "╝")
    
    try:
        example_basic_usage()
        example_custom_config()
        example_multiple_cycles()
        example_monitoring()
        example_error_handling()
        
        print("\n\n" + "=" * 60)
        print("🎉 All examples completed!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Review the output above")
        print("  2. Check the logs: tail -f chimera-bot.log")
        print("  3. View reports: ls -lh reports/")
        print("  4. Customize strategy in strategy/chimera_core.py")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error running examples: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
