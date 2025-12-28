import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
/**
 * User Settings Tests
 * Tests for user settings management and persistence
 */

import { UserSettings } from '../../src/shared/userSettings.js';

describe('UserSettings', () => {
  let settings;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    settings = new UserSettings();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      const defaults = settings.getAll();
      expect(defaults).toBeDefined();
      expect(typeof defaults).toBe('object');
    });

    test('should load settings from localStorage if available', () => {
      localStorage.setItem('ndax-user-settings', JSON.stringify({ theme: 'dark' }));
      const newSettings = new UserSettings();
      expect(newSettings.get('theme')).toBe('dark');
    });
  });

  describe('Get/Set Operations', () => {
    test('should set and get a setting', () => {
      settings.set('theme', 'dark');
      expect(settings.get('theme')).toBe('dark');
    });

    test('should set multiple settings', () => {
      settings.setMultiple({
        theme: 'dark',
        language: 'en',
        notifications: true
      });
      
      expect(settings.get('theme')).toBe('dark');
      expect(settings.get('language')).toBe('en');
      expect(settings.get('notifications')).toBe(true);
    });

    test('should return undefined for non-existent setting', () => {
      expect(settings.get('nonExistent')).toBeUndefined();
    });

    test('should return default value if setting does not exist', () => {
      expect(settings.get('nonExistent', 'defaultValue')).toBe('defaultValue');
    });
  });

  describe('Persistence', () => {
    test('should persist settings to localStorage', () => {
      settings.set('theme', 'dark');
      settings.save();
      
      const stored = JSON.parse(localStorage.getItem('ndax-user-settings'));
      expect(stored.theme).toBe('dark');
    });

    test('should auto-save on set if enabled', () => {
      settings.enableAutoSave();
      settings.set('theme', 'dark');
      
      const stored = JSON.parse(localStorage.getItem('ndax-user-settings'));
      expect(stored.theme).toBe('dark');
    });

    test('should not auto-save if disabled', () => {
      settings.disableAutoSave();
      settings.set('theme', 'dark');
      
      const stored = localStorage.getItem('ndax-user-settings');
      expect(stored).toBeNull();
    });
  });

  describe('Reset Operations', () => {
    test('should reset all settings to defaults', () => {
      settings.set('theme', 'dark');
      settings.set('language', 'es');
      settings.reset();
      
      const allSettings = settings.getAll();
      expect(allSettings.theme).not.toBe('dark');
      expect(allSettings.language).not.toBe('es');
    });

    test('should reset specific setting to default', () => {
      settings.set('theme', 'dark');
      settings.resetSetting('theme');
      
      expect(settings.get('theme')).not.toBe('dark');
    });
  });

  describe('Validation', () => {
    test('should validate setting values', () => {
      expect(settings.isValid('theme', 'dark')).toBe(true);
      expect(settings.isValid('theme', 'invalidTheme')).toBe(false);
    });

    test('should reject invalid setting values', () => {
      expect(() => settings.set('theme', 'invalidTheme')).toThrow();
    });

    test('should accept valid setting values', () => {
      expect(() => settings.set('theme', 'dark')).not.toThrow();
    });
  });

  describe('Export/Import', () => {
    test('should export settings as JSON', () => {
      settings.set('theme', 'dark');
      settings.set('language', 'en');
      
      const exported = settings.export();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.theme).toBe('dark');
      expect(parsed.language).toBe('en');
    });

    test('should import settings from JSON', () => {
      const settingsData = JSON.stringify({
        theme: 'dark',
        language: 'es',
        notifications: false
      });
      
      settings.import(settingsData);
      
      expect(settings.get('theme')).toBe('dark');
      expect(settings.get('language')).toBe('es');
      expect(settings.get('notifications')).toBe(false);
    });

    test('should handle invalid JSON on import', () => {
      expect(() => settings.import('invalid json')).toThrow();
    });
  });

  describe('Event Listeners', () => {
    test('should trigger onChange callback when setting changes', (done) => {
      settings.onChange('theme', (newValue, oldValue) => {
        try {
          expect(newValue).toBe('dark');
          expect(oldValue).toBe('light'); // Default value
          done();
        } catch (error) {
          done(error);
        }
      });
      
      settings.set('theme', 'dark');
    });

    test('should remove onChange callback', () => {
      let callbackCalled = false;
      const callback = () => {
        callbackCalled = true;
      };
      settings.onChange('theme', callback);
      settings.offChange('theme', callback);
      
      settings.set('theme', 'dark');
      expect(callbackCalled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test('should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = global.localStorage.setItem;
      global.localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      };
      
      const settings = new UserSettings();
      expect(() => settings.save()).toThrow();
      
      global.localStorage.setItem = originalSetItem;
    });

    test('should handle corrupted localStorage data', () => {
      global.localStorage.setItem('ndax-user-settings', 'corrupted{data}');
      expect(() => new UserSettings()).not.toThrow();
    });
  });
});
