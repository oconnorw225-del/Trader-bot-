import React, { useState, useEffect } from 'react';
import configManager from '../shared/configManager.js';

export default function Dashboard({ onNavigate, config, backendStatus }) {
  const [runtimeMode, setRuntimeMode] = useState(configManager.getRuntimeMode());
  const [uiSettings, setUISettings] = useState(configManager.getUISettings());
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalProfit: 0,
    activeJobs: 0,
    successRate: 0
  });

  useEffect(() => {
    // Subscribe to config changes
    const unsubscribe = configManager.subscribe(() => {
      setRuntimeMode(configManager.getRuntimeMode());
      setUISettings(configManager.getUISettings());
    });

    // Load stats
    loadStats();

    return unsubscribe;
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${config.apiUrl || 'http://localhost:3000'}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log('Could not load stats:', error);
    }
  };

  const isFeatureEnabled = (feature) => {
    return configManager.isFeatureEnabled(feature);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚛️ NDAX Quantum Engine Dashboard</h1>
        <div className="header-info">
          <span className="runtime-badge">{runtimeMode.toUpperCase()}</span>
          <span className={`status-badge ${backendStatus.available ? 'online' : 'offline'}`}>
            {backendStatus.available ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {!backendStatus.available && (
        <div className="alert alert-warning">
          Backend is not available. Some features may not work properly.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Profit</div>
            <div className="stat-value">${stats.totalProfit.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Trades</div>
            <div className="stat-value">{stats.totalTrades}</div>
          </div>
        </div>
        
        {isFeatureEnabled('freelanceAutomation') && (
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <div className="stat-label">Active Jobs</div>
              <div className="stat-value">{stats.activeJobs}</div>
            </div>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">{stats.successRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        {isFeatureEnabled('quantumEngine') && (
          <div className="module-card" onClick={() => onNavigate('quantum')}>
            <div className="module-icon">⚛️</div>
            <h3>Quantum Trading</h3>
            <p>Execute quantum-based trading strategies</p>
            <div className="module-status">Ready</div>
          </div>
        )}

        {isFeatureEnabled('freelanceAutomation') && (
          <div className="module-card" onClick={() => onNavigate('freelance')}>
            <div className="module-icon">💼</div>
            <h3>Freelance Automation</h3>
            <p>Automated job search and application</p>
            <div className="module-status">Active</div>
          </div>
        )}

        {isFeatureEnabled('strategyManagement') && (
          <div className="module-card" onClick={() => onNavigate('strategy')}>
            <div className="module-icon">📝</div>
            <h3>Strategy Editor</h3>
            <p>Create and manage trading strategies</p>
            <div className="module-status">Ready</div>
          </div>
        )}

        {isFeatureEnabled('testLab') && (
          <div className="module-card" onClick={() => onNavigate('testlab')}>
            <div className="module-icon">🧪</div>
            <h3>Test Lab</h3>
            <p>Test and validate strategies</p>
            <div className="module-status">Ready</div>
          </div>
        )}

        {isFeatureEnabled('wizardPro') && (
          <div className="module-card" onClick={() => onNavigate('wizardpro')}>
            <div className="module-icon">🧙</div>
            <h3>Wizard Pro</h3>
            <p>AI-powered conversational setup</p>
            <div className="module-status">Available</div>
          </div>
        )}

        {isFeatureEnabled('todoList') && (
          <div className="module-card" onClick={() => onNavigate('todos')}>
            <div className="module-icon">📝</div>
            <h3>Task Manager</h3>
            <p>Manage your tasks and to-do lists</p>
            <div className="module-status">Ready</div>
          </div>
        )}

        <div className="module-card" onClick={() => onNavigate('settings')}>
          <div className="module-icon">⚙️</div>
          <h3>Settings</h3>
          <p>Configure features and preferences</p>
          <div className="module-status">Always Available</div>
        </div>
      </div>

      {isFeatureEnabled('advancedAnalytics') && (
        <div className="analytics-section">
          <h3>Quick Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Performance</h4>
              <div className="chart-placeholder">
                📈 Chart visualization available
              </div>
            </div>
            <div className="analytics-card">
              <h4>Risk Metrics</h4>
              <div className="risk-metrics">
                <div className="metric-row">
                  <span>Current Exposure:</span>
                  <strong>${(stats.totalTrades * 100).toFixed(2)}</strong>
                </div>
                <div className="metric-row">
                  <span>Risk Level:</span>
                  <strong className="risk-moderate">Moderate</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="footer-info">
        <div>Runtime Mode: <strong>{runtimeMode}</strong></div>
        <div>Theme: <strong>{uiSettings.theme}</strong></div>
        <div>Touch Optimized: <strong>{uiSettings.touchOptimized ? 'Yes' : 'No'}</strong></div>
      </div>
    </div>
  );
}
