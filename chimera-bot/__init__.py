"""
CHIMERA-BOT Package
Modular trading bot with risk management
"""

__version__ = "1.0.0"
__author__ = "Chimera Team"

from .config import Config, TradingMode, RiskLevel
from .main import ChimeraBot

__all__ = [
    'Config',
    'TradingMode',
    'RiskLevel',
    'ChimeraBot'
]
