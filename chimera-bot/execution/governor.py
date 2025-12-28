"""
CHIMERA-BOT Governor
Risk wrapper implementing safety rules and position management
"""

import logging
from typing import Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class Governor:
    """
    Risk Governor - enforces trading rules and position limits
    Acts as a gatekeeper before any trade is executed
    """
    
    def __init__(self, config):
        self.config = config
        
        # Track daily metrics
        self.daily_trades = 0
        self.daily_loss = 0.0
        self.open_positions = 0
        self.last_reset = datetime.now().date()
        
        # Position tracking
        self.positions = []
        self.trade_history = []
        
        logger.info("Governor initialized with risk level: %s", config.risk_level.value)
    
    def evaluate(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate trading signal against risk rules
        Returns approval decision with reasoning
        """
        # Reset daily counters if new day
        self._check_daily_reset()
        
        # Run all risk checks
        checks = [
            self._check_daily_trade_limit(signal),
            self._check_daily_loss_limit(signal),
            self._check_position_limit(signal),
            self._check_position_size(signal),
            self._check_signal_quality(signal)
        ]
        
        # If any check fails, reject the trade
        for check in checks:
            if not check['passed']:
                logger.warning(f"Trade rejected: {check['reason']}")
                return {
                    'approved': False,
                    'reason': check['reason'],
                    'details': check,
                    'timestamp': datetime.now().isoformat()
                }
        
        # All checks passed
        logger.info("Trade approved by governor")
        return {
            'approved': True,
            'reason': 'all_risk_checks_passed',
            'checks': checks,
            'position_size': self._calculate_position_size(signal),
            'stop_loss': self._calculate_stop_loss(signal),
            'take_profit': self._calculate_take_profit(signal),
            'timestamp': datetime.now().isoformat()
        }
    
    def _check_daily_reset(self):
        """Reset daily counters if new day"""
        today = datetime.now().date()
        if today > self.last_reset:
            logger.info("Resetting daily counters")
            self.daily_trades = 0
            self.daily_loss = 0.0
            self.last_reset = today
    
    def _check_daily_trade_limit(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Check if daily trade limit is exceeded"""
        if self.daily_trades >= self.config.max_trades_per_day:
            return {
                'passed': False,
                'check': 'daily_trade_limit',
                'reason': f'Daily trade limit reached ({self.config.max_trades_per_day})',
                'current': self.daily_trades,
                'limit': self.config.max_trades_per_day
            }
        
        return {
            'passed': True,
            'check': 'daily_trade_limit',
            'current': self.daily_trades,
            'limit': self.config.max_trades_per_day
        }
    
    def _check_daily_loss_limit(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Check if daily loss limit is exceeded"""
        if self.daily_loss >= self.config.max_daily_loss:
            return {
                'passed': False,
                'check': 'daily_loss_limit',
                'reason': f'Daily loss limit reached ({self.config.max_daily_loss * 100}%)',
                'current': self.daily_loss,
                'limit': self.config.max_daily_loss
            }
        
        return {
            'passed': True,
            'check': 'daily_loss_limit',
            'current': self.daily_loss,
            'limit': self.config.max_daily_loss
        }
    
    def _check_position_limit(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Check if maximum open positions limit is exceeded"""
        if self.open_positions >= self.config.max_open_positions:
            return {
                'passed': False,
                'check': 'position_limit',
                'reason': f'Maximum open positions reached ({self.config.max_open_positions})',
                'current': self.open_positions,
                'limit': self.config.max_open_positions
            }
        
        return {
            'passed': True,
            'check': 'position_limit',
            'current': self.open_positions,
            'limit': self.config.max_open_positions
        }
    
    def _check_position_size(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Check if proposed position size is within limits"""
        proposed_size = signal.get('position_size', 0)
        
        if proposed_size > self.config.max_position_size:
            return {
                'passed': False,
                'check': 'position_size',
                'reason': f'Position size exceeds limit ({self.config.max_position_size * 100}%)',
                'proposed': proposed_size,
                'limit': self.config.max_position_size
            }
        
        return {
            'passed': True,
            'check': 'position_size',
            'proposed': proposed_size,
            'limit': self.config.max_position_size
        }
    
    def _check_signal_quality(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Check if trading signal meets quality thresholds"""
        confidence = signal.get('confidence', 0)
        min_confidence = 0.6  # Minimum 60% confidence
        
        if confidence < min_confidence:
            return {
                'passed': False,
                'check': 'signal_quality',
                'reason': f'Signal confidence below threshold ({min_confidence * 100}%)',
                'confidence': confidence,
                'threshold': min_confidence
            }
        
        return {
            'passed': True,
            'check': 'signal_quality',
            'confidence': confidence,
            'threshold': min_confidence
        }
    
    def _calculate_position_size(self, signal: Dict[str, Any]) -> float:
        """Calculate appropriate position size based on risk level"""
        base_size = signal.get('position_size', self.config.max_position_size)
        confidence = signal.get('confidence', 0.5)
        
        # Adjust size based on confidence
        adjusted_size = base_size * confidence
        
        # Ensure within limits
        return min(adjusted_size, self.config.max_position_size)
    
    def _calculate_stop_loss(self, signal: Dict[str, Any]) -> float:
        """Calculate stop loss price"""
        entry_price = signal.get('price', 0)
        return entry_price * (1 - self.config.stop_loss_percent)
    
    def _calculate_take_profit(self, signal: Dict[str, Any]) -> float:
        """Calculate take profit price"""
        entry_price = signal.get('price', 0)
        return entry_price * (1 + self.config.take_profit_percent)
    
    def record_trade(self, trade: Dict[str, Any]):
        """Record executed trade for tracking"""
        self.daily_trades += 1
        self.trade_history.append({
            'timestamp': datetime.now().isoformat(),
            'trade': trade
        })
        
        if trade.get('action') == 'buy':
            self.open_positions += 1
        elif trade.get('action') == 'sell':
            self.open_positions = max(0, self.open_positions - 1)
            
            # Track profit/loss
            pnl = trade.get('pnl', 0)
            if pnl < 0:
                self.daily_loss += abs(pnl)
        
        logger.info(f"Trade recorded: {self.daily_trades}/{self.config.max_trades_per_day} today")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current governor statistics"""
        return {
            'daily_trades': self.daily_trades,
            'daily_loss': self.daily_loss,
            'open_positions': self.open_positions,
            'trades_remaining': self.config.max_trades_per_day - self.daily_trades,
            'loss_remaining': self.config.max_daily_loss - self.daily_loss,
            'positions_available': self.config.max_open_positions - self.open_positions,
            'last_reset': self.last_reset.isoformat()
        }
