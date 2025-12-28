"""
Environment Manager - Handles all environment variables and secrets
"""

import os
import logging
from typing import Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)


class EnvironmentManager:
    """
    Centralized environment variable management
    Handles Railway secrets, GitHub secrets, and local .env files
    """
    
    def __init__(self):
        self.env_loaded = False
        self.secrets = {}
        self._load_environment()
    
    def _load_environment(self):
        """Load environment variables from multiple sources"""
        # Load from .env files
        env_files = [
            '.env',
            '.env.local',
            '.env.production'
        ]
        
        for env_file in env_files:
            if Path(env_file).exists():
                load_dotenv(env_file, override=True)
                logger.info(f"Loaded environment from {env_file}")
        
        # Railway environment variables are automatically available in os.environ
        if os.getenv('RAILWAY_ENVIRONMENT'):
            logger.info("Running on Railway - using Railway environment variables")
        
        self.env_loaded = True
    
    def get(self, key: str, default: Any = None, required: bool = False) -> Any:
        """Get environment variable with validation"""
        value = os.getenv(key, default)
        
        if required and value is None:
            raise EnvironmentError(f"Required environment variable '{key}' is not set")
        
        return value
    
    def get_ndax_credentials(self) -> Dict[str, str]:
        """Get NDAX API credentials"""
        return {
            'api_key': self.get('NDAX_API_KEY', required=True),
            'api_secret': self.get('NDAX_API_SECRET', required=True),
            'user_id': self.get('NDAX_USER_ID', required=True),
            'account_id': self.get('NDAX_ACCOUNT_ID', required=True),
            'base_url': self.get('NDAX_BASE_URL', 'https://api.ndax.io')
        }
    
    def get_database_config(self) -> Dict[str, str]:
        """Get database configuration"""
        return {
            'url': self.get('DATABASE_URL'),
            'redis_url': self.get('REDIS_URL'),
            'postgres_user': self.get('POSTGRES_USER', 'ndax'),
            'postgres_password': self.get('POSTGRES_PASSWORD')
        }
    
    def get_security_config(self) -> Dict[str, str]:
        """Get security configuration"""
        return {
            'session_secret': self.get('SESSION_SECRET', required=True),
            'jwt_secret': self.get('JWT_SECRET', required=True),
            'encryption_key': self.get('ENCRYPTION_KEY', required=True),
            'access_password': self.get('ACCESS_PASSWORD', required=True)
        }
    
    def get_trading_config(self) -> Dict[str, Any]:
        """Get trading configuration"""
        return {
            'mode': self.get('TRADING_MODE', 'paper'),
            'use_live': self.get('USE_LIVE_TRADING', 'false').lower() == 'true',
            'testnet': self.get('TESTNET', 'true').lower() == 'true',
            'safety_lock': self.get('SAFETY_LOCK', 'true').lower() == 'true',
            'risk_level': self.get('RISK_LEVEL', 'moderate'),
            'max_position_size': float(self.get('MAX_POSITION_SIZE', 0.1)),
            'max_daily_loss': float(self.get('MAX_DAILY_LOSS', 0.05)),
            'max_trades_per_day': int(self.get('MAX_TRADES_PER_DAY', 20))
        }
    
    def validate_required_secrets(self) -> bool:
        """Validate all required secrets are present"""
        required = [
            'NDAX_API_KEY',
            'NDAX_API_SECRET',
            'NDAX_USER_ID',
            'NDAX_ACCOUNT_ID',
            'SESSION_SECRET',
            'JWT_SECRET',
            'ENCRYPTION_KEY'
        ]
        
        missing = [key for key in required if not os.getenv(key)]
        
        if missing:
            logger.error(f"Missing required environment variables: {', '.join(missing)}")
            return False
        
        logger.info("✅ All required secrets are present")
        return True
    
    def get_all_config(self) -> Dict[str, Any]:
        """Get complete configuration"""
        return {
            'ndax': self.get_ndax_credentials(),
            'database': self.get_database_config(),
            'security': self.get_security_config(),
            'trading': self.get_trading_config(),
            'environment': {
                'node_env': self.get('NODE_ENV', 'production'),
                'railway': self.get('RAILWAY_ENVIRONMENT') is not None,
                'port': int(self.get('PORT', 3000)),
                'python_port': int(self.get('PYTHON_BACKEND_PORT', 8000))
            }
        }


# Global instance
env_manager = EnvironmentManager()
