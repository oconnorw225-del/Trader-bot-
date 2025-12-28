"""
CHIMERA-BOT Configuration
Risk management and mode settings
"""

import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum


class TradingMode(Enum):
    """Trading mode enumeration"""
    PAPER = "paper"
    LIVE = "live"
    TEST = "test"


class RiskLevel(Enum):
    """Risk level enumeration"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


@dataclass
class Config:
    """
    Main configuration for ChimeraBot
    Handles risk parameters and mode settings
    """
    
    # Trading mode
    mode: TradingMode = TradingMode.PAPER
    
    # Risk management
    risk_level: RiskLevel = RiskLevel.MODERATE
    max_position_size: float = 0.1  # 10% of portfolio
    max_daily_loss: float = 0.05  # 5% of portfolio
    stop_loss_percent: float = 0.02  # 2% stop loss
    take_profit_percent: float = 0.05  # 5% take profit
    
    # Position limits
    max_open_positions: int = 5
    max_trades_per_day: int = 20
    
    # Platform configuration
    platform: str = "ndax"
    testnet: bool = True
    
    # API credentials (loaded from environment)
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    user_id: Optional[str] = None
    account_id: Optional[str] = None
    
    # Reporting
    reporting_interval: int = 3600  # 1 hour in seconds
    log_level: str = "INFO"
    
    @classmethod
    def from_env(cls) -> 'Config':
        """
        Load configuration from environment variables
        Provides sensible defaults for all settings
        """
        # Determine trading mode
        mode_str = os.getenv('TRADING_MODE', 'paper').lower()
        try:
            mode = TradingMode(mode_str)
        except ValueError:
            mode = TradingMode.PAPER
        
        # Determine risk level
        risk_str = os.getenv('RISK_LEVEL', 'moderate').lower()
        try:
            risk_level = RiskLevel(risk_str)
        except ValueError:
            risk_level = RiskLevel.MODERATE
        
        # Risk parameters by level
        risk_params = cls._get_risk_params(risk_level)
        
        return cls(
            mode=mode,
            risk_level=risk_level,
            max_position_size=float(os.getenv('MAX_POSITION_SIZE', risk_params['max_position_size'])),
            max_daily_loss=float(os.getenv('MAX_DAILY_LOSS', risk_params['max_daily_loss'])),
            stop_loss_percent=float(os.getenv('STOP_LOSS_PERCENT', risk_params['stop_loss_percent'])),
            take_profit_percent=float(os.getenv('TAKE_PROFIT_PERCENT', risk_params['take_profit_percent'])),
            max_open_positions=int(os.getenv('MAX_OPEN_POSITIONS', risk_params['max_open_positions'])),
            max_trades_per_day=int(os.getenv('MAX_TRADES_PER_DAY', risk_params['max_trades_per_day'])),
            platform=os.getenv('PLATFORM', 'ndax'),
            testnet=os.getenv('TESTNET', 'true').lower() == 'true',
            api_key=os.getenv('NDAX_API_KEY'),
            api_secret=os.getenv('NDAX_API_SECRET'),
            user_id=os.getenv('NDAX_USER_ID'),
            account_id=os.getenv('NDAX_ACCOUNT_ID'),
            reporting_interval=int(os.getenv('REPORTING_INTERVAL', 3600)),
            log_level=os.getenv('LOG_LEVEL', 'INFO')
        )
    
    @staticmethod
    def _get_risk_params(risk_level: RiskLevel) -> Dict[str, Any]:
        """
        Get default risk parameters based on risk level
        """
        params = {
            RiskLevel.CONSERVATIVE: {
                'max_position_size': 0.05,  # 5% max
                'max_daily_loss': 0.02,  # 2% daily loss
                'stop_loss_percent': 0.01,  # 1% stop loss
                'take_profit_percent': 0.03,  # 3% take profit
                'max_open_positions': 3,
                'max_trades_per_day': 10
            },
            RiskLevel.MODERATE: {
                'max_position_size': 0.1,  # 10% max
                'max_daily_loss': 0.05,  # 5% daily loss
                'stop_loss_percent': 0.02,  # 2% stop loss
                'take_profit_percent': 0.05,  # 5% take profit
                'max_open_positions': 5,
                'max_trades_per_day': 20
            },
            RiskLevel.AGGRESSIVE: {
                'max_position_size': 0.2,  # 20% max
                'max_daily_loss': 0.1,  # 10% daily loss
                'stop_loss_percent': 0.03,  # 3% stop loss
                'take_profit_percent': 0.08,  # 8% take profit
                'max_open_positions': 10,
                'max_trades_per_day': 50
            }
        }
        
        return params[risk_level]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary (excluding sensitive data)"""
        return {
            'mode': self.mode.value,
            'risk_level': self.risk_level.value,
            'max_position_size': self.max_position_size,
            'max_daily_loss': self.max_daily_loss,
            'stop_loss_percent': self.stop_loss_percent,
            'take_profit_percent': self.take_profit_percent,
            'max_open_positions': self.max_open_positions,
            'max_trades_per_day': self.max_trades_per_day,
            'platform': self.platform,
            'testnet': self.testnet,
            'reporting_interval': self.reporting_interval,
            'log_level': self.log_level
        }
    
    def validate(self) -> bool:
        """
        Validate configuration
        Returns True if valid, raises ValueError if invalid
        """
        if self.max_position_size <= 0 or self.max_position_size > 1:
            raise ValueError("max_position_size must be between 0 and 1")
        
        if self.max_daily_loss <= 0 or self.max_daily_loss > 1:
            raise ValueError("max_daily_loss must be between 0 and 1")
        
        if self.max_open_positions <= 0:
            raise ValueError("max_open_positions must be positive")
        
        if self.max_trades_per_day <= 0:
            raise ValueError("max_trades_per_day must be positive")
        
        if self.mode == TradingMode.LIVE:
            if not self.api_key or not self.api_secret:
                raise ValueError("API credentials required for LIVE mode")
        
        return True
