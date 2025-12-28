# API Documentation

Complete API reference for NDAX Quantum Engine.

## Table of Contents
1. [Node.js Backend API](#nodejs-backend-api)
2. [Flask Backend API](#flask-backend-api)
3. [JavaScript Module API](#javascript-module-api)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)

## Node.js Backend API

Base URL: `http://localhost:3000`

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Trading Endpoints

#### Place Order

```
POST /api/trading/order
```

**Request Body:**
```json
{
  "symbol": "BTC/USD",
  "side": "BUY",
  "quantity": 1,
  "price": 40000
}
```

**Response:**
```json
{
  "orderId": "order_1234567890",
  "symbol": "BTC/USD",
  "side": "BUY",
  "quantity": 1,
  "price": 40000,
  "status": "filled",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Quantum Endpoints

#### Execute Quantum Strategy

```
POST /api/quantum/execute
```

**Request Body:**
```json
{
  "strategy": "superposition",
  "data": {
    "marketStates": [
      { "price": 40000 },
      { "price": 41000 }
    ]
  }
}
```

**Response:**
```json
{
  "strategy": "superposition",
  "result": {
    "recommendation": "BUY",
    "confidence": 0.85,
    "optimalPrice": 40500
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### AI Endpoints

#### Analyze Data

```
POST /api/ai/analyze
```

**Request Body:**
```json
{
  "data": {
    "prices": [100, 110, 105, 115],
    "volumes": [1000, 1200, 1100, 1300]
  }
}
```

**Response:**
```json
{
  "analysis": {
    "summary": "Analysis complete",
    "insights": ["Upward trend detected", "Volume increasing"],
    "confidence": 0.80
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Freelance Endpoints

#### Get Connected Platforms

```
GET /api/freelance/platforms
```

**Response:**
```json
{
  "platforms": [
    { "id": "upwork", "name": "Upwork", "status": "connected" },
    { "id": "fiverr", "name": "Fiverr", "status": "connected" }
  ]
}
```

### Risk Management Endpoints

#### Check Trade Risk

```
POST /api/risk/check
```

**Request Body:**
```json
{
  "trade": {
    "size": 1,
    "price": 40000,
    "symbol": "BTC/USD"
  }
}
```

**Response:**
```json
{
  "approved": true,
  "riskScore": 25,
  "risks": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Flask Backend API

Base URL: `http://localhost:5000`

### Execute Trade

```
POST /api/trading/execute
```

**Request Body:**
```json
{
  "symbol": "BTC/USD",
  "side": "BUY",
  "quantity": 1,
  "price": 40000
}
```

### Run Quantum Strategy

```
POST /api/quantum/strategy
```

**Request Body:**
```json
{
  "strategyType": "superposition",
  "marketData": {...}
}
```

### AI Prediction

```
POST /api/ai/predict
```

**Request Body:**
```json
{
  "data": {...},
  "model": "gpt-4"
}
```

## JavaScript Module API

### Quantum Strategies

```javascript
import { quantumSuperposition } from './src/modules/quantum/strategies.js';

const result = quantumSuperposition(marketStates, weights);
```

**Parameters:**
- `marketStates` (Array): Array of market state objects
- `weights` (Object, optional): Weight for each state

**Returns:**
```javascript
{
  strategy: 'quantum_superposition',
  optimalPrice: 40500,
  confidence: 0.85,
  recommendation: 'BUY'
}
```

### Trading Engine

```javascript
import TradingEngine from './src/modules/trading/trading.js';

const engine = new TradingEngine();
const order = engine.placeMarketOrder('BTC/USD', 'BUY', 1, 40000);
```

**Methods:**
- `placeMarketOrder(symbol, side, quantity, price)`
- `placeLimitOrder(symbol, side, quantity, limitPrice)`
- `cancelOrder(orderId)`
- `getPosition(symbol)`
- `getOrderHistory(symbol)`

### AI Orchestrator

```javascript
import orchestrator from './src/modules/ai/orchestrator.js';

orchestrator.registerModel('model-id', config);
const result = await orchestrator.executeTask('text_generation', data);
```

**Methods:**
- `registerModel(modelId, config)`
- `executeTask(taskType, data, modelId)`
- `getTaskStatus(taskId)`
- `cancelTask(taskId)`

### Risk Manager

```javascript
import riskManager from './src/modules/risk/riskManager.js';

const assessment = riskManager.evaluateTradeRisk(trade);
```

**Methods:**
- `evaluateTradeRisk(trade)`
- `calculatePositionSize(balance, riskPercentage, stopLoss)`
- `checkStopLoss(position, currentPrice)`
- `getRiskStatistics()`

## Authentication

### API Key Authentication

Include API key in request headers:

```
Authorization: Bearer YOUR_API_KEY
```

### JWT Authentication

For user authentication, include JWT token:

```
Authorization: JWT YOUR_JWT_TOKEN
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes

- `INVALID_PARAMS` - Invalid request parameters
- `INSUFFICIENT_BALANCE` - Not enough balance
- `ORDER_NOT_FOUND` - Order doesn't exist
- `RISK_THRESHOLD_EXCEEDED` - Trade exceeds risk limits
- `AUTHENTICATION_FAILED` - Invalid credentials
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

- Default: 100 requests per minute per API key
- Burst: 200 requests per minute
- Headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination

For endpoints returning lists:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Webhooks

Configure webhooks for real-time notifications:

```
POST /api/webhooks/configure
```

**Request Body:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["order.filled", "position.closed", "risk.alert"]
}
```

## Best Practices

1. **Use HTTPS** in production
2. **Implement retry logic** for failed requests
3. **Cache responses** when appropriate
4. **Handle rate limits** gracefully
5. **Validate input** on client side
6. **Monitor API usage**
7. **Keep API keys secure**
8. **Use appropriate timeouts**
