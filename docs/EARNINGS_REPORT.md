# Earnings Report System

This document explains how to use the earnings tracking and reporting system in the NDAX Quantum Engine.

## Overview

The earnings tracking system aggregates and reports on money made from multiple sources:
- **Trading profits/losses** - From quantum trading strategies
- **Freelance earnings** - From completed AI automation jobs
- **Payment transactions** - From the payment management system
- **Bot state earnings** - From the autonomous bot system

## Quick Start

### View Earnings Demo

To see a demonstration with sample data:

```bash
npm run earnings:demo
```

This will display a comprehensive earnings report with sample trading and freelance data.

### View Live Earnings

To view your actual earnings (requires running backend server):

```bash
# Start the backend server (in one terminal)
npm start

# View earnings report (in another terminal)
npm run earnings
```

### JSON Output

To get earnings data in JSON format (useful for automation):

```bash
npm run earnings:json
```

## Features

### 1. Total Earnings Summary

Shows total money made with breakdown by source:
- Trading profit/loss
- Freelance job earnings
- Bot state earnings
- Payment balance

### 2. Period Analysis

View earnings over different time periods:
- **Daily** - Last 24 hours
- **Weekly** - Last 7 days
- **Monthly** - Last 30 days

### 3. Source Breakdown

See earnings grouped by platform:
- Quantum trading engine
- Upwork jobs
- Fiverr gigs
- Freelancer projects
- Toptal contracts
- Other platforms

### 4. Statistics

- Total number of transactions
- Trading transactions count
- Freelance jobs completed
- Average earning per transaction

### 5. Payment Information

- Payment transaction status
- Current balance
- Daily payment volume
- Crypto payout information

## API Endpoints

The earnings system provides several API endpoints:

### Get Earnings Report

```bash
GET /api/earnings/report
```

Returns comprehensive earnings data with all metrics.

**Example Response:**
```json
{
  "summary": {
    "totalEarnings": 15196.50,
    "breakdown": {
      "trading": 5246.50,
      "freelance": 9950.00,
      "botState": 0,
      "payments": 0
    }
  },
  "periods": {
    "daily": { "total": 15196.50, "trading": 5246.50, "freelance": 9950.00 },
    "weekly": { "total": 15196.50, "trading": 5246.50, "freelance": 9950.00 },
    "monthly": { "total": 15196.50, "trading": 5246.50, "freelance": 9950.00 }
  },
  "sources": {
    "quantum_engine": { "total": 5246.50, "count": 7, "type": "trading" },
    "upwork": { "total": 3700.00, "count": 2, "type": "freelance" }
  },
  "statistics": {
    "totalTransactions": 13,
    "tradingTransactions": 7,
    "freelanceJobs": 6,
    "averageEarningPerTransaction": 1168.96
  }
}
```

### Get Recent Earnings

```bash
GET /api/earnings/recent?limit=10
```

Returns the most recent earnings records.

### Get Earnings by Period

```bash
GET /api/earnings/period/:period
```

Supported periods: `daily`, `weekly`, `monthly`, `all`

### Get Stats (Dashboard)

```bash
GET /api/stats
```

Returns summary statistics for the dashboard.

## Usage in Code

### Recording Trading Profits

```javascript
import earningsTracker from './src/services/EarningsTracker.js';

// Record a successful trade
const trade = {
  symbol: 'BTC/USD',
  side: 'BUY',
  profit: 1250.00,
  entryPrice: 45000,
  exitPrice: 46000,
  quantity: 0.5
};

earningsTracker.recordTrade(trade);
```

### Recording Freelance Earnings

```javascript
import earningsTracker from './src/services/EarningsTracker.js';

// Record a completed job
const job = {
  platform: 'upwork',
  title: 'Full-Stack Web Development',
  earnings: 2500.00,
  difficulty: 'hard'
};

earningsTracker.recordFreelanceEarning(job);
```

### Getting Total Earnings

```javascript
import earningsTracker from './src/services/EarningsTracker.js';

const earnings = await earningsTracker.getTotalEarnings();
console.log(`Total: $${earnings.total}`);
console.log(`Trading: $${earnings.breakdown.trading}`);
console.log(`Freelance: $${earnings.breakdown.freelance}`);
```

### Getting Detailed Report

```javascript
import earningsTracker from './src/services/EarningsTracker.js';

const report = await earningsTracker.getDetailedReport();
console.log(report);
```

## Data Persistence

Earnings data is automatically saved to localStorage (browser) or file system (Node.js) to persist across restarts.

To clear all earnings data:

```javascript
import earningsTracker from './src/services/EarningsTracker.js';
earningsTracker.clear();
```

## Integration with Dashboard

The earnings tracker is integrated with the main dashboard component. Earnings are automatically displayed in the dashboard stats cards.

## Architecture

### EarningsTracker Service

Located at: `src/services/EarningsTracker.js`

Main methods:
- `initialize()` - Initialize and load historical data
- `recordTrade(trade)` - Record trading profit/loss
- `recordFreelanceEarning(job)` - Record freelance job earnings
- `getTotalEarnings()` - Get total from all sources
- `getEarningsByPeriod(period)` - Get earnings for specific period
- `getEarningsBySource()` - Group earnings by source
- `getDetailedReport()` - Generate comprehensive report
- `getRecentEarnings(limit)` - Get recent transactions
- `clear()` - Clear all data

### CLI Scripts

1. **earnings-report.js** - Main CLI tool for viewing live earnings
2. **demo-earnings.js** - Demo with sample data (no server required)

### Backend Integration

The earnings endpoints are integrated into:
- `backend/nodejs/server.js` - Node.js Express server
- `unified-server.js` - Unified server with WebSocket support

## Testing

Run the earnings tracker tests:

```bash
npm test -- tests/modules/earnings.test.js
```

All tests should pass (19 tests in total).

## Troubleshooting

### "Backend server is not running"

Make sure the backend server is started:
```bash
npm start
```

### "Cannot find module"

Make sure dependencies are installed:
```bash
npm install
```

### No earnings data shown

If you're seeing zeros:
1. Use the demo to see sample data: `npm run earnings:demo`
2. Make sure trades and jobs are being recorded via the API
3. Check that the EarningsTracker is being imported and used correctly

## Security Notes

- Earnings data is stored locally and not transmitted to external servers
- All API endpoints should be secured with authentication in production
- Sensitive financial data should be encrypted at rest

## Future Enhancements

Planned features:
- Export earnings to CSV/PDF
- Email earnings reports
- Integration with accounting software
- Historical charts and visualizations
- Tax reporting features
- Multi-currency support

## Support

For issues or questions about the earnings system:
1. Check the [main README](../README.md)
2. Review the [API documentation](API.md)
3. Open an issue on GitHub

---

**Last Updated:** December 22, 2025
