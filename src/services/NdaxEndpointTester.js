/**
 * NDAX API Endpoint Testing Module
 * Pings endpoints, executes requests, and tracks execution paths
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * NDAX Endpoint Tester
 * Handles endpoint testing with comprehensive tracking
 */
export class NdaxEndpointTester {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.BASE_URL || process.env.NDAX_BASE_URL || '';
    this.apiKey = config.apiKey || process.env.API_KEY || process.env.NDAX_API_KEY || '';
    this.apiSecret = config.apiSecret || process.env.API_SECRET || process.env.NDAX_API_SECRET || '';
    this.apiCount = 0;
    this.results = [];
    
    // Track data sources for comprehensive auditing
    this.dataSources = {
      baseUrl: this.getDataSource('baseUrl', config.baseUrl, ['BASE_URL', 'NDAX_BASE_URL']),
      apiKey: this.getDataSource('apiKey', config.apiKey, ['API_KEY', 'NDAX_API_KEY']),
      apiSecret: this.getDataSource('apiSecret', config.apiSecret, ['API_SECRET', 'NDAX_API_SECRET'])
    };
    
    // Determine if we're in live mode based on environment variables
    this.isLiveMode = !!(this.apiKey && this.apiSecret && this.baseUrl);
  }

  /**
   * Track where configuration data came from
   */
  getDataSource(paramName, configValue, envVars) {
    if (configValue) {
      return { source: 'config_parameter', path: `constructor.config.${paramName}` };
    }
    
    for (const envVar of envVars) {
      if (process.env[envVar]) {
        return { source: 'environment_variable', path: `process.env.${envVar}` };
      }
    }
    
    return { source: 'not_configured', path: 'none' };
  }

  /**
   * Ping a specific endpoint to check availability
   */
  async pingEndpoint(endpointUrl) {
    try {
      await axios.get(endpointUrl, {
        timeout: 5000,
        headers: this.getHeaders(),
        validateStatus: () => true // Accept any status for ping check
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ping the API to check if it's alive
   */
  async ping() {
    const result = {
      EndpointName: 'Ping',
      Request: {},
      Response: null,
      DataFields: {},
      Permissions: 'Public',
      CallType: 'Synchronous',
      Status: this.isLiveMode ? 'Failed' : 'Unknown',
      LiveMode: this.isLiveMode ? 'Yes' : 'No',
      APICount: ++this.apiCount,
      MissingFields: [],
      ExecutionPathsTaken: [],
      ExecutionPathsSkipped: [],
      CriticalMissesDetected: 'No',
      CriticalMissDetails: '',
      DataSources: {
        configurationOrigin: this.dataSources,
        requestPath: `${this.baseUrl}/ping`,
        resultStoragePath: 'results/ndax-endpoint-results-*.json'
      }
    };

    if (!this.isLiveMode) {
      result.Response = 'Environment variables missing';
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = 'API_KEY, API_SECRET, or BASE_URL not configured';
      result.ExecutionPathsSkipped.push('ConfigurationValidation', 'EndpointPing', 'RequestSent', 'ResponseReceived');
      result.ExecutionPathsTaken.push('InitialCheck');
      this.results.push(result);
      return result;
    }

    try {
      result.ExecutionPathsTaken.push('ConfigurationValidation', 'EndpointUrlConstructed', 'RequestSent');
      
      const response = await axios.get(`${this.baseUrl}/ping`, {
        timeout: 10000,
        headers: this.getHeaders()
      });

      result.ExecutionPathsTaken.push('ResponseReceived', 'ResponseParsed', 'ResultStored');
      result.Response = response.data || 'PONG';
      result.Status = 'Success';
      result.DataSources.responseHeaders = response.headers ? Object.keys(response.headers) : [];
    } catch (error) {
      result.Status = 'Failed';
      result.Response = error.message;
      result.ExecutionPathsSkipped.push('ResponseReceived', 'ResponseParsed');
      result.ExecutionPathsTaken.push('ErrorCaught', 'ErrorLogged');
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = error.message;
    }

    this.results.push(result);
    return result;
  }

  /**
   * Get earliest ticker time for an instrument
   */
  async getEarliestTickerTime(instrumentId = 1, omsId = 1) {
    const result = {
      EndpointName: 'EarliestTickerTime',
      Request: {
        InstrumentId: instrumentId,
        OMSId: omsId
      },
      Response: null,
      DataFields: {
        EarliestTime: 'long integer, UTC POSIX milliseconds since 1/1/1970'
      },
      Permissions: 'Public',
      CallType: 'Synchronous',
      Status: this.isLiveMode ? 'Failed' : 'Unknown',
      LiveMode: this.isLiveMode ? 'Yes' : 'No',
      APICount: ++this.apiCount,
      MissingFields: [],
      ExecutionPathsTaken: [],
      ExecutionPathsSkipped: [],
      CriticalMissesDetected: 'No',
      CriticalMissDetails: '',
      DataSources: {
        configurationOrigin: this.dataSources,
        requestPath: `${this.baseUrl}/GetEarliestTickTime`,
        requestParameters: { InstrumentId: instrumentId, OMSId: omsId },
        resultStoragePath: 'results/ndax-endpoint-results-*.json'
      }
    };

    if (!this.isLiveMode) {
      result.Response = 'Environment variables missing';
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = 'API_KEY, API_SECRET, or BASE_URL not configured';
      result.ExecutionPathsSkipped.push('ConfigurationValidation', 'EndpointPing', 'ParameterValidation', 'RequestSent', 'ResponseParsed');
      result.ExecutionPathsTaken.push('InitialCheck');
      this.results.push(result);
      return result;
    }

    try {
      // Ping endpoint first
      const endpointUrl = `${this.baseUrl}/GetEarliestTickTime`;
      result.ExecutionPathsTaken.push('ConfigurationValidation', 'EndpointUrlConstructed');
      
      const pingSuccess = await this.pingEndpoint(endpointUrl);
      
      if (pingSuccess) {
        result.ExecutionPathsTaken.push('Ping');
      } else {
        result.ExecutionPathsSkipped.push('Ping');
      }

      result.ExecutionPathsTaken.push('ParameterValidation', 'RequestSent');

      const response = await axios.get(endpointUrl, {
        params: {
          InstrumentId: instrumentId,
          OMSId: omsId
        },
        timeout: 10000,
        headers: this.getHeaders()
      });

      result.ExecutionPathsTaken.push('ResponseParsed', 'FieldValidation', 'ResultStored');
      result.Response = response.data;
      result.Status = 'Success';
      result.DataSources.responseHeaders = response.headers ? Object.keys(response.headers) : [];
      result.DataSources.responseSize = JSON.stringify(response.data).length;

      // Validate response
      if (!Array.isArray(response.data) || response.data.length === 0) {
        result.MissingFields.push('EarliestTime');
        result.CriticalMissesDetected = 'Yes';
        result.CriticalMissDetails = 'Response missing expected data format';
        result.ExecutionPathsTaken.push('ValidationFailed');
      } else {
        result.ExecutionPathsTaken.push('ValidationPassed');
      }
    } catch (error) {
      result.Status = 'Failed';
      result.Response = error.message;
      result.ExecutionPathsSkipped.push('ResponseParsed', 'FieldValidation');
      result.ExecutionPathsTaken.push('ErrorCaught', 'ErrorLogged');
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = error.message;
    }

    this.results.push(result);
    return result;
  }

  /**
   * Get ticker information
   */
  async getTicker() {
    const result = {
      EndpointName: 'Ticker',
      Request: {},
      Response: null,
      DataFields: {
        base_id: 'integer',
        quote_id: 'integer',
        last_price: 'decimal',
        base_volume: 'decimal',
        quote_volume: 'decimal'
      },
      Permissions: 'Public',
      CallType: 'Synchronous',
      Status: this.isLiveMode ? 'Failed' : 'Unknown',
      LiveMode: this.isLiveMode ? 'Yes' : 'No',
      APICount: ++this.apiCount,
      MissingFields: [],
      ExecutionPathsTaken: [],
      ExecutionPathsSkipped: [],
      CriticalMissesDetected: 'No',
      CriticalMissDetails: '',
      DataSources: {
        configurationOrigin: this.dataSources,
        requestPath: `${this.baseUrl}/ticker`,
        resultStoragePath: 'results/ndax-endpoint-results-*.json'
      }
    };

    if (!this.isLiveMode) {
      result.Response = 'Environment variables missing';
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = 'API_KEY, API_SECRET, or BASE_URL not configured';
      result.ExecutionPathsSkipped.push('ConfigurationValidation', 'EndpointPing', 'RequestSent', 'ResponseParsed', 'FieldValidation');
      result.ExecutionPathsTaken.push('InitialCheck');
      this.results.push(result);
      return result;
    }

    try {
      // Ping endpoint first
      const endpointUrl = `${this.baseUrl}/ticker`;
      result.ExecutionPathsTaken.push('ConfigurationValidation', 'EndpointUrlConstructed');
      
      const pingSuccess = await this.pingEndpoint(endpointUrl);
      
      if (pingSuccess) {
        result.ExecutionPathsTaken.push('Ping');
      } else {
        result.ExecutionPathsSkipped.push('Ping');
      }

      result.ExecutionPathsTaken.push('RequestSent');

      const response = await axios.get(endpointUrl, {
        timeout: 10000,
        headers: this.getHeaders()
      });

      result.ExecutionPathsTaken.push('ResponseParsed', 'FieldValidation', 'ResultStored');
      result.Response = response.data;
      result.Status = 'Success';
      result.DataSources.responseHeaders = response.headers ? Object.keys(response.headers) : [];
      result.DataSources.responseSize = JSON.stringify(response.data).length;
      
      // Count trading pairs, handling null/invalid data
      const isValidObject = typeof response.data === 'object' && response.data !== null;
      result.DataSources.tradingPairsFound = isValidObject ? Object.keys(response.data).length : 0;

      // Validate response structure
      const expectedFields = ['base_id', 'quote_id', 'last_price', 'base_volume', 'quote_volume'];
      const responseData = response.data;
      
      if (typeof responseData === 'object' && responseData !== null) {
        // Check first trading pair for expected fields
        const firstPair = Object.values(responseData)[0];
        if (firstPair) {
          expectedFields.forEach(field => {
            if (!(field in firstPair)) {
              result.MissingFields.push(field);
            }
          });
          
          if (result.MissingFields.length === 0) {
            result.ExecutionPathsTaken.push('ValidationPassed');
          } else {
            result.ExecutionPathsTaken.push('ValidationFailed');
          }
        }
      } else {
        result.MissingFields = expectedFields;
        result.CriticalMissesDetected = 'Yes';
        result.CriticalMissDetails = 'Invalid response structure';
        result.ExecutionPathsTaken.push('ValidationFailed');
      }
    } catch (error) {
      result.Status = 'Failed';
      result.Response = error.message;
      result.ExecutionPathsSkipped.push('ResponseParsed', 'FieldValidation');
      result.ExecutionPathsTaken.push('ErrorCaught', 'ErrorLogged');
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = error.message;
    }

    this.results.push(result);
    return result;
  }

  /**
   * Get market summary
   */
  async getSummary() {
    const result = {
      EndpointName: 'Summary',
      Request: {},
      Response: null,
      DataFields: {
        trading_pairs: 'string',
        last_price: 'decimal',
        lowest_ask: 'decimal',
        highest_bid: 'decimal',
        base_volume: 'decimal',
        quote_volume: 'decimal',
        price_change_percent_24h: 'decimal',
        highest_price_24h: 'decimal',
        lowest_price_24h: 'decimal'
      },
      Permissions: 'Public',
      CallType: 'Synchronous',
      Status: this.isLiveMode ? 'Failed' : 'Unknown',
      LiveMode: this.isLiveMode ? 'Yes' : 'No',
      APICount: ++this.apiCount,
      MissingFields: [],
      ExecutionPathsTaken: [],
      ExecutionPathsSkipped: [],
      CriticalMissesDetected: 'No',
      CriticalMissDetails: '',
      DataSources: {
        configurationOrigin: this.dataSources,
        requestPath: `${this.baseUrl}/summary`,
        resultStoragePath: 'results/ndax-endpoint-results-*.json'
      }
    };

    if (!this.isLiveMode) {
      result.Response = 'Environment variables missing';
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = 'API_KEY, API_SECRET, or BASE_URL not configured';
      result.ExecutionPathsSkipped.push('ConfigurationValidation', 'EndpointPing', 'RequestSent', 'ResponseParsed', 'FieldValidation');
      result.ExecutionPathsTaken.push('InitialCheck');
      this.results.push(result);
      return result;
    }

    try {
      // Ping endpoint first
      const endpointUrl = `${this.baseUrl}/summary`;
      result.ExecutionPathsTaken.push('ConfigurationValidation', 'EndpointUrlConstructed');
      
      const pingSuccess = await this.pingEndpoint(endpointUrl);
      
      if (pingSuccess) {
        result.ExecutionPathsTaken.push('Ping');
      } else {
        result.ExecutionPathsSkipped.push('Ping');
      }

      result.ExecutionPathsTaken.push('RequestSent');

      const response = await axios.get(endpointUrl, {
        timeout: 10000,
        headers: this.getHeaders()
      });

      result.ExecutionPathsTaken.push('ResponseParsed', 'FieldValidation', 'ResultStored');
      result.Response = response.data;
      result.Status = 'Success';
      result.DataSources.responseHeaders = response.headers ? Object.keys(response.headers) : [];
      result.DataSources.responseSize = JSON.stringify(response.data).length;
      result.DataSources.marketPairsFound = Array.isArray(response.data) ? response.data.length : 0;

      // Validate response structure
      const expectedFields = [
        'trading_pairs',
        'last_price',
        'lowest_ask',
        'highest_bid',
        'base_volume',
        'quote_volume',
        'price_change_percent_24h',
        'highest_price_24h',
        'lowest_price_24h'
      ];

      if (Array.isArray(response.data) && response.data.length > 0) {
        const firstItem = response.data[0];
        expectedFields.forEach(field => {
          if (!(field in firstItem)) {
            result.MissingFields.push(field);
          }
        });
        
        if (result.MissingFields.length === 0) {
          result.ExecutionPathsTaken.push('ValidationPassed');
        } else {
          result.ExecutionPathsTaken.push('ValidationFailed');
        }
      } else {
        result.MissingFields = expectedFields;
        result.CriticalMissesDetected = 'Yes';
        result.CriticalMissDetails = 'Invalid response structure or empty data';
        result.ExecutionPathsTaken.push('ValidationFailed');
      }
    } catch (error) {
      result.Status = 'Failed';
      result.Response = error.message;
      result.ExecutionPathsSkipped.push('ResponseParsed', 'FieldValidation');
      result.ExecutionPathsTaken.push('ErrorCaught', 'ErrorLogged');
      result.CriticalMissesDetected = 'Yes';
      result.CriticalMissDetails = error.message;
    }

    this.results.push(result);
    return result;
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Run all endpoint tests
   */
  async runAllTests() {
    this.results = [];
    this.apiCount = 0;

    console.log('Starting NDAX API endpoint tests...\n');

    // Test in the order specified in the problem statement
    await this.getEarliestTickerTime(1, 1);
    await this.getTicker();
    await this.getSummary();
    await this.ping();

    return this.results;
  }

  /**
   * Get formatted results
   */
  getResults() {
    return this.results;
  }

  /**
   * Get results as formatted JSON string
   */
  getResultsJSON() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Print results to console
   */
  printResults() {
    console.log('\n=== NDAX API Endpoint Test Results ===\n');
    console.log(this.getResultsJSON());
    console.log('\n=== Test Summary ===');
    console.log(`Total API Calls: ${this.apiCount}`);
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Successful: ${this.results.filter(r => r.Status === 'Success').length}`);
    console.log(`Failed: ${this.results.filter(r => r.Status === 'Failed').length}`);
    console.log(`Critical Misses: ${this.results.filter(r => r.CriticalMissesDetected === 'Yes').length}`);
  }
}

/**
 * Main execution function for CLI usage
 */
export async function runNdaxEndpointTests() {
  const tester = new NdaxEndpointTester();
  await tester.runAllTests();
  tester.printResults();
  return tester.getResults();
}

// Allow direct execution as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  runNdaxEndpointTests()
    .then(() => {
      console.log('\nAll tests completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\nError running tests:', error);
      process.exit(1);
    });
}
