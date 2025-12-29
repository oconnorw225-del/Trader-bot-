"""
NDAX Live Trading Client
Real NDAX exchange integration for live trading
Requires valid API credentials from .env file
"""

import os
import hmac
import hashlib
import time
from typing import Dict, Any
import logging
import requests

logger = logging.getLogger(__name__)


class NDAXLiveClient:
    """
    Live NDAX client for real trading
    This client connects to the NDAX production API
    
    IMPORTANT: This uses REAL MONEY. Only use with valid API credentials
    and after thorough testing in paper trading mode.
    
    Required Environment Variables:
        NDAX_API_KEY: Your NDAX API key
        NDAX_API_SECRET: Your NDAX API secret
        NDAX_USER_ID: Your NDAX user ID
        NDAX_ACCOUNT_ID: Your NDAX account ID
    """
    
    def __init__(self):
        """
        Initialize NDAX live client with credentials from environment
        
        Raises:
            ValueError: If required credentials are missing
        """
        # Load credentials from environment
        self.api_key = os.getenv('NDAX_API_KEY')
        self.api_secret = os.getenv('NDAX_API_SECRET')
        self.user_id = os.getenv('NDAX_USER_ID')
        self.account_id = os.getenv('NDAX_ACCOUNT_ID')
        
        # Validate credentials
        if not all([self.api_key, self.api_secret, self.user_id, self.account_id]):
            raise ValueError(
                "Missing NDAX API credentials. Please add the following to your .env file:\n"
                "  NDAX_API_KEY=your_api_key_here\n"
                "  NDAX_API_SECRET=your_api_secret_here\n"
                "  NDAX_USER_ID=your_user_id_here\n"
                "  NDAX_ACCOUNT_ID=your_account_id_here\n"
                "\nSee NDAX_TRADING_SETUP.md for instructions on obtaining these credentials."
            )
        
        # NDAX Production API endpoints
        self.base_url = os.getenv('NDAX_BASE_URL', 'https://api.ndax.io')
        
        logger.info("⚠️  NDAX Live Client initialized - REAL TRADING MODE")
        logger.info(f"Connected to: {self.base_url}")
        logger.info(f"User ID: {self.user_id}")
        logger.info(f"Account ID: {self.account_id}")
    
    def get_platform_info(self) -> Dict[str, Any]:
        """
        Returns platform information and configuration
        
        Returns:
            dict: Platform details including exchange name, mode, and available pairs
        """
        return {
            "exchange": "NDAX",
            "mode": "LIVE",
            "pairs": ["BTC/CAD", "ETH/CAD", "BTC/USD", "ETH/USD"],
            "rate_limit": "safe",
            "api_configured": True,
            "user_id": self.user_id,
            "account_id": self.account_id
        }
    
    def get_balance(self) -> Dict[str, float]:
        """
        Get live account balances from NDAX
        
        Returns:
            dict: Current balances for each currency
            
        Raises:
            requests.RequestException: If API call fails
        """
        try:
            nonce = str(int(time.time() * 1000))
            endpoint = '/api/GetAccountPositions'
            signature = self._generate_signature(endpoint, nonce)
            
            headers = {
                'APIKey': self.api_key,
                'Signature': signature,
                'Nonce': nonce
            }
            
            params = {
                'AccountId': int(self.account_id),
                'OMSId': 1
            }
            
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=headers,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            # Parse response and convert to balance dictionary
            positions = response.json()
            balances = {}
            
            for position in positions:
                product_symbol = position.get('ProductSymbol', '')
                amount = float(position.get('Amount', 0.0))
                balances[product_symbol] = amount
            
            logger.info(f"Retrieved balances for {len(balances)} currencies")
            return balances
            
        except requests.RequestException as e:
            logger.error(f"Failed to retrieve balances from NDAX: {e}")
            raise
        except (ValueError, KeyError) as e:
            logger.error(f"Failed to parse balance response: {e}")
            # Return empty balances on parse error
            return {
                "CAD": 0.0,
                "BTC": 0.0,
                "ETH": 0.0
            }
    
    def get_price(self, pair: str) -> float:
        """
        Get current market price for a trading pair
        
        Args:
            pair: Trading pair (e.g., "BTC/CAD")
        
        Returns:
            float: Current market price
            
        Raises:
            requests.RequestException: If API call fails
        """
        try:
            # NDAX uses instrument IDs instead of pair names
            instrument_id = self._get_instrument_id(pair)
            
            endpoint = '/api/GetLevel1'
            params = {
                'InstrumentId': instrument_id,
                'OMSId': 1
            }
            
            response = requests.get(
                f"{self.base_url}{endpoint}",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            last_price = float(data.get('LastTradedPx', 0.0))
            
            logger.info(f"Retrieved price for {pair}: {last_price}")
            return last_price
            
        except requests.RequestException as e:
            logger.error(f"Failed to retrieve price for {pair}: {e}")
            raise
        except (ValueError, KeyError) as e:
            logger.error(f"Failed to parse price response for {pair}: {e}")
            return 0.0
    
    def place_order(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """
        Place a live order on NDAX
        
        Args:
            order: Order details including symbol, side, quantity, price
                   Required keys: 'symbol', 'side', 'quantity', 'price'
                   Optional keys: 'order_type' (default: 'Limit'), 'time_in_force' (default: 'GTC')
        
        IMPORTANT: This uses REAL MONEY
        
        Returns:
            dict: Order execution result with status, order_id, and any error messages
            
        Raises:
            ValueError: If required order fields are missing
            requests.RequestException: If API call fails
        """
        # Validate required fields
        required_fields = ['symbol', 'side', 'quantity', 'price']
        missing_fields = [field for field in required_fields if field not in order]
        if missing_fields:
            raise ValueError(f"Missing required order fields: {', '.join(missing_fields)}")
        
        try:
            nonce = str(int(time.time() * 1000))
            endpoint = '/api/SendOrder'
            
            # Build order payload
            order_payload = {
                'InstrumentId': self._get_instrument_id(order['symbol']),
                'OMSId': 1,
                'AccountId': int(self.account_id),
                'Side': order['side'].lower(),  # 'buy' or 'sell'
                'OrderType': order.get('order_type', 'Limit'),
                'Quantity': float(order['quantity']),
                'LimitPrice': float(order['price']),
                'TimeInForce': order.get('time_in_force', 'GTC'),
            }
            
            # Generate signature for authentication
            signature = self._generate_signature(endpoint + str(order_payload), nonce)
            
            headers = {
                'APIKey': self.api_key,
                'Signature': signature,
                'Nonce': nonce,
                'Content-Type': 'application/json'
            }
            
            logger.warning(f"⚠️  PLACING LIVE ORDER: {order['side']} {order['quantity']} {order['symbol']} @ {order['price']}")
            
            response = requests.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                json=order_payload,
                timeout=10
            )
            response.raise_for_status()
            
            result = response.json()
            order_id = result.get('OrderId', None)
            status = result.get('status', 'Unknown')
            error_msg = result.get('errormsg', '')
            
            if status == 'Accepted':
                logger.info(f"✅ Order placed successfully. Order ID: {order_id}")
            else:
                logger.error(f"❌ Order placement failed. Status: {status}, Error: {error_msg}")
            
            return {
                'success': status == 'Accepted',
                'order_id': order_id,
                'status': status,
                'error': error_msg,
                'timestamp': int(time.time())
            }
            
        except requests.RequestException as e:
            logger.error(f"Failed to place order on NDAX: {e}")
            raise
        except (ValueError, KeyError) as e:
            logger.error(f"Failed to build or parse order request: {e}")
            raise
    
    def _generate_signature(self, message: str, nonce: str) -> str:
        """
        Generate HMAC-SHA256 signature for NDAX API authentication
        
        Args:
            message: Message to sign
            nonce: Unique nonce for this request
        
        Returns:
            str: HMAC-SHA256 signature
        """
        full_message = nonce + message
        signature = hmac.new(
            self.api_secret.encode('utf-8'),
            full_message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _get_instrument_id(self, pair: str) -> int:
        """
        Map trading pair to NDAX instrument ID
        
        Args:
            pair: Trading pair (e.g., "BTC/CAD")
        
        Returns:
            int: NDAX instrument ID
        """
        # NDAX instrument IDs (verify these with NDAX API documentation)
        instruments = {
            'BTC/CAD': 1,
            'ETH/CAD': 2,
            'BTC/USD': 7,
            'ETH/USD': 8,
            'USDT/CAD': 3,
            'XRP/CAD': 5,
            'LTC/CAD': 6,
        }
        
        if pair not in instruments:
            logger.warning(f"Unknown trading pair: {pair}, defaulting to BTC/CAD")
            return 1
        
        return instruments[pair]
