/**
 * User Settings Manager
 * Manages user preferences and settings with localStorage persistence
 */

export class UserSettings {
  constructor() {
    this.settings = {};
    this.defaults = {
      theme: 'light',
      language: 'en',
      notifications: true,
      autoSave: true
    };
    this.autoSave = true;
    this.callbacks = new Map();
    this.load();
  }

  /**
   * Load settings from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem('ndax-user-settings');
      if (stored) {
        this.settings = JSON.parse(stored);
      } else {
        this.settings = { ...this.defaults };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { ...this.defaults };
    }
  }

  /**
   * Save settings to localStorage
   */
  save() {
    try {
      localStorage.setItem('ndax-user-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Get a setting value
   */
  get(key, defaultValue) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }

  /**
   * Set a setting value
   */
  set(key, value) {
    // Validate setting
    if (!this.isValid(key, value)) {
      throw new Error(`Invalid value for setting: ${key}`);
    }

    const oldValue = this.settings[key];
    this.settings[key] = value;

    // Trigger onChange callback
    this.triggerCallback(key, value, oldValue);

    // Auto-save if enabled
    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Set multiple settings at once
   */
  setMultiple(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      this.settings[key] = value;
    });

    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Get all settings
   */
  getAll() {
    return { ...this.settings };
  }

  /**
   * Reset all settings to defaults
   */
  reset() {
    this.settings = { ...this.defaults };
    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Reset a specific setting to default
   */
  resetSetting(key) {
    if (this.defaults[key] !== undefined) {
      this.settings[key] = this.defaults[key];
      if (this.autoSave) {
        this.save();
      }
    }
  }

  /**
   * Validate setting value
   */
  isValid(key, value) {
    const validators = {
      theme: (v) => ['light', 'dark'].includes(v),
      language: (v) => typeof v === 'string' && v.length === 2,
      notifications: (v) => typeof v === 'boolean'
    };

    return validators[key] ? validators[key](value) : true;
  }

  /**
   * Enable auto-save
   */
  enableAutoSave() {
    this.autoSave = true;
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    this.autoSave = false;
  }

  /**
   * Export settings as JSON string
   */
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = { ...this.defaults, ...imported };
      if (this.autoSave) {
        this.save();
      }
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Add onChange callback for a setting
   */
  onChange(key, callback) {
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key).push(callback);
  }

  /**
   * Remove onChange callback
   */
  offChange(key, callback) {
    if (this.callbacks.has(key)) {
      const callbacks = this.callbacks.get(key);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Trigger onChange callbacks
   */
  triggerCallback(key, newValue, oldValue) {
    if (this.callbacks.has(key)) {
      this.callbacks.get(key).forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error('Error in onChange callback:', error);
        }
      });
    }
  }
}

// Legacy functions for backward compatibility
export function saveSetting(key, value) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function loadSetting(key) {
  if (typeof localStorage !== 'undefined') {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  }
  return null;
}

// Export singleton instance
export default new UserSettings();
