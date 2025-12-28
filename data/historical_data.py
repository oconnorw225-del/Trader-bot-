"""
Historical Data Manager
Manages historical market data storage and retrieval
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class HistoricalDataManager:
    """
    Manages historical market data
    Stores and retrieves OHLCV data, trades, and other historical information
    """
    
    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize Historical Data Manager
        
        Args:
            data_dir: Directory for storing historical data
        """
        self.data_dir = data_dir or Path('data/historical')
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.cache = {}
        
        logger.info("Historical Data Manager initialized")
    
    def store_ohlcv(
        self,
        symbol: str,
        interval: str,
        data: List[Dict[str, Any]]
    ):
        """
        Store OHLCV data
        
        Args:
            symbol: Trading pair
            interval: Time interval (1m, 5m, 1h, etc.)
            data: List of OHLCV candles
        """
        try:
            filename = f"{symbol.replace('/', '_')}_{interval}.json"
            filepath = self.data_dir / filename
            
            # Load existing data
            existing_data = []
            if filepath.exists():
                with open(filepath, 'r') as f:
                    existing_data = json.load(f)
            
            # Merge with new data (avoid duplicates)
            timestamps = {candle['timestamp'] for candle in existing_data}
            new_candles = [c for c in data if c['timestamp'] not in timestamps]
            
            combined_data = existing_data + new_candles
            
            # Sort by timestamp
            combined_data.sort(key=lambda x: x['timestamp'])
            
            # Keep last 10000 candles
            combined_data = combined_data[-10000:]
            
            # Save
            with open(filepath, 'w') as f:
                json.dump(combined_data, f)
            
            logger.info(f"Stored {len(new_candles)} new candles for {symbol} {interval}")
            
        except Exception as e:
            logger.error(f"Failed to store OHLCV data: {e}")
    
    def get_ohlcv(
        self,
        symbol: str,
        interval: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieve OHLCV data
        
        Args:
            symbol: Trading pair
            interval: Time interval
            start_time: Start timestamp
            end_time: End timestamp
            limit: Maximum number of candles to return
        
        Returns:
            List of OHLCV candles
        """
        try:
            filename = f"{symbol.replace('/', '_')}_{interval}.json"
            filepath = self.data_dir / filename
            
            if not filepath.exists():
                logger.warning(f"No historical data found for {symbol} {interval}")
                return []
            
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Apply filters
            if start_time:
                start_ts = int(start_time.timestamp() * 1000)
                data = [c for c in data if c['timestamp'] >= start_ts]
            
            if end_time:
                end_ts = int(end_time.timestamp() * 1000)
                data = [c for c in data if c['timestamp'] <= end_ts]
            
            # Apply limit
            data = data[-limit:]
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to retrieve OHLCV data: {e}")
            return []
    
    def store_trade(self, symbol: str, trade: Dict[str, Any]):
        """Store a single trade"""
        try:
            filename = f"{symbol.replace('/', '_')}_trades.json"
            filepath = self.data_dir / filename
            
            # Load existing trades
            trades = []
            if filepath.exists():
                with open(filepath, 'r') as f:
                    trades = json.load(f)
            
            # Add new trade
            trades.append(trade)
            
            # Keep last 1000 trades
            trades = trades[-1000:]
            
            # Save
            with open(filepath, 'w') as f:
                json.dump(trades, f)
            
        except Exception as e:
            logger.error(f"Failed to store trade: {e}")
    
    def get_trades(
        self,
        symbol: str,
        start_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Retrieve trade history"""
        try:
            filename = f"{symbol.replace('/', '_')}_trades.json"
            filepath = self.data_dir / filename
            
            if not filepath.exists():
                return []
            
            with open(filepath, 'r') as f:
                trades = json.load(f)
            
            # Apply time filter
            if start_time:
                start_str = start_time.isoformat()
                trades = [t for t in trades if t['timestamp'] >= start_str]
            
            return trades[-limit:]
            
        except Exception as e:
            logger.error(f"Failed to retrieve trades: {e}")
            return []
    
    def get_price_history(
        self,
        symbol: str,
        interval: str = '1h',
        days: int = 30
    ) -> List[float]:
        """
        Get price history as simple list
        
        Args:
            symbol: Trading pair
            interval: Time interval
            days: Number of days of history
        
        Returns:
            List of closing prices
        """
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        candles = self.get_ohlcv(symbol, interval, start_time, end_time, limit=days * 24)
        
        return [candle['close'] for candle in candles]
    
    def calculate_statistics(
        self,
        symbol: str,
        interval: str = '1h',
        days: int = 30
    ) -> Dict[str, Any]:
        """Calculate statistical metrics from historical data"""
        prices = self.get_price_history(symbol, interval, days)
        
        if not prices:
            return {
                'symbol': symbol,
                'error': 'No data available'
            }
        
        # Calculate basic statistics
        avg_price = sum(prices) / len(prices)
        max_price = max(prices)
        min_price = min(prices)
        
        # Calculate volatility (standard deviation)
        variance = sum((p - avg_price) ** 2 for p in prices) / len(prices)
        volatility = variance ** 0.5
        
        # Calculate returns
        returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]
        avg_return = sum(returns) / len(returns) if returns else 0
        
        return {
            'symbol': symbol,
            'interval': interval,
            'days': days,
            'data_points': len(prices),
            'current_price': prices[-1],
            'average_price': round(avg_price, 2),
            'max_price': round(max_price, 2),
            'min_price': round(min_price, 2),
            'volatility': round(volatility, 2),
            'average_return': round(avg_return * 100, 4),
            'price_change': round(((prices[-1] - prices[0]) / prices[0]) * 100, 2),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def cleanup_old_data(self, days_to_keep: int = 90):
        """Remove historical data older than specified days"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(days=days_to_keep)
            cutoff_ts = int(cutoff_time.timestamp() * 1000)
            
            files_cleaned = 0
            
            for filepath in self.data_dir.glob('*.json'):
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                    
                    if isinstance(data, list) and data and 'timestamp' in data[0]:
                        # Filter old data
                        filtered_data = [d for d in data if d['timestamp'] >= cutoff_ts]
                        
                        if len(filtered_data) < len(data):
                            with open(filepath, 'w') as f:
                                json.dump(filtered_data, f)
                            
                            files_cleaned += 1
                            logger.info(f"Cleaned {filepath.name}: {len(data)} -> {len(filtered_data)} records")
                
                except Exception as e:
                    logger.error(f"Failed to clean {filepath}: {e}")
            
            logger.info(f"Cleanup complete: {files_cleaned} files processed")
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
