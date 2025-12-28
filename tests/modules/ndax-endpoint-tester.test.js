/**
 * Tests for NDAX Endpoint Tester
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock axios BEFORE importing the module that uses it
const mockAxios = {
  get: jest.fn()
};

jest.unstable_mockModule('axios', () => ({
  default: mockAxios
}));

// Mock dotenv to prevent environment variable issues
jest.unstable_mockModule('dotenv', () => ({
  default: {
    config: jest.fn()
  }
}));

// Now dynamically import the module that depends on axios
const { NdaxEndpointTester } = await import('../../src/services/NdaxEndpointTester.js');

describe('NdaxEndpointTester', () => {
  let tester;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockClear();
    tester = new NdaxEndpointTester({
      baseUrl: 'https://api.test.ndax.io',
      apiKey: 'test-key',
      apiSecret: 'test-secret'
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      const defaultTester = new NdaxEndpointTester();
      expect(defaultTester.baseUrl).toBeDefined();
      expect(defaultTester.apiCount).toBe(0);
      expect(defaultTester.results).toEqual([]);
    });

    it('should initialize with custom config', () => {
      expect(tester.baseUrl).toBe('https://api.test.ndax.io');
      expect(tester.apiKey).toBe('test-key');
      expect(tester.apiSecret).toBe('test-secret');
    });

    it('should detect live mode when credentials are present', () => {
      expect(tester.isLiveMode).toBe(true);
    });

    it('should detect non-live mode when credentials are missing', () => {
      const noCredsTester = new NdaxEndpointTester();
      expect(noCredsTester.isLiveMode).toBe(false);
    });
  });

  describe('ping()', () => {
    it('should successfully ping the API', async () => {
      mockAxios.get.mockResolvedValue({
        data: 'PONG'
      });

      const result = await tester.ping();

      expect(result.EndpointName).toBe('Ping');
      expect(result.Status).toBe('Success');
      expect(result.Response).toBe('PONG');
      expect(result.APICount).toBe(1);
      expect(result.ExecutionPathsTaken).toContain('RequestSent');
      expect(result.ExecutionPathsTaken).toContain('ResponseReceived');
      expect(result.CriticalMissesDetected).toBe('No');
      expect(result.LiveMode).toBe('Yes');
    });

    it('should handle ping failure', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await tester.ping();

      expect(result.Status).toBe('Failed');
      expect(result.CriticalMissesDetected).toBe('Yes');
      expect(result.CriticalMissDetails).toContain('Network error');
      expect(result.ExecutionPathsSkipped).toContain('ResponseReceived');
      expect(result.LiveMode).toBe('Yes');
    });

    it('should return Unknown status when not in live mode', async () => {
      const noCredsTester = new NdaxEndpointTester();
      const result = await noCredsTester.ping();

      expect(result.Status).toBe('Unknown');
      expect(result.LiveMode).toBe('No');
      expect(result.CriticalMissesDetected).toBe('Yes');
      expect(result.CriticalMissDetails).toContain('not configured');
    });
  });

  describe('getEarliestTickerTime()', () => {
    it('should successfully get earliest ticker time', async () => {
      mockAxios.get.mockResolvedValue({
        data: [1501603632000]
      });

      const result = await tester.getEarliestTickerTime(1, 1);

      expect(result.EndpointName).toBe('EarliestTickerTime');
      expect(result.Status).toBe('Success');
      expect(result.Response).toEqual([1501603632000]);
      expect(result.Request).toEqual({ InstrumentId: 1, OMSId: 1 });
      expect(result.ExecutionPathsTaken).toContain('RequestSent');
      expect(result.ExecutionPathsTaken).toContain('ResponseParsed');
      expect(result.MissingFields).toEqual([]);
      expect(result.LiveMode).toBe('Yes');
    });

    it('should detect invalid response format', async () => {
      mockAxios.get.mockResolvedValue({
        data: []
      });

      const result = await tester.getEarliestTickerTime(1, 1);

      expect(result.Status).toBe('Success');
      expect(result.CriticalMissesDetected).toBe('Yes');
      expect(result.MissingFields).toContain('EarliestTime');
    });

    it('should handle request failure', async () => {
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      const result = await tester.getEarliestTickerTime(1, 1);

      expect(result.Status).toBe('Failed');
      expect(result.CriticalMissesDetected).toBe('Yes');
    });
  });

  describe('getTicker()', () => {
    it('should successfully get ticker data', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          BTC_CAD: {
            base_id: 1,
            quote_id: 8564,
            last_price: 75854.93,
            base_volume: 66.62131,
            quote_volume: 5127348.6661163
          }
        }
      });

      const result = await tester.getTicker();

      expect(result.EndpointName).toBe('Ticker');
      expect(result.Status).toBe('Success');
      expect(result.Response).toBeDefined();
      expect(result.MissingFields).toEqual([]);
      expect(result.ExecutionPathsTaken).toContain('ResponseParsed');
    });

    it('should detect missing fields', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          BTC_CAD: {
            base_id: 1,
            // Missing other required fields
          }
        }
      });

      const result = await tester.getTicker();

      expect(result.Status).toBe('Success');
      expect(result.MissingFields.length).toBeGreaterThan(0);
    });

    it('should handle invalid response structure', async () => {
      // Mock both the ping call and the actual request
      mockAxios.get
        .mockResolvedValueOnce({ data: 'OK' })   // First call: pingEndpoint
        .mockResolvedValueOnce({ data: null });  // Second call: actual getTicker request

      const result = await tester.getTicker();

      expect(result.Status).toBe('Success');
      expect(result.CriticalMissesDetected).toBe('Yes');
    });
  });

  describe('getSummary()', () => {
    it('should successfully get market summary', async () => {
      mockAxios.get.mockResolvedValue({
        data: [{
          trading_pairs: 'BTC_CAD',
          last_price: 75925.37,
          lowest_ask: 75926.63,
          highest_bid: 66.43534,
          base_volume: 75774.93,
          quote_volume: 5112197.7830825,
          price_change_percent_24h: -5.389489356198082,
          highest_price_24h: 79813.51,
          lowest_price_24h: 73700.01
        }]
      });

      const result = await tester.getSummary();

      expect(result.EndpointName).toBe('Summary');
      expect(result.Status).toBe('Success');
      expect(result.Response).toBeDefined();
      expect(result.MissingFields).toEqual([]);
    });

    it('should detect missing fields in summary', async () => {
      mockAxios.get.mockResolvedValue({
        data: [{
          trading_pairs: 'BTC_CAD',
          last_price: 75925.37
          // Missing other fields
        }]
      });

      const result = await tester.getSummary();

      expect(result.Status).toBe('Success');
      expect(result.MissingFields.length).toBeGreaterThan(0);
    });

    it('should handle empty response', async () => {
      mockAxios.get.mockResolvedValue({
        data: []
      });

      const result = await tester.getSummary();

      expect(result.Status).toBe('Success');
      expect(result.CriticalMissesDetected).toBe('Yes');
      expect(result.CriticalMissDetails).toContain('empty data');
    });
  });

  describe('getHeaders()', () => {
    it('should return headers with authorization', () => {
      const headers = tester.getHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer test-key');
    });

    it('should return headers without authorization when no API key', () => {
      const noAuthTester = new NdaxEndpointTester({
        baseUrl: 'https://api.test.ndax.io'
      });
      const headers = noAuthTester.getHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('runAllTests()', () => {
    it('should run all endpoint tests', async () => {
      mockAxios.get.mockResolvedValue({
        data: { success: true }
      });

      const results = await tester.runAllTests();

      expect(results.length).toBe(4); // 4 endpoints
      expect(tester.apiCount).toBe(4);
      expect(results[0].EndpointName).toBe('EarliestTickerTime');
      expect(results[1].EndpointName).toBe('Ticker');
      expect(results[2].EndpointName).toBe('Summary');
      expect(results[3].EndpointName).toBe('Ping');
    });

    it('should reset results and API count before running', async () => {
      tester.apiCount = 10;
      tester.results = [{ test: 'old' }];

      mockAxios.get.mockResolvedValue({
        data: { success: true }
      });

      await tester.runAllTests();

      expect(tester.results.length).toBe(4);
      expect(tester.results[0]).not.toEqual({ test: 'old' });
    });
  });

  describe('getResults()', () => {
    it('should return results array', () => {
      tester.results = [{ test: 'result1' }, { test: 'result2' }];
      const results = tester.getResults();

      expect(results).toEqual([{ test: 'result1' }, { test: 'result2' }]);
    });
  });

  describe('getResultsJSON()', () => {
    it('should return formatted JSON string', () => {
      tester.results = [{ test: 'result' }];
      const json = tester.getResultsJSON();

      expect(json).toContain('"test"');
      expect(json).toContain('"result"');
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });
});
