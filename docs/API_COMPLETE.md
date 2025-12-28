# API Documentation - NDAX Quantum Engine

**Version:** 2.1.0  
**Last Updated:** 2024-12-19

This document provides complete API documentation for both Node.js and Python backend services.

## Table of Contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Node.js Backend API](#nodejs-backend-api)
- [Python Backend API](#python-backend-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Base URLs

- **Node.js Backend:** `http://localhost:3000/api`
- **Python Backend:** `http://localhost:5000/api`
- **Production (Railway):** `https://your-app.railway.app/api`

## Authentication

Most endpoints support optional JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```typescript
{
  "success": boolean,
  "data": any,           // Present on success
  "error": string,       // Present on error
  "timestamp": string    // ISO 8601 timestamp
}
```

## Node.js Backend API

### Health & Configuration

#### GET /health
Get server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-19T21:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

#### GET /stats
Get system statistics.

**Response:**
```json
{
  "totalTrades": 150,
  "totalProfit": 12500.50,
  "activeJobs": 5,
  "successRate": 0.85
}
```

#### GET /config/load
Load application configuration.

**Response:**
```json
{
  "setupComplete": true,
  "features": { ... },
  "runtime": { ... }
}
```

#### POST /config/save
Save application configuration.

**Request Body:**
```json
{
  "setupComplete": true,
  "apiKeys": { ... },
  "preferences": { ... }
}
```

### Feature Management

#### GET /features
Get feature toggle status.

**Response:**
```json
{
  "aiBot": true,
  "wizardPro": true,
  "quantumEngine": true,
  "freelanceAutomation": true,
  ...
}
```

#### POST /features
Update feature toggles.

**Request Body:**
```json
{
  "quantumEngine": true,
  "freelanceAutomation": false
}
```

### Webhook Management

#### POST /webhooks/register
Register a new webhook.

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["trade.completed", "job.found"],
  "secret": "webhook_secret"
}
```

#### GET /webhooks
List all registered webhooks.

#### GET /webhooks/:id
Get a specific webhook.

#### PUT /webhooks/:id
Update a webhook.

#### DELETE /webhooks/:id
Delete a webhook.

#### POST /webhooks/test/:id
Test a webhook delivery.

## Python Backend API

### Health & Metrics

#### GET /health
Get server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-19T21:00:00.000Z",
  "uptime": "3600s",
  "demoMode": true,
  "version": "1.0.0",
  "system": {
    "backend": "online",
    "quantum": "ready",
    "freelance": "ready",
    "ai": "ready"
  }
}
```

#### GET /metrics
Get system metrics.

**Response:**
```json
{
  "requests": 1500,
  "errors": 10,
  "uptime": "3600s",
  "requestsPerSecond": 0.42,
  "errorRate": "0.67%",
  "start_time": "2024-12-19T20:00:00.000Z"
}
```

### Trading Endpoints

#### POST /trading/execute
Execute a trade order.

**Request Body:**
```json
{
  "symbol": "BTC/USD",
  "side": "BUY",
  "quantity": 0.01,
  "orderType": "MARKET",
  "price": 50000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_1734649200000",
    "symbol": "BTC/USD",
    "side": "BUY",
    "quantity": 0.01,
    "orderType": "MARKET",
    "price": 50000.00,
    "executionPrice": 50000.00,
    "executedQty": 0.01,
    "status": "FILLED",
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

#### GET /trading/orders
Get trading orders with optional filters.

**Query Parameters:**
- `symbol` (optional): Filter by trading pair (e.g., "BTC/USD")
- `status` (optional): Filter by status ("FILLED", "PENDING", etc.)
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "order_123",
        "symbol": "BTC/USD",
        "side": "BUY",
        "quantity": 0.01,
        "orderType": "MARKET",
        "executionPrice": 50000.00,
        "executedQty": 0.01,
        "status": "FILLED",
        "timestamp": "2024-12-19T21:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

#### GET /trading/market-data
Get market data for a symbol.

**Query Parameters:**
- `symbol` (optional): Trading pair (default: "BTC/USD")
- `interval` (optional): Time interval (default: "1m")

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTC/USD",
    "price": 50000.00,
    "volume": 1500000.00,
    "change24h": 2.5,
    "high24h": 51000.00,
    "low24h": 49000.00,
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

### Quantum Analysis

#### POST /quantum/analyze
Perform quantum analysis on market data.

**Request Body:**
```json
{
  "strategyType": "superposition",
  "symbol": "BTC/USD",
  "marketData": { ... }
}
```

**Response:**
```json
{
  "strategyType": "superposition",
  "symbol": "BTC/USD",
  "recommendation": "BUY",
  "confidence": 0.85,
  "signals": {
    "superposition": 0.75,
    "entanglement": 0.82,
    "tunneling": 0.68
  },
  "technicalIndicators": {
    "rsi": 45.5,
    "macd": 2.3,
    "sma": 49500.00
  },
  "timestamp": "2024-12-19T21:00:00.000Z"
}
```

#### GET /quantum/strategies
Get available quantum strategies.

**Response:**
```json
{
  "success": true,
  "strategies": [
    {
      "id": "superposition",
      "name": "Quantum Superposition",
      "description": "Analyzes multiple market states simultaneously",
      "confidence": 0.85
    },
    {
      "id": "entanglement",
      "name": "Quantum Entanglement",
      "description": "Identifies correlated market movements",
      "confidence": 0.78
    }
  ]
}
```

### AI Services

#### POST /ai/predict
Get AI prediction for a symbol.

**Request Body:**
```json
{
  "symbol": "BTC/USD",
  "timeframe": "1h"
}
```

**Response:**
```json
{
  "success": true,
  "symbol": "BTC/USD",
  "timeframe": "1h",
  "prediction": "bullish",
  "confidence": 0.75,
  "factors": ["momentum", "volume", "sentiment"],
  "priceTarget": {
    "high": 52000,
    "low": 48000,
    "expected": 50000
  },
  "timestamp": "2024-12-19T21:00:00.000Z"
}
```

#### GET /ai/sentiment
Get market sentiment analysis.

**Query Parameters:**
- `symbol` (optional): Trading pair (default: "BTC/USD")

**Response:**
```json
{
  "success": true,
  "symbol": "BTC/USD",
  "sentiment": "positive",
  "score": 0.65,
  "confidence": 0.80,
  "sources": ["twitter", "reddit", "news"],
  "timestamp": "2024-12-19T21:00:00.000Z"
}
```

### Freelance Automation

#### GET /freelance/jobs
Get available freelance jobs.

**Query Parameters:**
- `platform` (optional): Filter by platform ("Upwork", "Fiverr", etc.)
- `category` (optional): Job category
- `minBudget` (optional): Minimum budget

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_1",
        "title": "Senior Developer Needed",
        "platform": "Upwork",
        "budget": 5000.00,
        "category": "Web Development",
        "description": "Looking for an experienced developer...",
        "skills": ["React", "Node.js", "TypeScript"],
        "posted": "2 hours ago"
      }
    ],
    "total": 1
  }
}
```

#### POST /freelance/submit-proposal
Submit a proposal for a job.

**Request Body:**
```json
{
  "jobId": "job_123",
  "proposal": "I am interested in this project...",
  "coverLetter": "Dear client...",
  "bidAmount": 4500.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proposalId": "proposal_1734649200000",
    "status": "submitted",
    "jobId": "job_123",
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

### Position Management

#### GET /positions
Get all open positions.

**Response:**
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "id": "pos_1",
        "symbol": "BTC/USD",
        "side": "BUY",
        "quantity": 0.5,
        "entry_price": 49000.00,
        "current_price": 50000.00,
        "unrealized_pnl": 500.00,
        "realized_pnl": 0,
        "opened_at": "2024-12-19T20:00:00.000Z",
        "status": "OPEN"
      }
    ],
    "total": 1
  }
}
```

#### GET /positions/:id
Get a specific position.

**Response:**
```json
{
  "success": true,
  "data": {
    "position": {
      "id": "pos_1",
      "symbol": "BTC/USD",
      "side": "BUY",
      "quantity": 0.5,
      "entry_price": 49000.00,
      "current_price": 50000.00,
      "unrealized_pnl": 500.00,
      "realized_pnl": 0,
      "opened_at": "2024-12-19T20:00:00.000Z",
      "status": "OPEN"
    }
  }
}
```

### Risk Management

#### POST /risk/evaluate
Evaluate trading risk.

**Request Body:**
```json
{
  "symbol": "BTC/USD",
  "quantity": 1.0,
  "side": "BUY"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "approved": true,
    "riskScore": 25,
    "riskLevel": "moderate",
    "risks": ["High volatility detected"],
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

### Compliance

#### POST /compliance/check
Check compliance for a trade or operation.

**Request Body:**
```json
{
  "region": "US",
  "type": "spot",
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "compliant": true,
    "region": "US",
    "checks": {
      "kyc_verified": true,
      "aml_cleared": true,
      "trading_limits": true,
      "jurisdiction_allowed": true
    },
    "warnings": [],
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

### Automation

#### GET /automation/status
Get automation system status.

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "mode": "balanced",
    "activeTasks": 5,
    "completedTasks": 150,
    "successRate": 0.85,
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

#### POST /automation/configure
Configure automation settings.

**Request Body:**
```json
{
  "mode": "full"
}
```

**Valid modes:** `"full"`, `"partial"`, `"minimal"`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "mode": "full",
    "timestamp": "2024-12-19T21:00:00.000Z"
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

### Node.js Backend
- **Default:** 100 requests per 15 minutes per IP
- **Applies to:** All `/api/*` endpoints

### Python Backend
- **Demo Mode:** 1000 requests per hour
- **Live Mode:** 100 requests per hour
- **Applies to:** All endpoints

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1734649200
```

## TypeScript Client

A TypeScript client is available for easy integration:

```typescript
import api from './lib/api';

// Execute a trade
const response = await api.executeTrade({
  symbol: 'BTC/USD',
  side: 'BUY',
  quantity: 0.01,
  orderType: 'MARKET'
});

if (response.success) {
  console.log('Trade executed:', response.data);
} else {
  console.error('Trade failed:', response.error);
}
```

## WebSocket Support

WebSocket support for real-time updates is planned for future releases.

## Support

For issues or questions:
- GitHub Issues: https://github.com/oconnorw225-del/ndax-quantum-engine/issues
- Documentation: See README.md

## Changelog

### Version 2.1.0 (2024-12-19)
- Added comprehensive quantum analysis endpoints
- Added position management endpoints
- Added compliance checking
- Added automation configuration
- Enhanced error handling and validation
- Added rate limiting documentation
