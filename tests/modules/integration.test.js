/**
 * Integration tests for Feature Toggle and Runtime Management
 */

import featureToggleManager from '../../src/shared/featureToggles.js';
import runtimeManager from '../../src/shared/runtimeManager.js';
import configManager from '../../src/shared/configManager.js';

describe('Feature Toggle System', () => {
  beforeEach(() => {
    featureToggleManager.resetToDefaults();
  });

  test('should have all default features enabled', () => {
    const features = featureToggleManager.getAllFeatures();
    expect(features.aiBot).toBe(true);
    expect(features.wizardPro).toBe(true);
    expect(features.quantumEngine).toBe(true);
  });

  test('should toggle features on and off', () => {
    expect(featureToggleManager.isEnabled('aiBot')).toBe(true);
    
    featureToggleManager.disable('aiBot');
    expect(featureToggleManager.isEnabled('aiBot')).toBe(false);
    
    featureToggleManager.enable('aiBot');
    expect(featureToggleManager.isEnabled('aiBot')).toBe(true);
  });

  test('should toggle multiple features', () => {
    featureToggleManager.toggle('stressTest');
    expect(featureToggleManager.isEnabled('stressTest')).toBe(false);
    
    featureToggleManager.toggle('stressTest');
    expect(featureToggleManager.isEnabled('stressTest')).toBe(true);
  });

  test('should export and import features', () => {
    featureToggleManager.disable('aiBot');
    featureToggleManager.disable('wizardPro');
    
    const exported = featureToggleManager.exportToJSON();
    const parsed = JSON.parse(exported);
    
    expect(parsed.aiBot).toBe(false);
    expect(parsed.wizardPro).toBe(false);
    
    featureToggleManager.resetToDefaults();
    expect(featureToggleManager.isEnabled('aiBot')).toBe(true);
    
    featureToggleManager.importFromJSON(exported);
    expect(featureToggleManager.isEnabled('aiBot')).toBe(false);
  });

  test('should notify listeners on changes', (done) => {
    const unsubscribe = featureToggleManager.subscribe((featureName, value) => {
      expect(featureName).toBe('aiBot');
      expect(value).toBe(false);
      unsubscribe();
      done();
    });
    
    featureToggleManager.disable('aiBot');
  });
});

describe('Runtime Manager', () => {
  test('should detect runtime mode', () => {
    const mode = runtimeManager.getMode();
    expect(['mobile', 'regular', 'cloud']).toContain(mode);
  });

  test('should provide mode configuration', () => {
    const config = runtimeManager.getConfig();
    expect(config).toHaveProperty('maxConcurrentTasks');
    expect(config).toHaveProperty('pollingInterval');
    expect(config).toHaveProperty('enableAnimations');
  });

  test('should allow manual mode setting', () => {
    runtimeManager.setMode('mobile');
    expect(runtimeManager.isMobile()).toBe(true);
    expect(runtimeManager.isRegular()).toBe(false);
    expect(runtimeManager.isCloud()).toBe(false);
    
    runtimeManager.setMode('regular');
    expect(runtimeManager.isRegular()).toBe(true);
    expect(runtimeManager.isMobile()).toBe(false);
  });

  test('should provide performance settings', () => {
    runtimeManager.setMode('mobile');
    const perfSettings = runtimeManager.getPerformanceSettings();
    
    expect(perfSettings.shouldThrottle).toBe(true);
    expect(perfSettings.throttleDelay).toBe(500);
    expect(perfSettings.maxConcurrentRequests).toBeLessThanOrEqual(5);
  });

  test('should provide UI settings', () => {
    runtimeManager.setMode('mobile');
    const uiSettings = runtimeManager.getUISettings();
    
    expect(uiSettings.touchOptimized).toBe(true);
    expect(uiSettings.enableAnimations).toBe(false);
    expect(uiSettings.buttonSize).toBe('large');
  });

  test('should restrict features in mobile mode', () => {
    runtimeManager.setMode('mobile');
    
    expect(runtimeManager.shouldEnableFeature('stressTest')).toBe(false);
    expect(runtimeManager.shouldEnableFeature('aiBot')).toBe(true);
  });

  test('should notify listeners on mode change', (done) => {
    const unsubscribe = runtimeManager.subscribe((mode) => {
      expect(mode).toBe('cloud');
      unsubscribe();
      done();
    });
    
    runtimeManager.setMode('cloud');
  });
});

describe('Config Manager Integration', () => {
  test('should combine features and runtime', () => {
    const allConfig = configManager.getAll();
    
    expect(allConfig).toHaveProperty('features');
    expect(allConfig).toHaveProperty('runtime');
    expect(allConfig).toHaveProperty('runtimeConfig');
  });

  test('should check feature enabled with runtime consideration', () => {
    runtimeManager.setMode('mobile');
    featureToggleManager.enable('stressTest');
    
    // Stress test should be disabled on mobile even if toggled on
    const isEnabled = configManager.isFeatureEnabled('stressTest');
    expect(isEnabled).toBe(false);
  });

  test('should get and set configuration values', () => {
    configManager.set('maxPositionSize', 5000);
    expect(configManager.get('maxPositionSize')).toBe(5000);
  });

  test('should update multiple values', () => {
    configManager.update({
      maxPositionSize: 10000,
      maxDailyLoss: 2000,
      riskLevel: 'aggressive'
    });
    
    expect(configManager.get('maxPositionSize')).toBe(10000);
    expect(configManager.get('maxDailyLoss')).toBe(2000);
    expect(configManager.get('riskLevel')).toBe('aggressive');
  });

  test('should validate configuration', () => {
    configManager.set('maxPositionSize', 1000);
    configManager.set('maxDailyLoss', 500);
    
    const validation = configManager.validateConfig();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should detect invalid configuration', () => {
    configManager.set('maxPositionSize', -100);
    
    const validation = configManager.validateConfig();
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  test('should export and import configuration', () => {
    configManager.set('maxPositionSize', 7500);
    featureToggleManager.disable('aiBot');
    runtimeManager.setMode('cloud');
    
    const exported = configManager.exportConfig();
    
    expect(exported.config.maxPositionSize).toBe(7500);
    expect(exported.features.aiBot).toBe(false);
    expect(exported.runtime).toBe('cloud');
    
    // Reset and import
    configManager.resetToDefaults();
    configManager.importConfig(exported);
    
    expect(configManager.get('maxPositionSize')).toBe(7500);
    expect(featureToggleManager.isEnabled('aiBot')).toBe(false);
    expect(runtimeManager.getMode()).toBe('cloud');
  });

  test('should notify listeners on changes', (done) => {
    const unsubscribe = configManager.subscribe((key, config) => {
      if (key === 'maxPositionSize') {
        expect(config.maxPositionSize).toBe(15000);
        unsubscribe();
        done();
      }
    });
    
    configManager.set('maxPositionSize', 15000);
  });
});

describe('Cross-Module Integration', () => {
  test('runtime mode should affect config manager', () => {
    runtimeManager.setMode('mobile');
    
    const runtimeConfig = configManager.getRuntimeConfig();
    expect(runtimeConfig.maxConcurrentTasks).toBe(2);
    expect(runtimeConfig.pollingInterval).toBe(5000);
  });

  test('feature toggles should work with config manager', () => {
    featureToggleManager.enable('aiBot');
    expect(configManager.isFeatureEnabled('aiBot')).toBe(true);
    
    featureToggleManager.disable('aiBot');
    expect(configManager.isFeatureEnabled('aiBot')).toBe(false);
  });

  test('mobile mode should disable resource-intensive features', () => {
    runtimeManager.setMode('mobile');
    featureToggleManager.enable('stressTest');
    featureToggleManager.enable('advancedAnalytics');
    
    // Both should be considered disabled on mobile
    expect(configManager.isFeatureEnabled('stressTest')).toBe(false);
    expect(configManager.isFeatureEnabled('advancedAnalytics')).toBe(false);
  });

  test('regular mode should allow all features', () => {
    runtimeManager.setMode('regular');
    featureToggleManager.enable('stressTest');
    featureToggleManager.enable('advancedAnalytics');
    
    expect(configManager.isFeatureEnabled('stressTest')).toBe(true);
    expect(configManager.isFeatureEnabled('advancedAnalytics')).toBe(true);
  });

  test('should maintain state across module interactions', () => {
    // Configure system
    runtimeManager.setMode('regular');
    featureToggleManager.disable('todoList');
    featureToggleManager.disable('complianceChecks');
    configManager.set('riskLevel', 'conservative');
    configManager.set('maxPositionSize', 3000);
    
    // Verify state is maintained
    expect(runtimeManager.isRegular()).toBe(true);
    expect(featureToggleManager.isEnabled('todoList')).toBe(false);
    expect(featureToggleManager.isEnabled('complianceChecks')).toBe(false);
    expect(configManager.get('riskLevel')).toBe('conservative');
    expect(configManager.get('maxPositionSize')).toBe(3000);
    
    // Export entire state
    const exported = configManager.exportConfig();
    
    // Reset everything
    configManager.resetToDefaults();
    runtimeManager.setMode('mobile');
    
    // Import state
    configManager.importConfig(exported);
    
    // Verify restored
    expect(runtimeManager.isRegular()).toBe(true);
    expect(featureToggleManager.isEnabled('todoList')).toBe(false);
    expect(configManager.get('riskLevel')).toBe('conservative');
  });
});

describe('Performance and Edge Cases', () => {
  test('should handle rapid toggle changes', () => {
    const initialState = featureToggleManager.isEnabled('aiBot');
    for (let i = 0; i < 100; i++) {
      featureToggleManager.toggle('aiBot');
    }
    // Should be back to original state (even number of toggles)
    expect(featureToggleManager.isEnabled('aiBot')).toBe(initialState);
  });

  test('should handle multiple listeners without issues', () => {
    let callCount = 0;
    const listener1 = () => callCount++;
    const listener2 = () => callCount++;
    const listener3 = () => callCount++;
    
    const unsub1 = featureToggleManager.subscribe(listener1);
    const unsub2 = featureToggleManager.subscribe(listener2);
    const unsub3 = featureToggleManager.subscribe(listener3);
    
    featureToggleManager.toggle('aiBot');
    expect(callCount).toBe(3);
    
    unsub1();
    unsub2();
    unsub3();
  });

  test('should handle invalid mode gracefully', () => {
    expect(() => {
      runtimeManager.setMode('invalid');
    }).toThrow();
    
    // Should maintain previous valid mode
    const mode = runtimeManager.getMode();
    expect(['mobile', 'regular', 'cloud']).toContain(mode);
  });

  test('should handle configuration with missing values', () => {
    configManager.set('maxPositionSize', 3000);
    const exported = configManager.exportConfig();
    
    // Create a minimal import without maxPositionSize
    const minimalImport = {
      config: {
        riskLevel: 'aggressive'
      },
      features: exported.features,
      runtime: exported.runtime
    };
    
    configManager.importConfig(minimalImport);
    
    // maxPositionSize should still be present from before since import merges
    const currentValue = configManager.get('maxPositionSize');
    expect(currentValue).toBe(3000); // Should keep previous value
    
    // New value should be applied
    expect(configManager.get('riskLevel')).toBe('aggressive');
  });
});
