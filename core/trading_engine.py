"""
Trading Engine Core Module
Handles order execution, position management, and trading orchestration
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
import json

logger = logging.getLogger(__name__)


class TradingEngine:
    """
    Core trading engine for executing and managing trades
    Supports NDAX platform integration with demo mode fallback
    """
    
    def __init__(self, demo_mode: bool = True):
        """
        Initialize the trading engine
        
        Args:
            demo_mode: If True, simulates trading without real API calls
        """
        self.demo_mode = demo_mode
        self.api_key = os.getenv('NDAX_API_KEY')
        self.api_secret = os.getenv('NDAX_API_SECRET')
        self.user_id = os.getenv('NDAX_USER_ID')
        
        self.positions = {}
        self.orders = []
        self.trade_history = []
        
        # Configuration
        self.max_position_size = float(os.getenv('MAX_POSITION_SIZE', 10000))
        self.max_daily_loss = float(os.getenv('MAX_DAILY_LOSS', 1000))
        self.risk_level = os.getenv('RISK_LEVEL', 'moderate')
        
        # Performance tracking
        self.metrics = {
            'total_trades': 0,
            'successful_trades': 0,
            'failed_trades': 0,
            'total_pnl': 0.0,
            'daily_pnl': 0.0,
            'last_reset': datetime.now()
        }
        
        logger.info(f"Trading Engine initialized in {'DEMO' if demo_mode else 'LIVE'} mode")
    
    def execute_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = 'MARKET',
        price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Execute a trading order
        
        Args:
            symbol: Trading pair (e.g., 'BTC/USD')
            side: 'BUY' or 'SELL'
            quantity: Amount to trade
            order_type: 'MARKET' or 'LIMIT'
            price: Limit price (required for LIMIT orders)
        
        Returns:
            Order execution result
        """
        try:
            # Validate inputs
            if side not in ['BUY', 'SELL']:
                raise ValueError(f"Invalid side: {side}. Must be 'BUY' or 'SELL'")
            
            if order_type not in ['MARKET', 'LIMIT']:
                raise ValueError(f"Invalid order type: {order_type}")
            
            if order_type == 'LIMIT' and price is None:
                raise ValueError("Price is required for LIMIT orders")
            
            if quantity <= 0:
                raise ValueError("Quantity must be positive")
            
            # Check position limits
            if quantity > self.max_position_size:
                raise ValueError(f"Quantity exceeds maximum position size: {self.max_position_size}")
            
            # Check daily loss limit
            if self.metrics['daily_pnl'] < -self.max_daily_loss:
                raise ValueError(f"Daily loss limit reached: {self.max_daily_loss}")
            
            # Generate order ID
            order_id = f"order_{int(time.time() * 1000)}"
            
            if self.demo_mode:
                # Simulate order execution
                execution_price = price if price else self._get_demo_price(symbol)
                executed_qty = quantity
                status = 'FILLED'
                
                logger.info(f"DEMO: Executed {side} order for {quantity} {symbol} at {execution_price}")
            else:
                # Real order execution via NDAX API
                execution_price, executed_qty, status = self._execute_real_order(
                    symbol, side, quantity, order_type, price
                )
            
            # Create order record
            order = {
                'orderId': order_id,
                'symbol': symbol,
                'side': side,
                'quantity': quantity,
                'orderType': order_type,
                'price': price,
                'executionPrice': execution_price,
                'executedQty': executed_qty,
                'status': status,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            self.orders.append(order)
            self.metrics['total_trades'] += 1
            
            if status == 'FILLED':
                self.metrics['successful_trades'] += 1
                self._update_position(symbol, side, executed_qty, execution_price)
                self._record_trade(order)
            else:
                self.metrics['failed_trades'] += 1
            
            return order
            
        except Exception as e:
            logger.error(f"Order execution failed: {e}")
            self.metrics['failed_trades'] += 1
            raise
    
    def get_position(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get current position for a symbol"""
        return self.positions.get(symbol)
    
    def get_all_positions(self) -> List[Dict[str, Any]]:
        """Get all active positions"""
        return list(self.positions.values())
    
    def close_position(self, symbol: str) -> Dict[str, Any]:
        """Close an open position"""
        position = self.positions.get(symbol)
        
        if not position:
            raise ValueError(f"No open position for {symbol}")
        
        # Execute opposite side order to close position
        close_side = 'SELL' if position['side'] == 'BUY' else 'BUY'
        quantity = abs(position['quantity'])
        
        result = self.execute_order(symbol, close_side, quantity)
        
        # Remove position
        if result['status'] == 'FILLED':
            del self.positions[symbol]
            logger.info(f"Closed position for {symbol}")
        
        return result
    
    def get_order_history(self, symbol: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get order history"""
        orders = self.orders
        
        if symbol:
            orders = [o for o in orders if o['symbol'] == symbol]
        
        return orders[-limit:]
    
    def get_trade_history(self, symbol: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get trade history"""
        trades = self.trade_history
        
        if symbol:
            trades = [t for t in trades if t['symbol'] == symbol]
        
        return trades[-limit:]
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get trading metrics"""
        # Reset daily metrics if needed
        if datetime.now() - self.metrics['last_reset'] > timedelta(days=1):
            self.metrics['daily_pnl'] = 0.0
            self.metrics['last_reset'] = datetime.now()
        
        return {
            **self.metrics,
            'active_positions': len(self.positions),
            'total_orders': len(self.orders),
            'success_rate': (
                self.metrics['successful_trades'] / self.metrics['total_trades']
                if self.metrics['total_trades'] > 0 else 0
            )
        }
    
    def _execute_real_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str,
        price: Optional[float]
    ) -> tuple[float, float, str]:
        """
        Execute real order via NDAX API
        
        Returns:
            Tuple of (execution_price, executed_quantity, status)
        
        NOTE: This is intentionally a stub for paper trading mode.
        Live NDAX API integration requires:
        - Valid NDAX API credentials in .env file
        - Implementation of SendOrder API endpoint (see platform/ndax_live.py)
        - Legal compliance and regulatory approval (see LIVE_TRADING_READINESS.md)
        
        For live trading implementation, refer to:
        - LIVE_TRADING_SETUP_GUIDE.md
        - platform/ndax_live.py - NDAXLiveClient class
        """
        logger.warning("Real NDAX API not implemented, using paper trading demo mode")
        return self._get_demo_price(symbol), quantity, 'FILLED'
    
    def _get_demo_price(self, symbol: str) -> float:
        """Get demo price for a symbol"""
        # Simple price simulation
        base_prices = {
            'BTC/USD': 50000.00,
            'ETH/USD': 3000.00,
            'BTC/CAD': 67500.00,
            'ETH/CAD': 4050.00
        }
        
        base_price = base_prices.get(symbol, 100.00)
        # Add small random variation
        import random
        variation = random.uniform(-0.01, 0.01)
        return round(base_price * (1 + variation), 2)
    
    def _update_position(self, symbol: str, side: str, quantity: float, price: float):
        """Update position tracking"""
        if symbol not in self.positions:
            self.positions[symbol] = {
                'symbol': symbol,
                'side': side,
                'quantity': quantity if side == 'BUY' else -quantity,
                'entry_price': price,
                'current_price': price,
                'pnl': 0.0,
                'opened_at': datetime.utcnow().isoformat()
            }
        else:
            # Update existing position
            position = self.positions[symbol]
            new_qty = position['quantity'] + (quantity if side == 'BUY' else -quantity)
            
            if new_qty == 0:
                # Position closed
                del self.positions[symbol]
            else:
                # Update position
                position['quantity'] = new_qty
                position['side'] = 'BUY' if new_qty > 0 else 'SELL'
                # Update weighted average entry price
                total_value = abs(position['quantity']) * position['entry_price'] + quantity * price
                position['entry_price'] = total_value / (abs(position['quantity']) + quantity)
    
    def _record_trade(self, order: Dict[str, Any]):
        """Record completed trade"""
        trade = {
            'id': order['orderId'],
            'symbol': order['symbol'],
            'side': order['side'],
            'quantity': order['executedQty'],
            'price': order['executionPrice'],
            'total': order['executedQty'] * order['executionPrice'],
            'timestamp': order['timestamp']
        }
        
        self.trade_history.append(trade)
        
        # Update daily P&L (simplified)
        if order['side'] == 'SELL':
            # Calculate profit on sell (simplified)
            position = self.positions.get(order['symbol'])
            if position:
                pnl = (order['executionPrice'] - position['entry_price']) * order['executedQty']
                self.metrics['daily_pnl'] += pnl
                self.metrics['total_pnl'] += pnl
    
    def update_position_prices(self, market_data: Dict[str, float]):
        """Update current prices for all positions"""
        for symbol, position in self.positions.items():
            if symbol in market_data:
                position['current_price'] = market_data[symbol]
                # Calculate unrealized P&L
                price_diff = position['current_price'] - position['entry_price']
                position['pnl'] = price_diff * abs(position['quantity'])
