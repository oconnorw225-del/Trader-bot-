/**
 * Runtime Detection and Configuration
 * Detects and manages runtime modes: mobile, regular, cloud
 */

const RUNTIME_MODES = {
  MOBILE: 'mobile',
  REGULAR: 'regular',
  CLOUD: 'cloud'
};

const MODE_CONFIGS = {
  mobile: {
    name: 'Mobile',
    description: 'Optimized for mobile devices with touch interface',
    maxConcurrentTasks: 2,
    pollingInterval: 5000,
    enableAnimations: false,
    enableAdvancedFeatures: false,
    cacheDuration: 300000, // 5 minutes
    maxChartDataPoints: 50,
    theme: 'dimmed',
    touchOptimized: true,
    resourceIntensive: false
  },
  regular: {
    name: 'Regular',
    description: 'Standard mode for desktop/laptop computers',
    maxConcurrentTasks: 5,
    pollingInterval: 3000,
    enableAnimations: true,
    enableAdvancedFeatures: true,
    cacheDuration: 180000, // 3 minutes
    maxChartDataPoints: 200,
    theme: 'standard',
    touchOptimized: false,
    resourceIntensive: false
  },
  cloud: {
    name: 'Cloud/Server',
    description: 'High performance mode for cloud/server environments',
    maxConcurrentTasks: 20,
    pollingInterval: 1000,
    enableAnimations: false,
    enableAdvancedFeatures: true,
    cacheDuration: 60000, // 1 minute
    maxChartDataPoints: 1000,
    theme: 'standard',
    touchOptimized: false,
    resourceIntensive: true
  }
};

class RuntimeManager {
  constructor() {
    this.currentMode = null;
    this.autoDetected = false;
    this.listeners = new Set();
    this.detectRuntime();
  }

  /**
   * Auto-detect runtime mode based on environment
   */
  detectRuntime() {
    // Check for Node.js environment (cloud/server)
    if (typeof window === 'undefined' || typeof process !== 'undefined' && process.versions && process.versions.node) {
      this.currentMode = RUNTIME_MODES.CLOUD;
      this.autoDetected = true;
      return;
    }

    // Check localStorage for saved preference
    try {
      const saved = localStorage.getItem('runtimeMode');
      if (saved && MODE_CONFIGS[saved]) {
        this.currentMode = saved;
        this.autoDetected = false;
        return;
      }
    } catch (error) {
      console.error('Error loading runtime mode:', error);
    }

    // Detect based on browser/device characteristics
    const isMobile = this.detectMobileDevice();
    
    if (isMobile) {
      this.currentMode = RUNTIME_MODES.MOBILE;
    } else {
      this.currentMode = RUNTIME_MODES.REGULAR;
    }
    
    this.autoDetected = true;
  }

  /**
   * Detect if device is mobile
   * @returns {boolean} True if mobile device
   */
  detectMobileDevice() {
    if (typeof navigator === 'undefined') return false;

    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    if (mobileRegex.test(userAgent)) {
      return true;
    }

    // Check for touch capability and small screen
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;

    return hasTouch && isSmallScreen;
  }

  /**
   * Get current runtime mode
   * @returns {string} Current mode
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Get current mode configuration
   * @returns {object} Mode configuration
   */
  getConfig() {
    return { ...MODE_CONFIGS[this.currentMode] };
  }

  /**
   * Check if current mode is mobile
   * @returns {boolean} True if mobile
   */
  isMobile() {
    return this.currentMode === RUNTIME_MODES.MOBILE;
  }

  /**
   * Check if current mode is regular
   * @returns {boolean} True if regular
   */
  isRegular() {
    return this.currentMode === RUNTIME_MODES.REGULAR;
  }

  /**
   * Check if current mode is cloud
   * @returns {boolean} True if cloud
   */
  isCloud() {
    return this.currentMode === RUNTIME_MODES.CLOUD;
  }

  /**
   * Set runtime mode manually
   * @param {string} mode - Mode to set
   */
  setMode(mode) {
    if (!MODE_CONFIGS[mode]) {
      throw new Error(`Invalid runtime mode: ${mode}`);
    }

    this.currentMode = mode;
    this.autoDetected = false;

    // Save to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('runtimeMode', mode);
      }
    } catch (error) {
      console.error('Error saving runtime mode:', error);
    }

    this.notifyListeners();
  }

  /**
   * Get specific config value
   * @param {string} key - Config key
   * @returns {any} Config value
   */
  getConfigValue(key) {
    return MODE_CONFIGS[this.currentMode][key];
  }

  /**
   * Check if a feature should be enabled based on current mode
   * @param {string} feature - Feature name
   * @returns {boolean} True if feature should be enabled
   */
  shouldEnableFeature(feature) {
    // Mobile mode disables resource-intensive features
    if (this.isMobile()) {
      const intensiveFeatures = ['stressTest', 'advancedAnalytics', 'autoRecovery'];
      if (intensiveFeatures.includes(feature)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all available modes
   * @returns {object} All mode configurations
   */
  getAllModes() {
    return { ...MODE_CONFIGS };
  }

  /**
   * Subscribe to mode changes
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    const config = this.getConfig();
    this.listeners.forEach(callback => {
      try {
        callback(this.currentMode, config);
      } catch (error) {
        console.error('Error in runtime manager listener:', error);
      }
    });
  }

  /**
   * Get performance metrics recommendation
   * @returns {object} Performance settings
   */
  getPerformanceSettings() {
    const config = this.getConfig();
    
    return {
      shouldThrottle: this.isMobile(),
      throttleDelay: this.isMobile() ? 500 : 100,
      shouldDebounce: true,
      debounceDelay: this.isMobile() ? 1000 : 300,
      maxConcurrentRequests: config.maxConcurrentTasks,
      cacheStrategy: this.isMobile() ? 'aggressive' : 'moderate'
    };
  }

  /**
   * Get UI optimization settings
   * @returns {object} UI settings
   */
  getUISettings() {
    const config = this.getConfig();
    
    return {
      enableAnimations: config.enableAnimations,
      theme: config.theme,
      touchOptimized: config.touchOptimized,
      buttonSize: this.isMobile() ? 'large' : 'medium',
      fontSize: this.isMobile() ? 'large' : 'medium',
      spacing: this.isMobile() ? 'comfortable' : 'compact'
    };
  }
}

// Singleton instance
const runtimeManager = new RuntimeManager();

export default runtimeManager;
export { RUNTIME_MODES, MODE_CONFIGS, RuntimeManager };
