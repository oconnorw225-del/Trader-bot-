/**
 * Feature Toggle System
 * Manages feature flags for all major modules with localStorage and config file persistence
 */

const DEFAULT_FEATURES = {
  aiBot: true,
  wizardPro: true,
  stressTest: true,
  strategyManagement: true,
  todoList: true,
  quantumEngine: true,
  freelanceAutomation: true,
  testLab: true,
  advancedAnalytics: true,
  riskManagement: true,
  autoRecovery: true,
  complianceChecks: true
};

class FeatureToggleManager {
  constructor() {
    this.features = { ...DEFAULT_FEATURES };
    this.listeners = new Set();
    this.saveTimeout = null;
    this.saveDelay = 500; // Debounce localStorage writes by 500ms
    this.loadFeatures();
  }

  /**
   * Load features from localStorage
   */
  loadFeatures() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('featureToggles');
        if (stored) {
          this.features = { ...DEFAULT_FEATURES, ...JSON.parse(stored) };
        }
      }
    } catch (error) {
      console.error('Error loading feature toggles:', error);
    }
  }

  /**
   * Save features to localStorage (debounced)
   */
  saveFeatures() {
    // Clear existing timeout if any
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Debounce saves to reduce localStorage writes
    this.saveTimeout = setTimeout(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('featureToggles', JSON.stringify(this.features));
        }
      } catch (error) {
        console.error('Error saving feature toggles:', error);
      }
      this.saveTimeout = null;
    }, this.saveDelay);
  }
  
  /**
   * Save features immediately without debouncing
   */
  saveFeaturesNow() {
    // Clear any pending debounced save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('featureToggles', JSON.stringify(this.features));
      }
    } catch (error) {
      console.error('Error saving feature toggles:', error);
    }
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureName - Name of the feature
   * @returns {boolean} True if enabled
   */
  isEnabled(featureName) {
    return this.features[featureName] === true;
  }

  /**
   * Enable a feature
   * @param {string} featureName - Name of the feature
   */
  enable(featureName) {
    this.features[featureName] = true;
    this.saveFeatures();
    this.notifyListeners(featureName, true);
  }

  /**
   * Disable a feature
   * @param {string} featureName - Name of the feature
   */
  disable(featureName) {
    this.features[featureName] = false;
    this.saveFeatures();
    this.notifyListeners(featureName, false);
  }

  /**
   * Toggle a feature
   * @param {string} featureName - Name of the feature
   */
  toggle(featureName) {
    const newValue = !this.features[featureName];
    this.features[featureName] = newValue;
    this.saveFeatures();
    this.notifyListeners(featureName, newValue);
  }

  /**
   * Set multiple features at once
   * @param {object} features - Feature flags object
   */
  setFeatures(features) {
    this.features = { ...this.features, ...features };
    this.saveFeatures();
    this.notifyListeners();
  }

  /**
   * Get all features
   * @returns {object} All feature flags
   */
  getAllFeatures() {
    return { ...this.features };
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    this.features = { ...DEFAULT_FEATURES };
    this.saveFeatures();
    this.notifyListeners();
  }

  /**
   * Subscribe to feature changes
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   * @param {string} featureName - Optional specific feature
   * @param {boolean} value - Optional new value
   */
  notifyListeners(featureName, value) {
    this.listeners.forEach(callback => {
      try {
        callback(featureName, value, this.features);
      } catch (error) {
        console.error('Error in feature toggle listener:', error);
      }
    });
  }

  /**
   * Export features to JSON string
   * @returns {string} JSON string of features
   */
  exportToJSON() {
    return JSON.stringify(this.features, null, 2);
  }

  /**
   * Import features from JSON string
   * @param {string} json - JSON string
   */
  importFromJSON(json) {
    try {
      const features = JSON.parse(json);
      this.setFeatures(features);
      return true;
    } catch (error) {
      console.error('Error importing features:', error);
      return false;
    }
  }
}

// Singleton instance
const featureToggleManager = new FeatureToggleManager();

export default featureToggleManager;
export { DEFAULT_FEATURES, FeatureToggleManager };
