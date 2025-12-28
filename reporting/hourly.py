"""
Hourly reporting module
Generates periodic reports on trading activity and performance
"""

from datetime import datetime
import config


def report(state, promotion_stats=None, mode_info=None):
    """
    Generates and prints an hourly report of the trading system state
    
    Args:
        state: Dictionary containing current system state (balance, PnL, metrics, etc.)
        promotion_stats: Optional dictionary from promotion.get_stats() for detailed metrics
        mode_info: Optional dictionary from promotion.get_mode_info() for mode timing info
    """
    print("\n" + "="*70)
    print("=== HOURLY REPORT ===")
    print("="*70)
    print(f"Time: {datetime.utcnow()}")
    print(f"Mode: {config.MODE}")
    
    # Mode timing information
    if mode_info:
        print(f"\nMode Information:")
        print(f"  Total runtime: {mode_info.get('total_runtime_minutes', 0):.1f} minutes")
        
        if 'live_duration_minutes' in mode_info:
            print(f"  Live trading duration: {mode_info['live_duration_minutes']:.1f} minutes")
        
        if 'retraining_remaining_minutes' in mode_info:
            print(f"  Retraining mode: {mode_info['retraining_elapsed_minutes']:.1f} / {mode_info['retraining_elapsed_minutes'] + mode_info['retraining_remaining_minutes']:.0f} minutes")
            print(f"  Retraining remaining: {mode_info['retraining_remaining_minutes']:.1f} minutes")
    
    # Basic state info
    print(f"\nAccount State:")
    for k, v in state.items():
        if isinstance(v, float):
            print(f"  {k}: {v:.2f}")
        else:
            print(f"  {k}: {v}")
    
    # Additional promotion stats if provided
    if promotion_stats:
        print(f"\nPerformance Metrics:")
        print(f"  Total paper trades: {promotion_stats.get('paper_trades', 0)}")
        print(f"  Wins: {promotion_stats.get('wins', 0)}")
        print(f"  Losses: {promotion_stats.get('losses', 0)}")
        
        total = promotion_stats.get('wins', 0) + promotion_stats.get('losses', 0)
        if total > 0:
            win_rate = promotion_stats.get('wins', 0) / total
            print(f"  Overall win rate: {win_rate:.1%}")
        
        # Live trading stats
        if promotion_stats.get('live_trades', 0) > 0:
            print(f"\n  Live Trading Stats:")
            print(f"    Live trades: {promotion_stats.get('live_trades', 0)}")
            print(f"    Live wins: {promotion_stats.get('live_wins', 0)}")
            print(f"    Live losses: {promotion_stats.get('live_losses', 0)}")
            
            live_total = promotion_stats.get('live_wins', 0) + promotion_stats.get('live_losses', 0)
            if live_total > 0:
                live_win_rate = promotion_stats.get('live_wins', 0) / live_total
                print(f"    Live win rate: {live_win_rate:.1%}")
        
        print(f"\n  Mode switches: {promotion_stats.get('mode_switches', 0)}")
    
    # System status
    print(f"\nSystem Status:")
    print(f"  Kill switch active: {config.MODE == 'HALTED'}")
    
    print("="*70 + "\n")
