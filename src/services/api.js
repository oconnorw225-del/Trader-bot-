/**
 * Centralized API Client for NDAX Quantum Engine
 * Handles all HTTP requests to backend APIs with authentication, retry logic, and error handling
 */

import axios from 'axios';

class APIClient {
  constructor() {
    // Get API URL from environment or use default
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.pythonBaseURL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
    this.timeout = 10000; // 10 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second

    // Create axios instances
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.pythonClient = axios.create({
      baseURL: this.pythonBaseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor - add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return this.handleError(error);
      }
    );

    // Same interceptors for Python client
    this.pythonClient.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.pythonClient.interceptors.response.use(
      (response) => response,
      (error) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Get authentication token from localStorage
   * @returns {string|null} Auth token
   */
  getAuthToken() {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Set authentication token in localStorage
   * @param {string} token - Auth token
   */
  setAuthToken(token) {
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @returns {Promise} Rejected promise with formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const errorData = {
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.error || 'Server error',
        data: error.response.data,
      };

      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        this.clearAuthToken();
        errorData.message = 'Unauthorized. Please login again.';
      } else if (error.response.status === 429) {
        // Rate limited
        errorData.message = 'Too many requests. Please try again later.';
      }

      return Promise.reject(errorData);
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
        data: null,
      });
    } else {
      // Error in request setup
      return Promise.reject({
        status: -1,
        message: error.message || 'Request failed',
        data: null,
      });
    }
  }

  /**
   * Retry a request with exponential backoff
   * @param {Function} requestFn - Function that returns axios request
   * @param {number} retriesLeft - Number of retries remaining
   * @returns {Promise} Request promise
   */
  async retryRequest(requestFn, retriesLeft = this.maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      if (retriesLeft > 0 && this.shouldRetry(error)) {
        const delay = this.retryDelay * (this.maxRetries - retriesLeft + 1);
        console.log(`Retrying request in ${delay}ms... (${retriesLeft} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retriesLeft - 1);
      }
      throw error;
    }
  }

  /**
   * Check if error should be retried
   * @param {Error} error - Error object
   * @returns {boolean} True if should retry
   */
  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return (
      error.status === 0 || // Network error
      (error.status >= 500 && error.status < 600) // Server error
    );
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  async get(endpoint, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.get(endpoint, config);
      return response.data;
    });
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  async post(endpoint, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.post(endpoint, data, config);
      return response.data;
    });
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  async put(endpoint, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.put(endpoint, data, config);
      return response.data;
    });
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  async delete(endpoint, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.delete(endpoint, config);
      return response.data;
    });
  }

  /**
   * Make request to Python backend
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise} Response data
   */
  async pythonRequest(endpoint, options = {}) {
    const { method = 'GET', data = null } = options;
    
    return this.retryRequest(async () => {
      const config = { method };
      if (data) {
        config.data = data;
      }
      const response = await this.pythonClient.request({ url: endpoint, ...config });
      return response.data;
    });
  }

  // ===== Health & Status =====

  /**
   * Check backend health
   * @returns {Promise} Health status
   */
  async checkHealth() {
    return this.get('/api/health');
  }

  /**
   * Get system status
   * @returns {Promise} System status
   */
  async getStatus() {
    return this.get('/api/status');
  }

  /**
   * Get system stats
   * @returns {Promise} System stats
   */
  async getStats() {
    return this.get('/api/stats');
  }

  // ===== Trading APIs =====

  /**
   * Place a trading order
   * @param {object} order - Order details
   * @returns {Promise} Order result
   */
  async placeOrder(order) {
    return this.post('/api/trading/order', order);
  }

  /**
   * Get account balance
   * @returns {Promise} Balance data
   */
  async getBalance() {
    return this.get('/api/trading/balance');
  }

  /**
   * Get current positions
   * @returns {Promise} Positions data
   */
  async getPositions() {
    return this.get('/api/trading/positions');
  }

  /**
   * Execute trading strategy
   * @param {object} strategy - Strategy data
   * @returns {Promise} Execution result
   */
  async executeTrade(strategy) {
    return this.post('/api/trading/execute', strategy);
  }

  // ===== Quantum Analysis APIs =====

  /**
   * Execute quantum strategy
   * @param {object} strategy - Strategy parameters
   * @returns {Promise} Analysis result
   */
  async executeQuantumStrategy(strategy) {
    return this.post('/api/quantum/execute', strategy);
  }

  /**
   * Analyze market with quantum algorithms
   * @param {object} data - Market data
   * @returns {Promise} Analysis result
   */
  async analyzeMarket(data) {
    return this.post('/api/quantum/analyze', data);
  }

  // ===== Freelance APIs =====

  /**
   * Search jobs on platform
   * @param {string} platform - Platform name (upwork, fiverr, etc.)
   * @param {object} criteria - Search criteria
   * @returns {Promise} Job listings
   */
  async searchJobs(platform, criteria) {
    return this.post(`/api/freelance/${platform}/jobs`, criteria);
  }

  /**
   * Apply to a job
   * @param {string} platform - Platform name
   * @param {object} application - Application data
   * @returns {Promise} Application result
   */
  async applyToJob(platform, application) {
    return this.post(`/api/freelance/${platform}/apply`, application);
  }

  // ===== Exchange APIs =====

  /**
   * Get available exchanges
   * @returns {Promise} Exchange list
   */
  async getExchanges() {
    return this.get('/api/exchanges');
  }

  /**
   * Get exchange status
   * @param {string} exchangeId - Exchange ID
   * @returns {Promise} Exchange status
   */
  async getExchangeStatus(exchangeId) {
    return this.get(`/api/exchange/status/${exchangeId}`);
  }

  /**
   * Connect to exchange
   * @param {object} credentials - Exchange credentials
   * @returns {Promise} Connection result
   */
  async connectExchange(credentials) {
    return this.post('/api/exchange/connect', credentials);
  }

  // ===== Risk Management APIs =====

  /**
   * Check trade risk
   * @param {object} trade - Trade details
   * @returns {Promise} Risk assessment
   */
  async checkRisk(trade) {
    return this.post('/api/risk/check', { trade });
  }

  // ===== AI APIs =====

  /**
   * Analyze data with AI
   * @param {object} data - Data to analyze
   * @returns {Promise} Analysis result
   */
  async analyzeWithAI(data) {
    return this.post('/api/ai/analyze', data);
  }

  /**
   * Get AI prediction
   * @param {object} data - Input data
   * @returns {Promise} Prediction result
   */
  async getPrediction(data) {
    return this.post('/api/ai/predict', data);
  }

  // ===== Market Data APIs =====

  /**
   * Get market data for symbol
   * @param {string} symbol - Trading symbol
   * @returns {Promise} Market data
   */
  async getMarketData(symbol) {
    return this.get(`/api/market/${symbol}`);
  }

  // ===== Configuration APIs =====

  /**
   * Load configuration
   * @returns {Promise} Configuration data
   */
  async loadConfig() {
    return this.get('/api/config/load');
  }

  /**
   * Save configuration
   * @param {object} config - Configuration data
   * @returns {Promise} Save result
   */
  async saveConfig(config) {
    return this.post('/api/config/save', config);
  }

  /**
   * Get feature flags
   * @returns {Promise} Feature flags
   */
  async getFeatures() {
    return this.get('/api/features');
  }

  /**
   * Update feature flags
   * @param {object} features - Feature flags
   * @returns {Promise} Update result
   */
  async updateFeatures(features) {
    return this.post('/api/features', features);
  }

  /**
   * Get runtime mode
   * @returns {Promise} Runtime mode
   */
  async getRuntimeMode() {
    return this.get('/api/runtime');
  }

  /**
   * Set runtime mode
   * @param {string} mode - Runtime mode
   * @returns {Promise} Update result
   */
  async setRuntimeMode(mode) {
    return this.post('/api/runtime', { mode });
  }

  // ===== Earnings APIs =====

  /**
   * Get earnings report
   * @returns {Promise} Earnings report
   */
  async getEarningsReport() {
    return this.get('/api/earnings/report');
  }

  /**
   * Get recent earnings
   * @param {number} limit - Number of entries to return
   * @returns {Promise} Recent earnings
   */
  async getRecentEarnings(limit = 10) {
    return this.get(`/api/earnings/recent?limit=${limit}`);
  }

  /**
   * Get earnings by period
   * @param {string} period - Period (day, week, month, year)
   * @returns {Promise} Period earnings
   */
  async getEarningsByPeriod(period) {
    return this.get(`/api/earnings/period/${period}`);
  }

  // ===== AutoStart APIs =====

  /**
   * Get AutoStart status
   * @returns {Promise} AutoStart status
   */
  async getAutoStartStatus() {
    return this.get('/api/autostart/status');
  }

  /**
   * Start AutoStart system
   * @returns {Promise} Start result
   */
  async startAutoStart() {
    return this.post('/api/autostart/start');
  }

  /**
   * Stop AutoStart system
   * @returns {Promise} Stop result
   */
  async stopAutoStart() {
    return this.post('/api/autostart/stop');
  }

  /**
   * Get AutoStart jobs
   * @returns {Promise} Jobs list
   */
  async getAutoStartJobs() {
    return this.get('/api/autostart/jobs');
  }

  // ===== Test APIs =====

  /**
   * Run test
   * @param {string} type - Test type (strategy, stress, api)
   * @param {object} config - Test configuration
   * @returns {Promise} Test results
   */
  async runTest(type, config) {
    return this.post(`/api/test/${type}`, config);
  }
}

// Create singleton instance
const apiClient = new APIClient();

// Export singleton instance
export default apiClient;

// Also export class for testing
export { APIClient };
