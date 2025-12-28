"""
Tests for the new Python trading system modules
"""

import sys
import os

# Add the parent directory to the path to import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from config import MODE, RISK_LIMITS, PROMOTION, ALLOW_LIVE
from platform.ndax_test import NDAXTestClient
from execution.governor import risk_check, allowed_size, trigger_kill
from execution.executor import execute
from execution.promotion import win_rate, can_promote, record_trade, get_stats, reset_hourly_counter
from strategy.chimera_core import decide
from reporting.hourly import report


class TestConfig:
    """Tests for config module"""
    
    def test_mode_exists(self):
        """Test that MODE is defined"""
        assert MODE in ["PAPER", "LIVE_LIMITED", "HALTED"]
    
    def test_risk_limits_structure(self):
        """Test that RISK_LIMITS has all required keys"""
        required_keys = ["capital_cap", "max_position", "max_trades_per_hour", 
                        "hard_stop_loss", "max_daily_loss", "kill_switch"]
        for key in required_keys:
            assert key in RISK_LIMITS
    
    def test_promotion_criteria(self):
        """Test that PROMOTION criteria are defined"""
        assert "min_minutes" in PROMOTION
        assert "min_trades" in PROMOTION
        assert "min_win_rate" in PROMOTION
    
    def test_allow_live_is_bool(self):
        """Test that ALLOW_LIVE is a boolean"""
        assert isinstance(ALLOW_LIVE, bool)


class TestNDAXTestClient:
    """Tests for NDAX test client"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = NDAXTestClient()
    
    def test_get_platform_info(self):
        """Test platform info retrieval"""
        info = self.client.get_platform_info()
        assert info["exchange"] == "NDAX"
        assert info["mode"] == "TEST"
        assert "pairs" in info
    
    def test_get_balance(self):
        """Test balance retrieval"""
        balance = self.client.get_balance()
        assert "CAD" in balance
        assert balance["CAD"] == 10000
    
    def test_get_price(self):
        """Test price retrieval"""
        price = self.client.get_price("BTC/CAD")
        assert isinstance(price, (int, float))
        assert price > 0


class TestGovernor:
    """Tests for execution governor"""
    
    def test_risk_check_passes_good_state(self):
        """Test that risk check passes for healthy state"""
        state = {
            "drawdown": 0.1,
            "daily_pnl": 0.05,
            "trades_last_hour": 10
        }
        assert risk_check(state) is True
    
    def test_risk_check_fails_high_drawdown(self):
        """Test that risk check fails for high drawdown"""
        state = {
            "drawdown": 0.35,  # Exceeds hard_stop_loss of 0.30
            "daily_pnl": 0.0,
            "trades_last_hour": 0
        }
        assert risk_check(state) is False
    
    def test_risk_check_fails_high_daily_loss(self):
        """Test that risk check fails for high daily loss"""
        state = {
            "drawdown": 0.0,
            "daily_pnl": -0.60,  # Exceeds max_daily_loss of 0.50
            "trades_last_hour": 0
        }
        assert risk_check(state) is False
    
    def test_risk_check_fails_too_many_trades(self):
        """Test that risk check fails for too many trades"""
        state = {
            "drawdown": 0.0,
            "daily_pnl": 0.0,
            "trades_last_hour": 150  # Exceeds max of 100
        }
        assert risk_check(state) is False
    
    def test_allowed_size_calculation(self):
        """Test position size calculation"""
        balance = 10000
        size = allowed_size(balance)
        # With capital_cap=0.50 and max_position=0.05:
        # usable = 10000 * 0.50 = 5000
        # size = 5000 * 0.05 = 250
        assert size == 250.0


class TestPromotion:
    """Tests for promotion module"""
    
    def test_record_trade_updates_stats(self):
        """Test that recording trades updates statistics"""
        stats_before = get_stats()
        trades_before = stats_before["paper_trades"]
        
        record_trade("win")
        
        stats_after = get_stats()
        assert stats_after["paper_trades"] == trades_before + 1
        assert stats_after["wins"] == stats_before["wins"] + 1
    
    def test_win_rate_calculation(self):
        """Test win rate calculation"""
        # Reset stats
        from execution.promotion import stats
        stats["wins"] = 7
        stats["losses"] = 3
        
        rate = win_rate()
        assert rate == 0.7
    
    def test_win_rate_with_no_trades(self):
        """Test win rate returns 0 when no trades"""
        from execution.promotion import stats
        stats["wins"] = 0
        stats["losses"] = 0
        
        rate = win_rate()
        assert rate == 0.0
    
    def test_reset_hourly_counter(self):
        """Test hourly counter reset"""
        from execution.promotion import stats
        stats["trades_last_hour"] = 50
        
        reset_hourly_counter()
        
        assert stats["trades_last_hour"] == 0


class TestExecutor:
    """Tests for executor module"""
    
    def test_execute_paper_mode(self):
        """Test execution in PAPER mode"""
        # This is mainly a smoke test - actual output is to console
        signal = "BUY"
        account = {
            "balance": 10000,
            "drawdown": 0.0,
            "daily_pnl": 0.0,
            "trades_last_hour": 0
        }
        price = 50000
        
        # Should not raise any exceptions
        execute(signal, account, price)


class TestChimeraCore:
    """Tests for Chimera strategy"""
    
    def test_decide_returns_valid_signal(self):
        """Test that decide returns a valid trading signal"""
        market_state = {"price": 50000}
        signal = decide(market_state)
        assert signal in ["BUY", "SELL", "HOLD"]


class TestReporting:
    """Tests for reporting module"""
    
    def test_report_runs_without_error(self):
        """Test that report function runs without error"""
        state = {
            "balance": 10000,
            "drawdown": 0.0,
            "daily_pnl": 0.0,
            "trades_last_hour": 5
        }
        # Should not raise any exceptions
        report(state)


if __name__ == "__main__":
    # Simple test runner
    import traceback
    
    test_classes = [
        TestConfig,
        TestNDAXTestClient,
        TestGovernor,
        TestPromotion,
        TestExecutor,
        TestChimeraCore,
        TestReporting
    ]
    
    total_tests = 0
    passed_tests = 0
    
    for test_class in test_classes:
        print(f"\n=== Testing {test_class.__name__} ===")
        test_obj = test_class()
        
        # Get test methods (those starting with test_)
        test_methods = [method for method in dir(test_obj) if method.startswith('test_')]
        
        for method_name in test_methods:
            total_tests += 1
            try:
                # Call setup if it exists
                if hasattr(test_obj, 'setup_method'):
                    test_obj.setup_method()
                
                # Run the test
                method = getattr(test_obj, method_name)
                method()
                
                print(f"✓ {method_name}")
                passed_tests += 1
            except AssertionError as e:
                print(f"✗ {method_name}: {e}")
            except Exception as e:
                print(f"✗ {method_name}: {type(e).__name__}: {e}")
                traceback.print_exc()
    
    print(f"\n{'='*50}")
    print(f"Tests passed: {passed_tests}/{total_tests}")
    print(f"{'='*50}")
