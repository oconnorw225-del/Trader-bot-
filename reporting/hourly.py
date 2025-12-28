"""
Hourly reporting module
Generates periodic reports on trading activity and performance
"""

from datetime import datetime
import config


def report(state, promotion_stats=None):
    """
    Generates and prints an hourly report of the trading system state
    
    Args:
        state: Dictionary containing current system state (balance, PnL, metrics, etc.)
        promotion_stats: Optional dictionary from promotion.get_stats() for detailed metrics
    """
    print("\n" + "="*50)
    print("=== HOURLY REPORT ===")
    print("="*50)
    print(f"Time: {datetime.utcnow()}")
    print(f"Mode: {config.MODE}")
    
    # Basic state info
    for k, v in state.items():
        if isinstance(v, float):
            print(f"{k}: {v:.2f}")
        else:
            print(f"{k}: {v}")
    
    # Additional promotion stats if provided
    if promotion_stats:
        print(f"\nPerformance Metrics:")
        print(f"  Total paper trades: {promotion_stats.get('paper_trades', 0)}")
        print(f"  Wins: {promotion_stats.get('wins', 0)}")
        print(f"  Losses: {promotion_stats.get('losses', 0)}")
        
        total = promotion_stats.get('wins', 0) + promotion_stats.get('losses', 0)
        if total > 0:
            win_rate = promotion_stats.get('wins', 0) / total
            print(f"  Win rate: {win_rate:.1%}")
    
    # System status
    print(f"\nSystem Status:")
    print(f"  Kill switch active: {config.MODE == 'HALTED'}")
    
    print("="*50)
