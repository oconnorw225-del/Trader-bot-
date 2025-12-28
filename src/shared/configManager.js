/**
 * Centralized Configuration Manager
 * Combines feature toggles, runtime settings, and user preferences
 */

import featureToggleManager from './featureToggles.js';
import runtimeManager from './runtimeManager.js';

class ConfigManager {
  constructor() {
    this.config = {
      // API Configuration
      apiUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000',
      apiTimeout: 10000,
      
      // User preferences
      theme: 'auto',
      language: 'en',
      notifications: true,
      soundEffects: false,
      
      // Trading settings
      defaultTradingPair: 'BTC/USD',
      riskLevel: 'moderate',
      maxPositionSize: 10000,
      maxDailyLoss: 1000,
      
      // Freelance settings
      autoApply: false,
      minJobBudget: 0,
      maxApplicationsPerDay: 10,
      
      // Crypto Payout Configuration
      cryptoPayoutAddress: '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5',
      enableCryptoPayouts: true,
      
      // Performance settings
      enableCache: true,
      cacheExpiration: 300000,
      maxRetries: 3,
      retryDelay: 1000,
      
      // Security settings
      enableTwoFactor: false,
      sessionTimeout: 3600000,
      
      // Debug settings
      debugMode: false,
      verboseLogging: false
    };
    
    this.listeners = new Set();
    this.saveTimeout = null;
    this.saveDelay = 500; // Debounce localStorage writes by 500ms
    this.loadConfig();
    
    // Subscribe to feature toggle changes
    featureToggleManager.subscribe(() => {
      this.notifyListeners('features');
    });
    
    // Subscribe to runtime mode changes
    runtimeManager.subscribe(() => {
      this.applyRuntimeOptimizations();
      this.notifyListeners('runtime');
    });
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('appConfig');
        if (stored) {
          this.config = { ...this.config, ...JSON.parse(stored) };
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
    
    this.applyRuntimeOptimizations();
  }

  /**
   * Save configuration to localStorage (debounced)
   */
  saveConfig() {
    // Clear existing timeout if any
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Debounce saves to reduce localStorage writes
    this.saveTimeout = setTimeout(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('appConfig', JSON.stringify(this.config));
        }
      } catch (error) {
        console.error('Error saving configuration:', error);
      }
      this.saveTimeout = null;
    }, this.saveDelay);
  }
  
  /**
   * Save configuration immediately without debouncing
   */
  saveConfigNow() {
    // Clear any pending debounced save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('appConfig', JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  /**
   * Get a configuration value
   * @param {string} key - Configuration key
   * @returns {any} Configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set a configuration value
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   */
  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
    this.notifyListeners(key);
  }

  /**
   * Update multiple configuration values
   * @param {object} updates - Configuration updates
   */
  update(updates) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Get all configuration
   * @returns {object} All configuration
   */
  getAll() {
    return {
      ...this.config,
      features: featureToggleManager.getAllFeatures(),
      runtime: runtimeManager.getMode(),
      runtimeConfig: runtimeManager.getConfig()
    };
  }

  /**
   * Apply runtime-specific optimizations
   */
  applyRuntimeOptimizations() {
    const runtimeConfig = runtimeManager.getConfig();
    const performanceSettings = runtimeManager.getPerformanceSettings();
    
    // Adjust cache settings based on runtime
    this.config.cacheExpiration = runtimeConfig.cacheDuration;
    
    // Adjust timeout based on runtime
    if (runtimeManager.isMobile()) {
      this.config.apiTimeout = 15000; // Longer timeout for mobile
    } else if (runtimeManager.isCloud()) {
      this.config.apiTimeout = 5000; // Shorter timeout for cloud
    } else {
      this.config.apiTimeout = 10000; // Default for regular
    }
    
    // Adjust max retries
    this.config.maxRetries = performanceSettings.maxConcurrentRequests > 10 ? 5 : 3;
    
    // Save optimized config
    this.saveConfig();
  }

  /**
   * Check if a feature is enabled and should be shown
   * @param {string} feature - Feature name
   * @returns {boolean} True if enabled
   */
  isFeatureEnabled(feature) {
    return featureToggleManager.isEnabled(feature) && 
           runtimeManager.shouldEnableFeature(feature);
  }

  /**
   * Get feature flags
   * @returns {object} Feature flags
   */
  getFeatures() {
    return featureToggleManager.getAllFeatures();
  }

  /**
   * Enable a feature
   * @param {string} feature - Feature name
   */
  enableFeature(feature) {
    featureToggleManager.enable(feature);
  }

  /**
   * Disable a feature
   * @param {string} feature - Feature name
   */
  disableFeature(feature) {
    featureToggleManager.disable(feature);
  }

  /**
   * Get runtime mode
   * @returns {string} Runtime mode
   */
  getRuntimeMode() {
    return runtimeManager.getMode();
  }

  /**
   * Set runtime mode
   * @param {string} mode - Runtime mode
   */
  setRuntimeMode(mode) {
    runtimeManager.setMode(mode);
  }

  /**
   * Get runtime configuration
   * @returns {object} Runtime configuration
   */
  getRuntimeConfig() {
    return runtimeManager.getConfig();
  }

  /**
   * Get performance settings
   * @returns {object} Performance settings
   */
  getPerformanceSettings() {
    return runtimeManager.getPerformanceSettings();
  }

  /**
   * Get UI settings
   * @returns {object} UI settings
   */
  getUISettings() {
    return runtimeManager.getUISettings();
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    this.config = {
      apiUrl: 'http://localhost:3000',
      apiTimeout: 10000,
      theme: 'auto',
      language: 'en',
      notifications: true,
      soundEffects: false,
      defaultTradingPair: 'BTC/USD',
      riskLevel: 'moderate',
      maxPositionSize: 10000,
      maxDailyLoss: 1000,
      autoApply: false,
      minJobBudget: 0,
      maxApplicationsPerDay: 10,
      cryptoPayoutAddress: '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5',
      enableCryptoPayouts: true,
      enableCache: true,
      cacheExpiration: 300000,
      maxRetries: 3,
      retryDelay: 1000,
      enableTwoFactor: false,
      sessionTimeout: 3600000,
      debugMode: false,
      verboseLogging: false
    };
    
    featureToggleManager.resetToDefaults();
    this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Export configuration
   * @returns {object} Exportable configuration
   */
  exportConfig() {
    return {
      config: this.config,
      features: featureToggleManager.getAllFeatures(),
      runtime: runtimeManager.getMode()
    };
  }

  /**
   * Import configuration
   * @param {object} data - Configuration data
   */
  importConfig(data) {
    if (data.config) {
      this.config = { ...this.config, ...data.config };
      this.saveConfig();
    }
    
    if (data.features) {
      featureToggleManager.setFeatures(data.features);
    }
    
    if (data.runtime) {
      runtimeManager.setMode(data.runtime);
    }
    
    this.notifyListeners();
  }

  /**
   * Subscribe to configuration changes
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   * @param {string} key - Optional specific key that changed
   */
  notifyListeners(key) {
    this.listeners.forEach(callback => {
      try {
        callback(key, this.config);
      } catch (error) {
        console.error('Error in config manager listener:', error);
      }
    });
  }

  /**
   * Validate configuration
   * @returns {object} Validation result
   */
  validateConfig() {
    const errors = [];
    const warnings = [];
    
    // Validate API URL
    if (!this.config.apiUrl) {
      errors.push('API URL is required');
    }
    
    // Validate risk settings
    if (this.config.maxPositionSize <= 0) {
      errors.push('Max position size must be positive');
    }
    
    if (this.config.maxDailyLoss <= 0) {
      errors.push('Max daily loss must be positive');
    }
    
    // Warnings for mobile mode with intensive features
    if (runtimeManager.isMobile()) {
      const intensiveFeatures = ['stressTest', 'advancedAnalytics'];
      intensiveFeatures.forEach(feature => {
        if (featureToggleManager.isEnabled(feature)) {
          warnings.push(`${feature} is not recommended on mobile devices`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Singleton instance
const configManager = new ConfigManager();

export default configManager;
export { ConfigManager };
