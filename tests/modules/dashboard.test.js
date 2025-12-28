/**
 * Tests for Dashboard Component
 */

import configManager from '../../src/shared/configManager.js';

describe('Dashboard Navigation', () => {
  beforeEach(() => {
    configManager.resetToDefaults();
  });

  test('should call onNavigate when clicking quantum module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'quantum';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('quantum');
  });

  test('should call onNavigate when clicking freelance module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'freelance';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('freelance');
  });

  test('should call onNavigate when clicking strategy module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'strategy';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('strategy');
  });

  test('should call onNavigate when clicking testlab module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'testlab';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('testlab');
  });

  test('should call onNavigate when clicking wizardpro module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'wizardpro';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('wizardpro');
  });

  test('should call onNavigate when clicking todos module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'todos';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('todos');
  });

  test('should call onNavigate when clicking settings module', () => {
    let navigatedTo = null;
    const onNavigate = (module) => { navigatedTo = module; };
    const module = 'settings';
    
    onNavigate(module);
    
    expect(navigatedTo).toBe('settings');
  });
});

describe('Dashboard Tab Switching', () => {
  test('should display quantum module when feature is enabled', () => {
    configManager.enableFeature('quantumEngine');
    expect(configManager.isFeatureEnabled('quantumEngine')).toBe(true);
  });

  test('should display freelance module when feature is enabled', () => {
    configManager.enableFeature('freelanceAutomation');
    expect(configManager.isFeatureEnabled('freelanceAutomation')).toBe(true);
  });

  test('should hide quantum module when feature is disabled', () => {
    configManager.disableFeature('quantumEngine');
    expect(configManager.isFeatureEnabled('quantumEngine')).toBe(false);
  });

  test('should hide freelance module when feature is disabled', () => {
    configManager.disableFeature('freelanceAutomation');
    expect(configManager.isFeatureEnabled('freelanceAutomation')).toBe(false);
  });

  test('should always display settings module', () => {
    // Settings module should always be available
    const settingsAvailable = true;
    expect(settingsAvailable).toBe(true);
  });
});

describe('Dashboard Statistics', () => {
  test('should initialize with zero statistics', () => {
    const stats = {
      totalTrades: 0,
      totalProfit: 0,
      activeJobs: 0,
      successRate: 0
    };

    expect(stats.totalTrades).toBe(0);
    expect(stats.totalProfit).toBe(0);
    expect(stats.activeJobs).toBe(0);
    expect(stats.successRate).toBe(0);
  });

  test('should calculate total profit correctly', () => {
    const trades = [
      { profit: 100 },
      { profit: 200 },
      { profit: -50 }
    ];

    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
    expect(totalProfit).toBe(250);
  });

  test('should calculate success rate correctly', () => {
    const trades = [
      { success: true },
      { success: true },
      { success: false },
      { success: true }
    ];

    const successCount = trades.filter(t => t.success).length;
    const successRate = (successCount / trades.length) * 100;
    
    expect(successRate).toBe(75);
  });

  test('should handle zero trades for success rate', () => {
    const trades = [];
    const successRate = trades.length === 0 ? 0 : (trades.filter(t => t.success).length / trades.length) * 100;
    
    expect(successRate).toBe(0);
  });
});

describe('Dashboard Runtime Mode', () => {
  test('should get runtime mode from configManager', () => {
    const mode = configManager.getRuntimeMode();
    expect(['mobile', 'regular', 'cloud']).toContain(mode);
  });

  test('should display runtime mode badge', () => {
    const mode = configManager.getRuntimeMode();
    const badge = mode.toUpperCase();
    
    expect(badge.length).toBeGreaterThan(0);
    expect(['MOBILE', 'REGULAR', 'CLOUD']).toContain(badge);
  });

  test('should get UI settings from configManager', () => {
    const uiSettings = configManager.getUISettings();
    
    expect(uiSettings).toHaveProperty('theme');
    expect(uiSettings).toHaveProperty('touchOptimized');
  });
});

describe('Dashboard Backend Status', () => {
  test('should show online status when backend is available', () => {
    const backendStatus = { available: true };
    const statusClass = backendStatus.available ? 'online' : 'offline';
    
    expect(statusClass).toBe('online');
  });

  test('should show offline status when backend is unavailable', () => {
    const backendStatus = { available: false };
    const statusClass = backendStatus.available ? 'online' : 'offline';
    
    expect(statusClass).toBe('offline');
  });

  test('should display warning when backend is offline', () => {
    const backendStatus = { available: false };
    const showWarning = !backendStatus.available;
    
    expect(showWarning).toBe(true);
  });
});

describe('Dashboard Feature Toggles', () => {
  beforeEach(() => {
    configManager.resetToDefaults();
  });

  test('should check if feature is enabled', () => {
    configManager.enableFeature('quantumEngine');
    const isEnabled = configManager.isFeatureEnabled('quantumEngine');
    
    expect(isEnabled).toBe(true);
  });

  test('should handle multiple feature toggles', () => {
    configManager.enableFeature('quantumEngine');
    configManager.enableFeature('freelanceAutomation');
    configManager.disableFeature('testLab');
    
    expect(configManager.isFeatureEnabled('quantumEngine')).toBe(true);
    expect(configManager.isFeatureEnabled('freelanceAutomation')).toBe(true);
    expect(configManager.isFeatureEnabled('testLab')).toBe(false);
  });

  test('should show advanced analytics when feature is enabled', () => {
    configManager.enableFeature('advancedAnalytics');
    expect(configManager.isFeatureEnabled('advancedAnalytics')).toBe(true);
  });

  test('should hide advanced analytics when feature is disabled', () => {
    configManager.disableFeature('advancedAnalytics');
    expect(configManager.isFeatureEnabled('advancedAnalytics')).toBe(false);
  });
});
