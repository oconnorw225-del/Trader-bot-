#!/usr/bin/env python3
"""
Test Suite for Chimera Bot
Validates all core functionality
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Set test environment
os.environ['TRADING_MODE'] = 'paper'
os.environ['RISK_LEVEL'] = 'moderate'

from config import Config, TradingMode, RiskLevel
from execution.governor import Governor
from execution.executor import Executor
from strategy.chimera_core import ChimeraCore
from reporting.hourly import HourlyReporter
from platforms.ndax_test import NDAXTest
from platforms.ndax_live import NDAXLive
from main import ChimeraBot


def test_config():
    """Test configuration loading"""
    print("\n[TEST] Config Loading...")
    
    # Test from environment
    config = Config.from_env()
    assert config.mode == TradingMode.PAPER
    assert config.risk_level == RiskLevel.MODERATE
    assert config.max_position_size > 0
    assert config.max_trades_per_day > 0
    
    # Test validation
    config.validate()
    
    # Test to_dict
    config_dict = config.to_dict()
    assert 'mode' in config_dict
    assert 'risk_level' in config_dict
    
    print("  ✅ Config tests passed")
    return True


def test_governor():
    """Test risk governor"""
    print("\n[TEST] Risk Governor...")
    
    config = Config.from_env()
    governor = Governor(config)
    
    # Test approval of good signal
    good_signal = {
        'symbol': 'BTC/USD',
        'action': 'buy',
        'price': 45000,
        'confidence': 0.8,
        'position_size': 0.05
    }
    
    result = governor.evaluate(good_signal)
    assert result['approved'] == True
    
    # Test rejection of low confidence signal
    bad_signal = {
        'symbol': 'BTC/USD',
        'action': 'buy',
        'price': 45000,
        'confidence': 0.3,  # Too low
        'position_size': 0.05
    }
    
    result = governor.evaluate(bad_signal)
    assert result['approved'] == False
    
    # Test statistics
    stats = governor.get_stats()
    assert 'daily_trades' in stats
    assert 'open_positions' in stats
    
    print("  ✅ Governor tests passed")
    return True


def test_executor_paper():
    """Test paper trading executor"""
    print("\n[TEST] Paper Trading Executor...")
    
    config = Config.from_env()
    executor = Executor(config)
    
    # Test status
    status = executor.status()
    assert status['mode'] == 'paper'
    assert 'platform_status' in status
    
    # Test execution
    signal = {
        'symbol': 'BTC/USD',
        'action': 'buy',
        'price': 45000,
        'confidence': 0.8,
        'position_size': 0.05
    }
    
    risk_check = {
        'approved': True,
        'position_size': 0.01,
        'stop_loss': 44000,
        'take_profit': 46000
    }
    
    result = executor.execute(signal, risk_check)
    assert result['success'] == True
    assert 'order_id' in result
    
    # Test history
    history = executor.get_execution_history()
    assert len(history) == 1
    
    print("  ✅ Executor tests passed")
    return True


def test_platforms():
    """Test platform connectors"""
    print("\n[TEST] Platform Connectors...")
    
    config = Config.from_env()
    
    # Test NDAX Test platform
    test_platform = NDAXTest(config)
    
    # Test status
    status = test_platform.get_status()
    assert status['mode'] == 'test'
    assert status['connected'] == True
    
    # Test balance
    balance = test_platform.get_balance()
    assert 'balances' in balance
    assert balance['mode'] == 'paper'
    
    # Test order placement
    order = {
        'symbol': 'BTC/USD',
        'action': 'buy',
        'price': 45000,
        'quantity': 0.01
    }
    
    result = test_platform.place_order(order)
    assert result['status'] == 'filled'
    assert result['order_id'] is not None
    
    # Test NDAX Live platform (should be locked)
    try:
        live_platform = NDAXLive(config)
        # If safety lock is disabled, this will succeed
        # Otherwise, it should raise an error
        print("  ⚠️  Warning: Live platform safety lock is disabled")
    except (ValueError, PermissionError) as e:
        # Expected when no credentials or safety lock enabled
        print(f"  ✅ Safety lock working: {str(e)[:50]}...")
    
    print("  ✅ Platform tests passed")
    return True


def test_strategy():
    """Test trading strategy"""
    print("\n[TEST] Trading Strategy...")
    
    config = Config.from_env()
    strategy = ChimeraCore(config)
    
    # Test signal generation
    signal = strategy.generate_signal()
    
    assert 'symbol' in signal
    assert 'action' in signal
    assert 'price' in signal
    assert 'confidence' in signal
    assert 'position_size' in signal
    
    # Validate signal structure
    assert signal['action'] in ['buy', 'sell']
    assert 0 <= signal['confidence'] <= 1
    assert signal['position_size'] > 0
    
    print("  ✅ Strategy tests passed")
    return True


def test_reporter():
    """Test hourly reporter"""
    print("\n[TEST] Hourly Reporter...")
    
    config = Config.from_env()
    reporter = HourlyReporter(config)
    
    # Test status
    status = reporter.status()
    assert 'total_trades_logged' in status
    assert 'report_directory' in status
    
    # Test trade logging
    execution = {
        'success': True,
        'order': {
            'symbol': 'BTC/USD',
            'action': 'buy'
        }
    }
    
    reporter.log_trade(execution)
    
    # Test daily summary
    summary = reporter.get_daily_summary()
    assert 'date' in summary
    assert 'summary' in summary
    
    print("  ✅ Reporter tests passed")
    return True


def test_full_bot():
    """Test complete bot integration"""
    print("\n[TEST] Full Bot Integration...")
    
    config = Config.from_env()
    bot = ChimeraBot(config)
    
    # Test status
    status = bot.status()
    assert 'mode' in status
    assert 'risk_level' in status
    assert 'executor_status' in status
    
    # Test execution cycle
    result = bot.run()
    
    # Result can be success or rejection, both are valid
    assert 'success' in result
    
    if result['success']:
        assert 'signal' in result
        assert 'execution' in result
        print("  ✅ Trade executed successfully")
    else:
        # Trade rejected by risk checks - also valid
        assert 'reason' in result
        print(f"  ✅ Trade correctly rejected: {result.get('reason', 'unknown')}")
    
    print("  ✅ Full bot tests passed")
    return True


def run_all_tests():
    """Run all test suites"""
    print("=" * 60)
    print("CHIMERA BOT TEST SUITE")
    print("=" * 60)
    
    tests = [
        ("Configuration", test_config),
        ("Risk Governor", test_governor),
        ("Executor", test_executor_paper),
        ("Platforms", test_platforms),
        ("Strategy", test_strategy),
        ("Reporter", test_reporter),
        ("Full Integration", test_full_bot)
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"  ❌ {name} test failed: {str(e)}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"TEST RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
