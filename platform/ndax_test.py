"""
NDAX Test Client for paper trading simulation
Provides mock exchange data and balance information
"""


class NDAXTestClient:
    """
    Mock NDAX client for testing and paper trading
    Simulates real exchange behavior without actual API calls
    """
    
    def get_platform_info(self):
        """
        Returns platform information and configuration
        
        Returns:
            dict: Platform details including exchange name, mode, pairs, and rate limit
        """
        return {
            "exchange": "NDAX",
            "mode": "TEST",
            "pairs": ["BTC/CAD", "ETH/CAD"],
            "rate_limit": "safe"
        }

    def get_balance(self):
        """
        Returns mock account balances for testing
        
        Returns:
            dict: Balance for each currency (CAD, BTC, ETH)
        """
        return {
            "CAD": 10000,
            "BTC": 0.0,
            "ETH": 0.0
        }

    def get_price(self, pair):
        """
        Returns mock price for a trading pair
        
        Args:
            pair: Trading pair string (e.g., "BTC/CAD")
            
        Returns:
            float: Mock price for the pair
        """
        # Mock / test feed - returns fixed price for testing
        return 50000.0
