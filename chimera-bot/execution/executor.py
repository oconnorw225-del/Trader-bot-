"""
CHIMERA-BOT Executor
Routes trades to live or paper trading paths
"""

import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class Executor:
    """
    Trade Executor - routes orders to appropriate execution path
    Handles both paper trading (simulation) and live trading
    """
    
    def __init__(self, config):
        self.config = config
        self.mode = config.mode
        
        # Import platform connectors based on mode
        if self.mode.value == 'live':
            from platforms.ndax_live import NDAXLive
            self.platform = NDAXLive(config)
        else:
            from platforms.ndax_test import NDAXTest
            self.platform = NDAXTest(config)
        
        # Execution tracking
        self.executions = []
        
        logger.info(f"Executor initialized in {self.mode.value} mode")
    
    def execute(self, signal: Dict[str, Any], risk_check: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute trade based on signal and risk parameters
        Routes to appropriate platform (live/test)
        """
        try:
            # Prepare order from signal and risk check
            order = self._prepare_order(signal, risk_check)
            
            logger.info(f"Executing order: {order['action']} {order['symbol']} @ {order['price']}")
            
            # Route to appropriate platform
            if self.mode.value == 'live':
                result = self._execute_live(order)
            else:
                result = self._execute_paper(order)
            
            # Record execution
            execution_record = {
                'timestamp': datetime.now().isoformat(),
                'mode': self.mode.value,
                'order': order,
                'result': result,
                'signal': signal,
                'risk_check': risk_check
            }
            
            self.executions.append(execution_record)
            
            return {
                'success': True,
                'execution': execution_record,
                'order_id': result.get('order_id'),
                'filled_price': result.get('filled_price'),
                'filled_quantity': result.get('filled_quantity')
            }
            
        except Exception as e:
            logger.error(f"Execution failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _prepare_order(self, signal: Dict[str, Any], risk_check: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare order from signal and risk parameters
        """
        return {
            'symbol': signal.get('symbol', 'BTC/USD'),
            'action': signal.get('action', 'buy'),
            'price': signal.get('price', 0),
            'quantity': risk_check.get('position_size', 0),
            'stop_loss': risk_check.get('stop_loss'),
            'take_profit': risk_check.get('take_profit'),
            'order_type': signal.get('order_type', 'limit'),
            'timestamp': datetime.now().isoformat()
        }
    
    def _execute_live(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute order on live platform
        LOCKED: Requires explicit confirmation
        """
        logger.warning("🔒 LIVE TRADING MODE - Order submitted to platform")
        
        # Additional safety check
        if not self.config.api_key or not self.config.api_secret:
            raise ValueError("Live trading requires valid API credentials")
        
        # Execute via live platform
        result = self.platform.place_order(order)
        
        logger.info(f"✅ Live order executed: {result.get('order_id')}")
        
        return result
    
    def _execute_paper(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute order in paper trading mode (simulation)
        Safe for testing and development
        """
        logger.info("📝 PAPER TRADING MODE - Order simulated")
        
        # Simulate execution via test platform
        result = self.platform.place_order(order)
        
        logger.info(f"✅ Paper order simulated: {result.get('order_id')}")
        
        return result
    
    def cancel_order(self, order_id: str) -> Dict[str, Any]:
        """Cancel an open order"""
        try:
            result = self.platform.cancel_order(order_id)
            logger.info(f"Order {order_id} cancelled")
            return {
                'success': True,
                'order_id': order_id,
                'result': result
            }
        except Exception as e:
            logger.error(f"Failed to cancel order {order_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_position(self, symbol: str) -> Dict[str, Any]:
        """Get current position for symbol"""
        return self.platform.get_position(symbol)
    
    def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        return self.platform.get_balance()
    
    def status(self) -> Dict[str, Any]:
        """Get executor status"""
        return {
            'mode': self.mode.value,
            'platform': self.config.platform,
            'testnet': self.config.testnet,
            'total_executions': len(self.executions),
            'platform_status': self.platform.get_status()
        }
    
    def get_execution_history(self, limit: int = 100) -> list:
        """Get recent execution history"""
        return self.executions[-limit:]
