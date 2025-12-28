"""
Real API Connectors for NDAX and Binance Exchanges
Supports both testnet and production environments
"""

import os
import time
import hmac
import hashlib
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class BaseExchangeConnector:
    """Base class for exchange connectors"""
    
    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self.connected = False
        self.session = requests.Session()
        
    def _generate_signature(self, params: Dict[str, Any], secret: str) -> str:
        """Generate HMAC SHA256 signature"""
        query_string = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        signature = hmac.new(
            secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
        
    def is_connected(self) -> bool:
        """Check if connector is connected"""
        return self.connected
        
    def disconnect(self):
        """Disconnect from exchange"""
        self.connected = False
        self.session.close()


class NDaxConnector(BaseExchangeConnector):
    """
    NDAX Exchange API Connector
    Documentation: https://ndaxlo.github.io/API/
    """
    
    def __init__(
        self, 
        api_key: str, 
        api_secret: str, 
        user_id: str,
        account_id: str,
        testnet: bool = True
    ):
        super().__init__(api_key, api_secret, testnet)
        self.user_id = user_id
        self.account_id = account_id
        
        # NDAX API endpoints
        if testnet:
            self.base_url = "https://api.ndax.io:8443/AP"  # Testnet
        else:
            self.base_url = "https://api.ndax.io/AP"  # Production
            
        logger.info(f"NDAX Connector initialized (testnet={testnet})")
        
    def connect(self) -> Dict[str, Any]:
        """Establish connection to NDAX"""
        try:
            # Test connection with a simple API call
            response = self._get_account_info()
            
            if response.get('success'):
                self.connected = True
                logger.info("Successfully connected to NDAX")
                return {
                    'success': True,
                    'exchange': 'ndax',
                    'testnet': self.testnet,
                    'account_id': self.account_id,
                }
            else:
                logger.error(f"Failed to connect to NDAX: {response.get('error')}")
                return {
                    'success': False,
                    'error': response.get('error', 'Connection failed'),
                }
                
        except Exception as e:
            logger.error(f"NDAX connection error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def _get_account_info(self) -> Dict[str, Any]:
        """Get account information"""
        try:
            endpoint = f"{self.base_url}/GetAccountInfo"
            payload = {
                'AccountId': self.account_id,
                'UserId': self.user_id,
            }
            
            response = self.session.get(endpoint, params=payload, timeout=10)
            response.raise_for_status()
            
            return {
                'success': True,
                'data': response.json(),
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
            
    def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/GetAccountPositions"
            payload = {
                'AccountId': self.account_id,
            }
            
            response = self.session.get(endpoint, params=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            balances = {}
            
            for position in data:
                currency = position.get('ProductSymbol', 'UNKNOWN')
                amount = float(position.get('Amount', 0))
                balances[currency] = amount
                
            return {
                'success': True,
                'balances': balances,
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"NDAX balance error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Place an order on NDAX
        
        Args:
            symbol: Trading pair (e.g., 'BTCUSD')
            side: 'buy' or 'sell'
            order_type: 'limit' or 'market'
            quantity: Order quantity
            price: Order price (required for limit orders)
        """
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/SendOrder"
            
            # NDAX order sides: 0=buy, 1=sell
            side_value = 0 if side.lower() == 'buy' else 1
            
            # NDAX order types: 1=market, 2=limit
            type_value = 1 if order_type.lower() == 'market' else 2
            
            payload = {
                'AccountId': self.account_id,
                'InstrumentId': self._get_instrument_id(symbol),
                'OrderType': type_value,
                'Side': side_value,
                'Quantity': quantity,
                'TimeInForce': 1,  # GTC (Good Till Cancel)
            }
            
            if order_type.lower() == 'limit' and price:
                payload['LimitPrice'] = price
                
            response = self.session.post(endpoint, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'success': True,
                'order_id': result.get('OrderId'),
                'status': result.get('OrderState'),
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"NDAX order error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def cancel_order(self, order_id: str) -> Dict[str, Any]:
        """Cancel an order"""
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/CancelOrder"
            payload = {
                'AccountId': self.account_id,
                'OrderId': order_id,
            }
            
            response = self.session.post(endpoint, json=payload, timeout=10)
            response.raise_for_status()
            
            return {
                'success': True,
                'order_id': order_id,
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"NDAX cancel error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status"""
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/GetOrderStatus"
            payload = {
                'AccountId': self.account_id,
                'OrderId': order_id,
            }
            
            response = self.session.get(endpoint, params=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'success': True,
                'order': data,
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"NDAX order status error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """Get market data for a symbol"""
        try:
            endpoint = f"{self.base_url}/GetLevel1"
            payload = {
                'InstrumentId': self._get_instrument_id(symbol),
            }
            
            response = self.session.get(endpoint, params=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'success': True,
                'symbol': symbol,
                'price': float(data.get('LastTradedPx', 0)),
                'bid': float(data.get('BestBid', 0)),
                'ask': float(data.get('BestOffer', 0)),
                'volume': float(data.get('Rolling24HrVolume', 0)),
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"NDAX market data error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def _get_instrument_id(self, symbol: str) -> int:
        """Convert symbol to NDAX instrument ID"""
        # Simplified mapping - in production, use GetInstruments API
        instrument_map = {
            'BTCUSD': 1,
            'BTCCAD': 4,
            'ETHUSD': 2,
            'ETHCAD': 5,
        }
        return instrument_map.get(symbol.upper(), 1)


class BinanceConnector(BaseExchangeConnector):
    """
    Binance Exchange API Connector
    Documentation: https://binance-docs.github.io/apidocs/spot/en/
    """
    
    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        super().__init__(api_key, api_secret, testnet)
        
        # Binance API endpoints
        if testnet:
            self.base_url = "https://testnet.binance.vision/api"
        else:
            self.base_url = "https://api.binance.com/api"
            
        self.session.headers.update({
            'X-MBX-APIKEY': api_key,
        })
        
        logger.info(f"Binance Connector initialized (testnet={testnet})")
        
    def connect(self) -> Dict[str, Any]:
        """Establish connection to Binance"""
        try:
            # Test connection with account info
            response = self._get_account_info()
            
            if response.get('success'):
                self.connected = True
                logger.info("Successfully connected to Binance")
                return {
                    'success': True,
                    'exchange': 'binance',
                    'testnet': self.testnet,
                }
            else:
                logger.error(f"Failed to connect to Binance: {response.get('error')}")
                return {
                    'success': False,
                    'error': response.get('error', 'Connection failed'),
                }
                
        except Exception as e:
            logger.error(f"Binance connection error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def _get_account_info(self) -> Dict[str, Any]:
        """Get account information"""
        try:
            endpoint = f"{self.base_url}/v3/account"
            timestamp = int(time.time() * 1000)
            
            params = {
                'timestamp': timestamp,
            }
            
            params['signature'] = self._generate_signature(params, self.api_secret)
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            return {
                'success': True,
                'data': response.json(),
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
            
    def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            account_info = self._get_account_info()
            
            if not account_info.get('success'):
                return account_info
                
            data = account_info['data']
            balances = {}
            
            for balance in data.get('balances', []):
                asset = balance['asset']
                free = float(balance['free'])
                locked = float(balance['locked'])
                total = free + locked
                
                if total > 0:
                    balances[asset] = {
                        'free': free,
                        'locked': locked,
                        'total': total,
                    }
                    
            return {
                'success': True,
                'balances': balances,
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Binance balance error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Place an order on Binance
        
        Args:
            symbol: Trading pair (e.g., 'BTCUSDT')
            side: 'BUY' or 'SELL'
            order_type: 'LIMIT' or 'MARKET'
            quantity: Order quantity
            price: Order price (required for LIMIT orders)
        """
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/v3/order"
            timestamp = int(time.time() * 1000)
            
            params = {
                'symbol': symbol.upper(),
                'side': side.upper(),
                'type': order_type.upper(),
                'quantity': quantity,
                'timestamp': timestamp,
            }
            
            if order_type.upper() == 'LIMIT':
                if not price:
                    return {'success': False, 'error': 'Price required for limit orders'}
                params['price'] = price
                params['timeInForce'] = 'GTC'  # Good Till Cancel
                
            params['signature'] = self._generate_signature(params, self.api_secret)
            
            response = self.session.post(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'success': True,
                'order_id': result.get('orderId'),
                'status': result.get('status'),
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Binance order error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def cancel_order(self, symbol: str, order_id: str) -> Dict[str, Any]:
        """Cancel an order"""
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/v3/order"
            timestamp = int(time.time() * 1000)
            
            params = {
                'symbol': symbol.upper(),
                'orderId': order_id,
                'timestamp': timestamp,
            }
            
            params['signature'] = self._generate_signature(params, self.api_secret)
            
            response = self.session.delete(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            return {
                'success': True,
                'order_id': order_id,
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Binance cancel error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def get_order_status(self, symbol: str, order_id: str) -> Dict[str, Any]:
        """Get order status"""
        if not self.connected:
            return {'success': False, 'error': 'Not connected'}
            
        try:
            endpoint = f"{self.base_url}/v3/order"
            timestamp = int(time.time() * 1000)
            
            params = {
                'symbol': symbol.upper(),
                'orderId': order_id,
                'timestamp': timestamp,
            }
            
            params['signature'] = self._generate_signature(params, self.api_secret)
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'success': True,
                'order': data,
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Binance order status error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """Get market data for a symbol"""
        try:
            # Get ticker data
            endpoint = f"{self.base_url}/v3/ticker/24hr"
            params = {'symbol': symbol.upper()}
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'success': True,
                'symbol': symbol,
                'price': float(data.get('lastPrice', 0)),
                'bid': float(data.get('bidPrice', 0)),
                'ask': float(data.get('askPrice', 0)),
                'volume': float(data.get('volume', 0)),
                'high': float(data.get('highPrice', 0)),
                'low': float(data.get('lowPrice', 0)),
                'change_percent': float(data.get('priceChangePercent', 0)),
                'timestamp': datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Binance market data error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
