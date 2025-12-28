# NDAX API Reference and Configuration

## Overview

This document contains all API endpoints, configuration details, and integration information for the NDAX Quantum Engine trading system.

## NDAX Exchange API

### Base URLs
- **Production**: `https://api.ndax.io`
- **Testnet**: `https://api.ndax.io/testnet` (if available)

### Authentication

NDAX API uses API key authentication with signature verification.

**Required Headers:**
```
X-NDAX-API-KEY: your_api_key
X-NDAX-SIGNATURE: HMAC-SHA256(timestamp + method + endpoint + body, secret)
X-NDAX-TIMESTAMP: Unix timestamp in milliseconds
```

### Environment Variables

Configure the following in your `.env` file:

```bash
# NDAX API Credentials
NDAX_API_KEY=your_ndax_api_key_here
NDAX_API_SECRET=your_ndax_api_secret_here
NDAX_USER_ID=your_user_id_here
NDAX_ACCOUNT_ID=your_account_id_here
NDAX_BASE_URL=https://api.ndax.io

# Generic API credentials (used by NDAX endpoint bot)
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
BASE_URL=https://api.ndax.io
```

## Core Endpoints

### Market Data

#### Get Ticker
```
GET /api/GetLevel1
```
Returns current market price and volume data.

**Response:**
```json
{
  "BestBid": 50000.00,
  "BestOffer": 50010.00,
  "LastTradedPx": 50005.00,
  "Volume": 1234.56
}
```

#### Get Order Book
```
GET /api/GetL2Snapshot
```
Returns order book depth.

### Account Management

#### Get Account Info
```
GET /api/GetAccountInfo
```
Returns account balance and details.

**Response:**
```json
{
  "AccountId": 12345,
  "UserId": 67890,
  "AccountName": "Main",
  "Balances": [
    {
      "ProductSymbol": "CAD",
      "Amount": 10000.00,
      "Hold": 0.00
    },
    {
      "ProductSymbol": "BTC",
      "Amount": 0.5,
      "Hold": 0.0
    }
  ]
}
```

#### Get Account Positions
```
GET /api/GetAccountPositions
```
Returns open positions.

### Trading

#### Place Order
```
POST /api/SendOrder
```

**Request Body:**
```json
{
  "InstrumentId": 1,
  "OMSId": 1,
  "AccountId": 12345,
  "TimeInForce": "GTC",
  "OrderType": "Limit",
  "Side": "Buy",
  "Quantity": 0.01,
  "LimitPrice": 50000.00
}
```

**Response:**
```json
{
  "status": "Accepted",
  "errormsg": "",
  "OrderId": 123456789
}
```

#### Cancel Order
```
POST /api/CancelOrder
```

**Request Body:**
```json
{
  "OMSId": 1,
  "AccountId": 12345,
  "OrderId": 123456789
}
```

#### Get Open Orders
```
GET /api/GetOpenOrders
```
Returns all open orders for the account.

#### Get Order History
```
GET /api/GetOrderHistory
```
Returns historical orders.

### Trade History

#### Get Trades
```
GET /api/GetAccountTrades
```
Returns executed trades for the account.

**Parameters:**
- `StartIndex`: Starting index (default: 0)
- `Count`: Number of records (default: 100)

## Trading Pairs

Available on NDAX:
- BTC/CAD
- ETH/CAD
- LTC/CAD
- XRP/CAD
- And others (check platform for full list)

## Rate Limits

- **REST API**: 100 requests per minute per IP
- **WebSocket**: 10 connections per IP
- **Order Placement**: 20 orders per second

## WebSocket API

### Connection
```
wss://api.ndax.io/WSGateway
```

### Subscribe to Ticker
```json
{
  "m": 0,
  "i": 1,
  "n": "SubscribeLevel1",
  "o": "{\"OMSId\":1,\"InstrumentId\":1}"
}
```

### Subscribe to Trades
```json
{
  "m": 0,
  "i": 2,
  "n": "SubscribeTrades",
  "o": "{\"OMSId\":1,\"InstrumentId\":1}"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Endpoint doesn't exist |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## Risk Management Configuration

### Default Risk Limits (Configurable via Environment Variables)

```bash
# Risk Management
CAPITAL_CAP=0.5              # Use max 50% of capital
MAX_POSITION=0.05            # Max 5% per position
MAX_TRADES_HOUR=100          # Max 100 trades per hour
HARD_STOP_LOSS=0.30          # Hard stop at 30% drawdown
MAX_DAILY_LOSS=0.50          # Max 50% daily loss
```

### Trading Modes

```bash
# Trading Mode Configuration
BOT_MODE=PAPER               # PAPER | LIVE_LIMITED | HALTED
ALLOW_LIVE=False             # Must be True for live trading
```

### Promotion Criteria (Paper to Live)

```bash
# Promotion Configuration
MIN_PAPER_MINUTES=60         # Minimum 60 minutes runtime
MIN_PAPER_TRADES=30          # Minimum 30 trades
MIN_PAPER_WINRATE=0.70       # Minimum 70% win rate
```

## Integration Examples

### Python Example

```python
import os
import hmac
import hashlib
import time
import requests

class NDAXClient:
    def __init__(self):
        self.api_key = os.getenv('NDAX_API_KEY')
        self.api_secret = os.getenv('NDAX_API_SECRET')
        self.base_url = os.getenv('NDAX_BASE_URL', 'https://api.ndax.io')
    
    def _sign(self, timestamp, method, endpoint, body=''):
        message = f"{timestamp}{method}{endpoint}{body}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def get_balance(self):
        endpoint = '/api/GetAccountInfo'
        timestamp = str(int(time.time() * 1000))
        signature = self._sign(timestamp, 'GET', endpoint)
        
        headers = {
            'X-NDAX-API-KEY': self.api_key,
            'X-NDAX-SIGNATURE': signature,
            'X-NDAX-TIMESTAMP': timestamp
        }
        
        response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
        return response.json()
    
    def place_order(self, side, quantity, price, pair='BTC/CAD'):
        endpoint = '/api/SendOrder'
        timestamp = str(int(time.time() * 1000))
        
        body = {
            'InstrumentId': 1,  # BTC/CAD
            'OMSId': 1,
            'AccountId': int(os.getenv('NDAX_ACCOUNT_ID')),
            'TimeInForce': 'GTC',
            'OrderType': 'Limit',
            'Side': side,
            'Quantity': quantity,
            'LimitPrice': price
        }
        
        import json
        body_str = json.dumps(body)
        signature = self._sign(timestamp, 'POST', endpoint, body_str)
        
        headers = {
            'X-NDAX-API-KEY': self.api_key,
            'X-NDAX-SIGNATURE': signature,
            'X-NDAX-TIMESTAMP': timestamp,
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=headers,
            data=body_str
        )
        return response.json()
```

### JavaScript Example

```javascript
const crypto = require('crypto');
const axios = require('axios');

class NDAXClient {
  constructor() {
    this.apiKey = process.env.NDAX_API_KEY;
    this.apiSecret = process.env.NDAX_API_SECRET;
    this.baseUrl = process.env.NDAX_BASE_URL || 'https://api.ndax.io';
  }
  
  sign(timestamp, method, endpoint, body = '') {
    const message = `${timestamp}${method}${endpoint}${body}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }
  
  async getBalance() {
    const endpoint = '/api/GetAccountInfo';
    const timestamp = Date.now().toString();
    const signature = this.sign(timestamp, 'GET', endpoint);
    
    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-NDAX-API-KEY': this.apiKey,
        'X-NDAX-SIGNATURE': signature,
        'X-NDAX-TIMESTAMP': timestamp
      }
    });
    
    return response.data;
  }
}
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Enable IP whitelisting** on NDAX dashboard (if available)
4. **Start with PAPER mode** until promotion criteria met
5. **Set appropriate risk limits** based on account size
6. **Monitor kill switch** triggers and logs
7. **Use HTTPS only** for all API calls
8. **Rotate API keys** regularly (every 90 days)

## Testing

### Paper Trading
The system includes a mock NDAX client for paper trading:

```python
from platform.ndax_test import NDAXTestClient

client = NDAXTestClient()
print(client.get_platform_info())  # Mock platform info
print(client.get_balance())         # Mock balance
print(client.get_price("BTC/CAD"))  # Mock price feed
```

### Live Trading Prerequisites

Before enabling live trading:
1. ✅ Complete 60+ minutes of paper trading
2. ✅ Execute 30+ paper trades
3. ✅ Achieve 70%+ win rate
4. ✅ Stay under 30% drawdown
5. ✅ Set `ALLOW_LIVE=True` in environment
6. ✅ Verify API credentials are correct
7. ✅ Test with minimal position sizes first

## Support and Resources

- **NDAX Official Docs**: https://ndax.io/api-docs
- **NDAX Support**: support@ndax.io
- **Trading Pairs**: https://ndax.io/markets
- **Status Page**: https://status.ndax.io

## Changelog

- **2025-12-28**: Added promotion system, kill switch, enhanced reporting
- **2025-12-28**: Added environment variable support for all configurations
- **2025-12-28**: Created comprehensive API reference documentation

---

**Last Updated**: December 28, 2025  
**Version**: 2.1.0
