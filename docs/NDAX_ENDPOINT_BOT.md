# NDAX API Endpoint Testing Bot

## Overview

This bot pings NDAX API endpoints, executes requests, extracts and structures responses, and tracks execution paths, API counts, and critical misses.

## Features

- ✅ Pings endpoints before executing requests
- ✅ Tracks execution paths (taken and skipped)
- ✅ Detects missing fields in responses
- ✅ Identifies critical misses
- ✅ Counts API calls
- ✅ Determines live mode vs. test mode
- ✅ Outputs structured JSON results

## Endpoints Tested

1. **EarliestTickerTime** - Get earliest ticker time for an instrument
2. **Ticker** - 24-hour pricing and volume summary
3. **Summary** - Overview of all market pairs
4. **Ping** - Check connection/alive status

## Environment Variables

The bot requires the following environment variables:

```bash
API_KEY=<your_api_key>
API_SECRET=<your_api_secret>
BASE_URL=<api_base_url>
```

**Note:** If environment variables are missing:
- `LiveMode` will be set to `"No"`
- `Status` will be set to `"Unknown"`
- Critical misses will be detected with appropriate error messages

### Legacy Support

The bot also supports legacy NDAX-specific variable names for backward compatibility:
- `NDAX_API_KEY` (falls back to `API_KEY`)
- `NDAX_API_SECRET` (falls back to `API_SECRET`)
- `NDAX_BASE_URL` (falls back to `BASE_URL`)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

## Usage

### Command Line

**With formatted output:**
```bash
npm run ndax:test
```

**JSON output only (no commentary):**
```bash
node scripts/ndax-endpoint-bot.js --json-only
```

### GitHub Workflow

The bot can be triggered via GitHub Actions:

1. **Manual Trigger:**
   - Go to Actions → "NDAX API Endpoint Testing Bot"
   - Click "Run workflow"
   - Optionally specify a custom BASE_URL

2. **Automatic Trigger:**
   - Runs daily at 00:00 UTC
   - Runs on push to main branch (if bot files are modified)

### Required GitHub Secrets

Add these secrets to your repository:
- `NDAX_API_KEY` - Your NDAX API key
- `NDAX_API_SECRET` - Your NDAX API secret

## Output Format

The bot outputs a JSON array with one object per endpoint:

```json
[
  {
    "EndpointName": "EarliestTickerTime",
    "Request": { "InstrumentId": 1, "OMSId": 1 },
    "Response": [1501603632000],
    "DataFields": {
      "EarliestTime": "long integer, UTC POSIX milliseconds since 1/1/1970"
    },
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
  }
]
```

### Field Descriptions

- **EndpointName**: Name of the API endpoint
- **Request**: Request parameters sent to the endpoint
- **Response**: Raw response data from the API
- **DataFields**: Expected data fields and their types
- **Permissions**: Access level (Public/Private)
- **CallType**: Request type (Synchronous/Asynchronous)
- **Status**: Success/Failed/Unknown
- **LiveMode**: Yes (live API) / No (test/missing credentials)
- **APICount**: Cumulative count of API calls
- **MissingFields**: Array of fields missing from response
- **ExecutionPathsTaken**: Steps successfully executed (e.g., InitialCheck, ConfigurationValidation, Ping, RequestSent, ResponseParsed, FieldValidation, ValidationPassed/Failed, ResultStored, ErrorCaught, ErrorLogged)
- **ExecutionPathsSkipped**: Steps that were skipped (e.g., due to missing configuration or errors)
- **CriticalMissesDetected**: Yes/No
- **CriticalMissDetails**: Description of any critical issues
- **DataSources** (NEW): Comprehensive tracking of data origin and flow:
  - **configurationOrigin**: Where each configuration value came from (config_parameter, environment_variable, or not_configured)
  - **requestPath**: Full API endpoint path
  - **requestParameters**: Parameters sent with the request
  - **resultStoragePath**: Where results are stored
  - **responseHeaders**: HTTP response headers received (when live)
  - **responseSize**: Size of response data in bytes (when live)
  - **tradingPairsFound** / **marketPairsFound**: Count of data items in response (when live)

## Results Storage

Results are automatically saved to:
```
results/ndax-endpoint-results-<timestamp>.json
```

In GitHub Actions, results are uploaded as artifacts and retained for 30 days.

## Testing

Run the test suite:
```bash
npm test tests/modules/ndax-endpoint-tester.test.js
```

## Integration

### Using in Your Workflow

Add to your `.github/workflows/your-workflow.yml`:

```yaml
- name: Test NDAX Endpoints
  env:
    API_KEY: ${{ secrets.NDAX_API_KEY }}
    API_SECRET: ${{ secrets.NDAX_API_SECRET }}
    BASE_URL: https://api.ndax.io
  run: node scripts/ndax-endpoint-bot.js --json-only
```

### Using Programmatically

```javascript
import { NdaxEndpointTester } from './src/services/NdaxEndpointTester.js';

const tester = new NdaxEndpointTester({
  baseUrl: 'https://api.ndax.io',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
});

const results = await tester.runAllTests();
console.log(JSON.stringify(results, null, 2));
```

## Troubleshooting

### Environment Variables Not Detected

Ensure your `.env` file is in the root directory and contains:
```bash
API_KEY=your_key
API_SECRET=your_secret
BASE_URL=https://api.ndax.io
```

### Connection Errors

- Verify `BASE_URL` is correct
- Check network connectivity
- Ensure API credentials are valid
- Check if API endpoint URLs have changed

### Test Failures

- Check the `CriticalMissDetails` field in the output
- Verify response structure matches expected `DataFields`
- Review `ExecutionPathsSkipped` for clues

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT

## Version

1.0.0 - Initial release with support for NDAX API endpoints
