"""
CHIMERA-BOT NDAX Test Platform
Safe test/paper trading paths
"""

import logging
import uuid
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class NDAXTest:
    """
    NDAX Test Platform Connector
    Provides paper trading simulation for NDAX exchange
    Safe for testing and development
    """
    
    def __init__(self, config):
        self.config = config
        self.testnet = True  # Always use testnet
        
        # Paper trading state
        self.paper_balance = {
            'USD': 10000.0,  # $10k starting balance
            'BTC': 0.0,
            'ETH': 0.0
        }
        
        self.paper_positions = []
        self.paper_orders = []
        
        logger.info("NDAX Test Platform initialized (PAPER TRADING)")
    
    def place_order(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate order placement
        Returns simulated execution result
        """
        order_id = str(uuid.uuid4())
        
        # Simulate order execution
        simulated_order = {
            'order_id': order_id,
            'symbol': order.get('symbol', 'BTC/USD'),
            'action': order.get('action', 'buy'),
            'price': order.get('price', 0),
            'quantity': order.get('quantity', 0),
            'order_type': order.get('order_type', 'limit'),
            'status': 'filled',
            'filled_price': order.get('price', 0),
            'filled_quantity': order.get('quantity', 0),
            'timestamp': datetime.now().isoformat(),
            'mode': 'paper'
        }
        
        # Update paper balance
        self._update_paper_balance(simulated_order)
        
        # Store order
        self.paper_orders.append(simulated_order)
        
        logger.info(f"📝 Paper order filled: {simulated_order['order_id']}")
        
        return simulated_order
    
    def cancel_order(self, order_id: str) -> Dict[str, Any]:
        """Cancel a paper order"""
        for order in self.paper_orders:
            if order['order_id'] == order_id and order['status'] == 'open':
                order['status'] = 'cancelled'
                logger.info(f"Paper order {order_id} cancelled")
                return {
                    'success': True,
                    'order_id': order_id,
                    'status': 'cancelled'
                }
        
        return {
            'success': False,
            'error': 'Order not found or already filled'
        }
    
    def get_position(self, symbol: str) -> Dict[str, Any]:
        """Get current paper position for symbol"""
        base_asset = symbol.split('/')[0]
        
        return {
            'symbol': symbol,
            'quantity': self.paper_balance.get(base_asset, 0),
            'mode': 'paper'
        }
    
    def get_balance(self) -> Dict[str, Any]:
        """Get paper trading balance"""
        total_value = self._calculate_portfolio_value()
        
        return {
            'balances': self.paper_balance,
            'total_value_usd': total_value,
            'mode': 'paper',
            'timestamp': datetime.now().isoformat()
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get platform status"""
        return {
            'platform': 'ndax',
            'mode': 'test',
            'connected': True,
            'testnet': True,
            'total_orders': len(self.paper_orders),
            'open_positions': len(self.paper_positions)
        }
    
    def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """
        Get simulated market data
        In production, this would connect to real NDAX API
        """
        # Simulated prices
        prices = {
            'BTC/USD': 45000.0,
            'ETH/USD': 2500.0,
            'LTC/USD': 100.0
        }
        
        base_price = prices.get(symbol, 1000.0)
        
        return {
            'symbol': symbol,
            'bid': base_price * 0.999,
            'ask': base_price * 1.001,
            'last': base_price,
            'volume': 1000000,
            'timestamp': datetime.now().isoformat(),
            'mode': 'simulated'
        }
    
    def _update_paper_balance(self, order: Dict[str, Any]):
        """Update paper balance after order execution"""
        symbol = order['symbol']
        action = order['action']
        price = order['filled_price']
        quantity = order['filled_quantity']
        
        # Parse symbol
        base_asset, quote_asset = symbol.split('/')
        
        if action == 'buy':
            # Deduct quote currency, add base currency
            cost = price * quantity
            self.paper_balance[quote_asset] -= cost
            self.paper_balance[base_asset] = self.paper_balance.get(base_asset, 0) + quantity
            
        elif action == 'sell':
            # Add quote currency, deduct base currency
            proceeds = price * quantity
            self.paper_balance[quote_asset] += proceeds
            self.paper_balance[base_asset] -= quantity
        
        logger.info(f"Paper balance updated: {self.paper_balance}")
    
    def _calculate_portfolio_value(self) -> float:
        """Calculate total portfolio value in USD"""
        # Simple calculation - in production would use real prices
        total = self.paper_balance.get('USD', 0)
        total += self.paper_balance.get('BTC', 0) * 45000  # Assume BTC @ $45k
        total += self.paper_balance.get('ETH', 0) * 2500   # Assume ETH @ $2.5k
        
        return total
    
    def get_order_history(self, limit: int = 100) -> list:
        """Get paper order history"""
        return self.paper_orders[-limit:]
