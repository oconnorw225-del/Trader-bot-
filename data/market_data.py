"""
Market Data Manager
Handles real-time and historical market data retrieval
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import time

logger = logging.getLogger(__name__)


class MarketDataManager:
    """
    Manages market data retrieval and caching
    Supports both real-time and historical data
    """
    
    def __init__(self, demo_mode: bool = True):
        """
        Initialize Market Data Manager
        
        Args:
            demo_mode: If True, returns simulated market data
        """
        self.demo_mode = demo_mode
        self.cache = {}
        self.cache_ttl = 60  # seconds
        
        logger.info(f"Market Data Manager initialized in {'DEMO' if demo_mode else 'LIVE'} mode")
    
    def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """
        Get current ticker data for a symbol
        
        Args:
            symbol: Trading pair (e.g., 'BTC/USD')
        
        Returns:
            Current ticker data including price, volume, etc.
        """
        cache_key = f"ticker_{symbol}"
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return cached_data
        
        if self.demo_mode:
            ticker = self._get_demo_ticker(symbol)
        else:
            ticker = self._get_real_ticker(symbol)
        
        # Update cache
        self.cache[cache_key] = (ticker, time.time())
        
        return ticker
    
    def get_orderbook(self, symbol: str, depth: int = 20) -> Dict[str, List[List[float]]]:
        """
        Get order book data
        
        Args:
            symbol: Trading pair
            depth: Number of price levels to return
        
        Returns:
            Order book with bids and asks
        """
        if self.demo_mode:
            return self._get_demo_orderbook(symbol, depth)
        else:
            return self._get_real_orderbook(symbol, depth)
    
    def get_trades(self, symbol: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get recent trades
        
        Args:
            symbol: Trading pair
            limit: Number of trades to return
        
        Returns:
            List of recent trades
        """
        if self.demo_mode:
            return self._get_demo_trades(symbol, limit)
        else:
            return self._get_real_trades(symbol, limit)
    
    def get_ohlcv(
        self,
        symbol: str,
        interval: str = '1m',
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get OHLCV (candlestick) data
        
        Args:
            symbol: Trading pair
            interval: Time interval (1m, 5m, 15m, 1h, 4h, 1d)
            limit: Number of candles to return
        
        Returns:
            List of OHLCV candles
        """
        if self.demo_mode:
            return self._get_demo_ohlcv(symbol, interval, limit)
        else:
            return self._get_real_ohlcv(symbol, interval, limit)
    
    # Demo data methods
    
    def _get_demo_ticker(self, symbol: str) -> Dict[str, Any]:
        """Generate demo ticker data"""
        import random
        
        base_prices = {
            'BTC/USD': 50000.0,
            'ETH/USD': 3000.0,
            'BTC/CAD': 67500.0,
            'ETH/CAD': 4050.0
        }
        
        base_price = base_prices.get(symbol, 100.0)
        variation = random.uniform(-0.02, 0.02)
        current_price = base_price * (1 + variation)
        
        return {
            'symbol': symbol,
            'price': round(current_price, 2),
            'bid': round(current_price * 0.999, 2),
            'ask': round(current_price * 1.001, 2),
            'volume': round(random.uniform(1000000, 5000000), 2),
            'high24h': round(current_price * 1.03, 2),
            'low24h': round(current_price * 0.97, 2),
            'change24h': round(random.uniform(-5, 5), 2),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _get_demo_orderbook(self, symbol: str, depth: int) -> Dict[str, List[List[float]]]:
        """Generate demo order book"""
        import random
        
        ticker = self._get_demo_ticker(symbol)
        mid_price = ticker['price']
        
        bids = []
        asks = []
        
        for i in range(depth):
            bid_price = mid_price * (1 - (i + 1) * 0.0001)
            ask_price = mid_price * (1 + (i + 1) * 0.0001)
            
            bid_volume = random.uniform(0.1, 10.0)
            ask_volume = random.uniform(0.1, 10.0)
            
            bids.append([round(bid_price, 2), round(bid_volume, 4)])
            asks.append([round(ask_price, 2), round(ask_volume, 4)])
        
        return {
            'symbol': symbol,
            'bids': bids,
            'asks': asks,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _get_demo_trades(self, symbol: str, limit: int) -> List[Dict[str, Any]]:
        """Generate demo trades"""
        import random
        
        ticker = self._get_demo_ticker(symbol)
        base_price = ticker['price']
        
        trades = []
        timestamp = datetime.utcnow()
        
        for i in range(limit):
            trade_time = timestamp - timedelta(seconds=i * 10)
            price_var = random.uniform(-0.001, 0.001)
            price = base_price * (1 + price_var)
            
            trades.append({
                'id': f"trade_{int(trade_time.timestamp() * 1000)}",
                'symbol': symbol,
                'price': round(price, 2),
                'quantity': round(random.uniform(0.01, 1.0), 4),
                'side': random.choice(['BUY', 'SELL']),
                'timestamp': trade_time.isoformat()
            })
        
        return trades
    
    def _get_demo_ohlcv(self, symbol: str, interval: str, limit: int) -> List[Dict[str, Any]]:
        """Generate demo OHLCV data"""
        import random
        
        ticker = self._get_demo_ticker(symbol)
        base_price = ticker['price']
        
        interval_seconds = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '1h': 3600,
            '4h': 14400,
            '1d': 86400
        }.get(interval, 60)
        
        candles = []
        timestamp = datetime.utcnow()
        current_price = base_price
        
        for i in range(limit):
            candle_time = timestamp - timedelta(seconds=i * interval_seconds)
            
            # Generate OHLC with random walk
            open_price = current_price
            change = random.uniform(-0.02, 0.02)
            close_price = open_price * (1 + change)
            high_price = max(open_price, close_price) * random.uniform(1.0, 1.01)
            low_price = min(open_price, close_price) * random.uniform(0.99, 1.0)
            volume = random.uniform(100, 1000)
            
            candles.insert(0, {
                'timestamp': int(candle_time.timestamp() * 1000),
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': round(volume, 2)
            })
            
            current_price = close_price
        
        return candles
    
    # Real data methods (to be implemented with actual API)
    
    def _get_real_ticker(self, symbol: str) -> Dict[str, Any]:
        """Get real ticker from NDAX API"""
        # TODO: Implement NDAX API integration
        logger.warning("Real NDAX API not implemented, using demo mode")
        return self._get_demo_ticker(symbol)
    
    def _get_real_orderbook(self, symbol: str, depth: int) -> Dict[str, List[List[float]]]:
        """Get real order book from NDAX API"""
        # TODO: Implement NDAX API integration
        logger.warning("Real NDAX API not implemented, using demo mode")
        return self._get_demo_orderbook(symbol, depth)
    
    def _get_real_trades(self, symbol: str, limit: int) -> List[Dict[str, Any]]:
        """Get real trades from NDAX API"""
        # TODO: Implement NDAX API integration
        logger.warning("Real NDAX API not implemented, using demo mode")
        return self._get_demo_trades(symbol, limit)
    
    def _get_real_ohlcv(
        self,
        symbol: str,
        interval: str,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Get real OHLCV from NDAX API"""
        # TODO: Implement NDAX API integration
        logger.warning("Real NDAX API not implemented, using demo mode")
        return self._get_demo_ohlcv(symbol, interval, limit)
