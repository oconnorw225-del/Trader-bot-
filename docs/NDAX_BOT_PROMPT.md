# NDAX API Endpoint Testing Bot - Usage Prompt

## Quick Start

Paste this into your GitHub workflow or bot runtime:

```yaml
name: NDAX Endpoint Test

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  test-endpoints:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run NDAX Endpoint Bot
        env:
          API_KEY: ${{ secrets.NDAX_API_KEY }}
          API_SECRET: ${{ secrets.NDAX_API_SECRET }}
          BASE_URL: https://api.ndax.io
        run: node scripts/ndax-endpoint-bot.js --json-only
```

## Environment Variables

Before running, set these in your GitHub repository secrets or .env file:

```bash
API_KEY=<your_ndax_api_key>
API_SECRET=<your_ndax_api_secret>
BASE_URL=https://api.ndax.io
```

## Expected Output

The bot will output structured JSON with one object per endpoint:

```json
[
  {
    "EndpointName": "EarliestTickerTime",
    "Request": {"InstrumentId": 1, "OMSId": 1},
    "Response": [1501603632000],
    "DataFields": {"EarliestTime": "long integer, UTC POSIX milliseconds since 1/1/1970"},
    "Permissions": "Public",
    "CallType": "Synchronous",
    "Status": "Success",
    "LiveMode": "Yes",
    "APICount": 1,
    "MissingFields": [],
    "ExecutionPathsTaken": ["Ping", "RequestSent", "ResponseParsed"],
    "ExecutionPathsSkipped": [],
    "CriticalMissesDetected": "No",
    "CriticalMissDetails": ""
  },
  {
    "EndpointName": "Ticker",
    "Request": {},
    "Response": {
      "BTC_CAD": {
        "base_id": 1,
        "quote_id": 8564,
        "last_price": 75854.93,
        "base_volume": 66.62131,
        "quote_volume": 5127348.6661163
      }
    },
    "DataFields": {
      "base_id": "integer",
      "quote_id": "integer",
      "last_price": "decimal",
      "base_volume": "decimal",
      "quote_volume": "decimal"
    },
    "Permissions": "Public",
    "CallType": "Synchronous",
    "Status": "Success",
    "LiveMode": "Yes",
    "APICount": 2,
    "MissingFields": [],
    "ExecutionPathsTaken": ["Ping", "RequestSent", "ResponseParsed"],
    "ExecutionPathsSkipped": [],
    "CriticalMissesDetected": "No",
    "CriticalMissDetails": ""
  },
  {
    "EndpointName": "Summary",
    "Request": {},
    "Response": [
      {
        "trading_pairs": "BTC_CAD",
        "last_price": 75925.37,
        "lowest_ask": 75926.63,
        "highest_bid": 66.43534,
        "base_volume": 75774.93,
        "quote_volume": 5112197.7830825,
        "price_change_percent_24h": -5.389489356198082,
        "highest_price_24h": 79813.51,
        "lowest_price_24h": 73700.01
      }
    ],
    "DataFields": {
      "trading_pairs": "string",
      "last_price": "decimal",
      "lowest_ask": "decimal",
      "highest_bid": "decimal",
      "base_volume": "decimal",
      "quote_volume": "decimal",
      "price_change_percent_24h": "decimal",
      "highest_price_24h": "decimal",
      "lowest_price_24h": "decimal"
    },
    "Permissions": "Public",
    "CallType": "Synchronous",
    "Status": "Success",
    "LiveMode": "Yes",
    "APICount": 3,
    "MissingFields": [],
    "ExecutionPathsTaken": ["Ping", "RequestSent", "ResponseParsed"],
    "ExecutionPathsSkipped": [],
    "CriticalMissesDetected": "No",
    "CriticalMissDetails": ""
  },
  {
    "EndpointName": "Ping",
    "Request": {},
    "Response": "PONG",
    "DataFields": {},
    "Permissions": "Public",
    "CallType": "Synchronous",
    "Status": "Success",
    "LiveMode": "Yes",
    "APICount": 4,
    "MissingFields": [],
    "ExecutionPathsTaken": ["RequestSent", "ResponseReceived"],
    "ExecutionPathsSkipped": [],
    "CriticalMissesDetected": "No",
    "CriticalMissDetails": ""
  }
]
```

## What the Bot Does

1. **Pings** each endpoint to check availability
2. **Executes** requests as defined
3. **Extracts** and structures responses
4. **Tracks** execution paths (taken and skipped)
5. **Counts** API calls
6. **Detects** critical misses and missing fields
7. **Determines** if running in LiveMode (based on credentials)

## Running Locally

```bash
# Install dependencies
npm install

# Set environment variables in .env
API_KEY=your_key
API_SECRET=your_secret
BASE_URL=https://api.ndax.io

# Run the bot
npm run ndax:test

# Or get JSON output only
node scripts/ndax-endpoint-bot.js --json-only
```

## Results Storage

Results are automatically saved to:
- `results/ndax-endpoint-results-<timestamp>.json`

In GitHub Actions, results are uploaded as artifacts (retained for 30 days).

## Troubleshooting

### Missing Credentials
If API_KEY, API_SECRET, or BASE_URL are not set:
- `LiveMode` will be `"No"`
- `Status` will be `"Unknown"`
- `CriticalMissesDetected` will be `"Yes"`
- `CriticalMissDetails` will explain which variables are missing

### Network Errors
Check:
- Base URL is correct
- API credentials are valid
- Network connectivity

### Missing Fields
The bot validates response structure and reports any missing fields in `MissingFields` array.

## Documentation

For complete documentation, see: `docs/NDAX_ENDPOINT_BOT.md`
