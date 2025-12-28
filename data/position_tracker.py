"""
Position Tracker
Manages active trading positions and P&L calculations
"""

import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class PositionTracker:
    """
    Tracks active trading positions and calculates P&L
    Persists positions to disk for recovery
    """
    
    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize Position Tracker
        
        Args:
            data_dir: Directory for persisting position data
        """
        self.data_dir = data_dir or Path('data/positions')
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.positions = {}
        self.closed_positions = []
        
        self._load_positions()
        
        logger.info(f"Position Tracker initialized with {len(self.positions)} active positions")
    
    def open_position(
        self,
        symbol: str,
        side: str,
        quantity: float,
        entry_price: float,
        order_id: str
    ) -> Dict[str, Any]:
        """
        Open a new position or update existing
        
        Args:
            symbol: Trading pair
            side: 'BUY' or 'SELL'
            quantity: Position size
            entry_price: Entry price
            order_id: Associated order ID
        
        Returns:
            Position data
        """
        position_id = f"{symbol}_{int(datetime.now().timestamp() * 1000)}"
        
        if symbol in self.positions:
            # Update existing position
            return self._update_position(symbol, side, quantity, entry_price)
        
        # Create new position
        position = {
            'id': position_id,
            'symbol': symbol,
            'side': side,
            'quantity': quantity,
            'entry_price': entry_price,
            'current_price': entry_price,
            'unrealized_pnl': 0.0,
            'realized_pnl': 0.0,
            'orders': [order_id],
            'opened_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'status': 'open'
        }
        
        self.positions[symbol] = position
        self._save_positions()
        
        logger.info(f"Opened position: {symbol} {side} {quantity} @ {entry_price}")
        
        return position
    
    def close_position(
        self,
        symbol: str,
        exit_price: float,
        order_id: str
    ) -> Dict[str, Any]:
        """
        Close an active position
        
        Args:
            symbol: Trading pair
            exit_price: Exit price
            order_id: Closing order ID
        
        Returns:
            Closed position data with final P&L
        """
        if symbol not in self.positions:
            raise ValueError(f"No active position for {symbol}")
        
        position = self.positions[symbol]
        
        # Calculate final P&L
        if position['side'] == 'BUY':
            pnl = (exit_price - position['entry_price']) * position['quantity']
        else:
            pnl = (position['entry_price'] - exit_price) * position['quantity']
        
        position['exit_price'] = exit_price
        position['realized_pnl'] = pnl
        position['closed_at'] = datetime.utcnow().isoformat()
        position['status'] = 'closed'
        position['orders'].append(order_id)
        
        # Move to closed positions
        self.closed_positions.append(position)
        del self.positions[symbol]
        
        self._save_positions()
        
        logger.info(f"Closed position: {symbol} P&L: {pnl:.2f}")
        
        return position
    
    def update_price(self, symbol: str, current_price: float):
        """Update current price and unrealized P&L for a position"""
        if symbol not in self.positions:
            return
        
        position = self.positions[symbol]
        position['current_price'] = current_price
        
        # Calculate unrealized P&L
        if position['side'] == 'BUY':
            unrealized_pnl = (current_price - position['entry_price']) * position['quantity']
        else:
            unrealized_pnl = (position['entry_price'] - current_price) * position['quantity']
        
        position['unrealized_pnl'] = unrealized_pnl
        position['updated_at'] = datetime.utcnow().isoformat()
        
        self._save_positions()
    
    def get_position(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get active position for a symbol"""
        return self.positions.get(symbol)
    
    def get_all_positions(self) -> List[Dict[str, Any]]:
        """Get all active positions"""
        return list(self.positions.values())
    
    def get_closed_positions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get closed positions history"""
        return self.closed_positions[-limit:]
    
    def get_total_pnl(self) -> Dict[str, float]:
        """Calculate total P&L (realized + unrealized)"""
        realized = sum(p['realized_pnl'] for p in self.closed_positions)
        unrealized = sum(p['unrealized_pnl'] for p in self.positions.values())
        
        return {
            'realized': round(realized, 2),
            'unrealized': round(unrealized, 2),
            'total': round(realized + unrealized, 2)
        }
    
    def get_position_summary(self) -> Dict[str, Any]:
        """Get summary of all positions"""
        pnl = self.get_total_pnl()
        
        return {
            'active_positions': len(self.positions),
            'closed_positions': len(self.closed_positions),
            'total_pnl': pnl,
            'positions': list(self.positions.values()),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _update_position(
        self,
        symbol: str,
        side: str,
        quantity: float,
        price: float
    ) -> Dict[str, Any]:
        """Update existing position (averaging)"""
        position = self.positions[symbol]
        
        if position['side'] == side:
            # Add to position (average entry price)
            total_quantity = position['quantity'] + quantity
            total_cost = (position['quantity'] * position['entry_price']) + (quantity * price)
            position['entry_price'] = total_cost / total_quantity
            position['quantity'] = total_quantity
        else:
            # Reduce or reverse position
            if quantity >= position['quantity']:
                # Position closed or reversed
                pnl = abs(price - position['entry_price']) * position['quantity']
                position['realized_pnl'] += pnl
                
                if quantity > position['quantity']:
                    # Reverse position
                    position['quantity'] = quantity - position['quantity']
                    position['side'] = side
                    position['entry_price'] = price
                else:
                    # Close position
                    return self.close_position(symbol, price, 'update')
            else:
                # Partially close
                pnl = abs(price - position['entry_price']) * quantity
                position['realized_pnl'] += pnl
                position['quantity'] -= quantity
        
        position['updated_at'] = datetime.utcnow().isoformat()
        self._save_positions()
        
        return position
    
    def _save_positions(self):
        """Persist positions to disk"""
        try:
            positions_file = self.data_dir / 'positions.json'
            data = {
                'active': self.positions,
                'closed': self.closed_positions[-100:]  # Keep last 100 closed positions
            }
            
            with open(positions_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save positions: {e}")
    
    def _load_positions(self):
        """Load positions from disk"""
        try:
            positions_file = self.data_dir / 'positions.json'
            
            if positions_file.exists():
                with open(positions_file, 'r') as f:
                    data = json.load(f)
                
                self.positions = data.get('active', {})
                self.closed_positions = data.get('closed', [])
                
                logger.info(f"Loaded {len(self.positions)} positions from disk")
        except Exception as e:
            logger.error(f"Failed to load positions: {e}")
