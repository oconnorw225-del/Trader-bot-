import React, { useState, useEffect } from 'react';
import configManager from '../shared/configManager.js';
import runtimeManager from '../shared/runtimeManager.js';
import { logout } from '../utils/auth.js';

export default function Settings({ onBack }) {
  const [config, setConfig] = useState(configManager.getAll());
  const [activeTab, setActiveTab] = useState('features');
  const [importExportText, setImportExportText] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    // Subscribe to config changes
    const unsubscribe = configManager.subscribe(() => {
      setConfig(configManager.getAll());
    });
    
    return unsubscribe;
  }, []);

  const handleFeatureToggle = (feature) => {
    if (config.features[feature]) {
      configManager.disableFeature(feature);
    } else {
      configManager.enableFeature(feature);
    }
  };

  const handleRuntimeModeChange = (mode) => {
    configManager.setRuntimeMode(mode);
  };

  const handleConfigChange = (key, value) => {
    configManager.set(key, value);
  };

  const handleExport = () => {
    const exported = configManager.exportConfig();
    setImportExportText(JSON.stringify(exported, null, 2));
  };

  const handleImport = () => {
    try {
      const imported = JSON.parse(importExportText);
      configManager.importConfig(imported);
      alert('Configuration imported successfully!');
      setImportExportText('');
    } catch (error) {
      alert('Invalid JSON: ' + error.message);
    }
  };

  const handleValidate = () => {
    const result = configManager.validateConfig();
    setValidationResult(result);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      configManager.resetToDefaults();
      alert('Settings reset to defaults');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out? You will need to enter the password again to access the dashboard.')) {
      logout();
    }
  };

  const renderFeaturesTab = () => {
    const features = config.features;
    
    return (
      <div className="settings-section">
        <h3>Feature Toggles</h3>
        <p>Enable or disable major features. Some features may be restricted based on runtime mode.</p>
        
        <div className="feature-grid">
          {Object.keys(features).map(feature => {
            const isEnabled = features[feature];
            const shouldEnable = runtimeManager.shouldEnableFeature(feature);
            const isRestricted = !shouldEnable && config.runtime === 'mobile';
            
            return (
              <div key={feature} className={`feature-card ${isEnabled ? 'enabled' : 'disabled'}`}>
                <div className="feature-header">
                  <label className="feature-label">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleFeatureToggle(feature)}
                      disabled={isRestricted}
                    />
                    <span className="feature-name">{formatFeatureName(feature)}</span>
                  </label>
                  {isRestricted && (
                    <span className="feature-badge">Restricted on Mobile</span>
                  )}
                </div>
                <p className="feature-description">{getFeatureDescription(feature)}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRuntimeTab = () => {
    const modes = runtimeManager.getAllModes();
    const currentMode = config.runtime;
    const runtimeConfig = config.runtimeConfig;
    const uiSettings = runtimeManager.getUISettings();
    
    return (
      <div className="settings-section">
        <h3>Runtime Mode</h3>
        <p>Select the runtime mode that best fits your environment.</p>
        
        <div className="mode-selector">
          {Object.keys(modes).map(mode => (
            <div
              key={mode}
              className={`mode-card ${currentMode === mode ? 'selected' : ''}`}
              onClick={() => handleRuntimeModeChange(mode)}
            >
              <h4>{modes[mode].name}</h4>
              <p>{modes[mode].description}</p>
              <div className="mode-specs">
                <div>Max Tasks: {modes[mode].maxConcurrentTasks}</div>
                <div>Poll Interval: {modes[mode].pollingInterval}ms</div>
                <div>Animations: {modes[mode].enableAnimations ? 'Yes' : 'No'}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="runtime-details">
          <h4>Current Configuration</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span>Mode:</span>
              <strong>{runtimeConfig.name}</strong>
            </div>
            <div className="detail-item">
              <span>Theme:</span>
              <strong>{uiSettings.theme}</strong>
            </div>
            <div className="detail-item">
              <span>Touch Optimized:</span>
              <strong>{uiSettings.touchOptimized ? 'Yes' : 'No'}</strong>
            </div>
            <div className="detail-item">
              <span>Max Concurrent Tasks:</span>
              <strong>{runtimeConfig.maxConcurrentTasks}</strong>
            </div>
            <div className="detail-item">
              <span>Cache Duration:</span>
              <strong>{runtimeConfig.cacheDuration / 1000}s</strong>
            </div>
            <div className="detail-item">
              <span>Animations:</span>
              <strong>{uiSettings.enableAnimations ? 'Enabled' : 'Disabled'}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralTab = () => {
    return (
      <div className="settings-section">
        <h3>General Settings</h3>
        
        <div className="form-group">
          <label>API URL</label>
          <input
            type="text"
            value={config.apiUrl}
            onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>API Timeout (ms)</label>
          <input
            type="number"
            value={config.apiTimeout}
            onChange={(e) => handleConfigChange('apiTimeout', parseInt(e.target.value))}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Theme</label>
          <select
            value={config.theme}
            onChange={(e) => handleConfigChange('theme', e.target.value)}
            className="form-control"
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="dimmed">Dimmed</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.notifications}
              onChange={(e) => handleConfigChange('notifications', e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.soundEffects}
              onChange={(e) => handleConfigChange('soundEffects', e.target.checked)}
            />
            Enable Sound Effects
          </label>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.debugMode}
              onChange={(e) => handleConfigChange('debugMode', e.target.checked)}
            />
            Debug Mode
          </label>
        </div>
      </div>
    );
  };

  const renderTradingTab = () => {
    return (
      <div className="settings-section">
        <h3>Trading Settings</h3>
        
        <div className="form-group">
          <label>Default Trading Pair</label>
          <select
            value={config.defaultTradingPair}
            onChange={(e) => handleConfigChange('defaultTradingPair', e.target.value)}
            className="form-control"
          >
            <option value="BTC/USD">BTC/USD</option>
            <option value="ETH/USD">ETH/USD</option>
            <option value="BTC/CAD">BTC/CAD</option>
            <option value="ETH/CAD">ETH/CAD</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Risk Level</label>
          <select
            value={config.riskLevel}
            onChange={(e) => handleConfigChange('riskLevel', e.target.value)}
            className="form-control"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Max Position Size ($)</label>
          <input
            type="number"
            value={config.maxPositionSize}
            onChange={(e) => handleConfigChange('maxPositionSize', parseInt(e.target.value))}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Max Daily Loss ($)</label>
          <input
            type="number"
            value={config.maxDailyLoss}
            onChange={(e) => handleConfigChange('maxDailyLoss', parseInt(e.target.value))}
            className="form-control"
          />
        </div>
      </div>
    );
  };

  const renderImportExportTab = () => {
    return (
      <div className="settings-section">
        <h3>Import/Export Configuration</h3>
        
        <div className="form-group">
          <label>Configuration JSON</label>
          <textarea
            value={importExportText}
            onChange={(e) => setImportExportText(e.target.value)}
            className="form-control"
            rows={15}
            placeholder="Paste configuration JSON here to import, or click Export to see current configuration"
          />
        </div>
        
        <div className="button-group">
          <button className="btn btn-primary" onClick={handleExport}>
            Export Configuration
          </button>
          <button className="btn btn-success" onClick={handleImport} disabled={!importExportText}>
            Import Configuration
          </button>
        </div>
        
        <div className="form-group mt-4">
          <button className="btn btn-info" onClick={handleValidate}>
            Validate Configuration
          </button>
          
          {validationResult && (
            <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
              <h4>{validationResult.valid ? '✓ Configuration Valid' : '✗ Configuration Invalid'}</h4>
              
              {validationResult.errors.length > 0 && (
                <div className="errors">
                  <strong>Errors:</strong>
                  <ul>
                    {validationResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div className="warnings">
                  <strong>Warnings:</strong>
                  <ul>
                    {validationResult.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSecurityTab = () => {
    return (
      <div className="settings-section">
        <h3>Security Settings</h3>
        
        <div className="security-info">
          <p>
            This application is protected by password authentication. 
            Your session will remain active for 24 hours or until you log out.
          </p>
        </div>
        
        <div className="form-group">
          <label>Session Management</label>
          <div className="security-actions">
            <button 
              className="btn btn-warning" 
              onClick={handleLogout}
            >
              🔒 Log Out
            </button>
            <p className="help-text">
              Log out of the dashboard. You&apos;ll need to enter the password again to access.
            </p>
          </div>
        </div>
        
        <div className="form-group">
          <label>Security Information</label>
          <div className="info-box">
            <p><strong>🔐 Authentication:</strong> Password-protected access</p>
            <p><strong>⏱️ Session Duration:</strong> 24 hours</p>
            <p><strong>🛡️ Rate Limiting:</strong> Max 5 failed login attempts</p>
            <p><strong>🔒 Lockout Duration:</strong> 15 minutes after failed attempts</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button onClick={onBack} className="btn-back">← Back</button>
        <h2>⚙️ Settings & Configuration</h2>
        <button onClick={handleReset} className="btn btn-danger">
          Reset to Defaults
        </button>
      </div>
      
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Feature Toggles
        </button>
        <button
          className={`tab ${activeTab === 'runtime' ? 'active' : ''}`}
          onClick={() => setActiveTab('runtime')}
        >
          Runtime Mode
        </button>
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'trading' ? 'active' : ''}`}
          onClick={() => setActiveTab('trading')}
        >
          Trading
        </button>
        <button
          className={`tab ${activeTab === 'importexport' ? 'active' : ''}`}
          onClick={() => setActiveTab('importexport')}
        >
          Import/Export
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'features' && renderFeaturesTab()}
        {activeTab === 'runtime' && renderRuntimeTab()}
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'trading' && renderTradingTab()}
        {activeTab === 'importexport' && renderImportExportTab()}
        {activeTab === 'security' && renderSecurityTab()}
      </div>
    </div>
  );
}

// Helper functions
function formatFeatureName(name) {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function getFeatureDescription(feature) {
  const descriptions = {
    aiBot: 'Enable AI-powered trading and freelance automation bot',
    wizardPro: 'Advanced setup wizard with natural language processing',
    stressTest: 'Performance and load testing capabilities',
    strategyManagement: 'Trading strategy editor and management',
    todoList: 'Task management and tracking',
    quantumEngine: 'Quantum trading algorithms and strategies',
    freelanceAutomation: 'Automated freelance platform integration',
    testLab: 'Testing environment for strategies and features',
    advancedAnalytics: 'Detailed analytics and reporting',
    riskManagement: 'Risk assessment and management tools',
    autoRecovery: 'Automatic crash recovery and backups',
    complianceChecks: 'Regulatory compliance monitoring'
  };
  
  return descriptions[feature] || 'No description available';
}
