import React, { useState } from 'react';
import Dashboard from './Dashboard';

const wizardSteps = [
  'Welcome',
  'Platform Setup',
  'API & Wallet Config',
  'AI Model Selection',
  'Job/Trade Preferences',
  'Risk Management',
  'Launch'
];

export default function Wizard() {
  const [mode, setMode] = useState('both');
  const [step, setStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);
  const [config, setConfig] = useState({
    ndaxApiKey: '',
    ndaxApiSecret: '',
    ndaxUserId: '',
    upworkClientId: '',
    upworkClientSecret: '',
    fiverrApiKey: '',
    freelancerToken: '',
    toptalApiKey: '',
    guruApiKey: '',
    peopleperhourApiKey: '',
    openaiApiKey: '',
    huggingfaceApiKey: '',
    encryptionKey: '',
    jwtSecret: '',
    maxPositionSize: 10000,
    maxDailyLoss: 1000,
    riskLevel: 'moderate',
    enableAutoRecovery: true,
    backupIntervalMinutes: 30
  });

  // Production: require all keys for launch
  const requiredKeys = [
    'ndaxApiKey', 'ndaxApiSecret', 'ndaxUserId',
    'upworkClientId', 'upworkClientSecret', 'fiverrApiKey',
    'freelancerToken', 'toptalApiKey', 'guruApiKey', 'peopleperhourApiKey'
  ];
  const canProceed = requiredKeys.every(k => !!config[k]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    if (!canProceed) {
      alert('All required API keys and secrets must be entered for production use!');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        alert('Configuration saved successfully! Launching dashboard...');
        setSetupComplete(true);
      }
    } catch (error) {
      alert('Configuration failed. Please ensure all fields are set and try again.');
    }
  };

  const renderStep = () => {
    // Remove all demo mode options and alerts
    switch(step) {
      case 0: // Welcome
        return (
          <div className="wizard-content">
            <h2>Welcome to NDAX Quantum Engine</h2>
            <p>This wizard will help you set up your quantum trading and AI freelance automation system.</p>
            <div className="form-group">
              <label>Choose your mode:</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="form-control">
                <option value="quantum">Quantum Trading Only</option>
                <option value="freelance">Freelance Automation Only</option>
                <option value="both">Both (Recommended)</option>
              </select>
            </div>
          </div>
        );
      case 1: // Platform Setup
        return (
          <div className="wizard-content">
            <h2>Platform Setup</h2>
            {mode !== 'freelance' && (
              <div className="platform-card">
                <h3>🔷 Trading Platform</h3>
                <p>NDAX Exchange Integration</p>
              </div>
            )}
            {mode !== 'quantum' && (
              <div className="platform-grid">
                <div className="platform-card">Upwork</div>
                <div className="platform-card">Fiverr</div>
                <div className="platform-card">Freelancer</div>
                <div className="platform-card">Toptal</div>
                <div className="platform-card">Guru</div>
                <div className="platform-card">PeoplePerHour</div>
              </div>
            )}
          </div>
        );
      case 2: // API & Wallet Config
        return (
          <div className="wizard-content">
            <h2>API & Configuration</h2>
            {mode !== 'freelance' && (
              <div className="card">
                <h3>Trading API Keys</h3>
                <div className="form-group">
                  <label>NDAX API Key</label>
                  <input
                    type="password"
                    value={config.ndaxApiKey}
                    onChange={e => updateConfig('ndaxApiKey', e.target.value)}
                    placeholder="Enter your NDAX API key"
                  />
                </div>
                <div className="form-group">
                  <label>NDAX API Secret</label>
                  <input
                    type="password"
                    value={config.ndaxApiSecret}
                    onChange={e => updateConfig('ndaxApiSecret', e.target.value)}
                    placeholder="Enter your NDAX API secret"
                  />
                </div>
                <div className="form-group">
                  <label>NDAX User ID</label>
                  <input
                    type="text"
                    value={config.ndaxUserId}
                    onChange={e => updateConfig('ndaxUserId', e.target.value)}
                    placeholder="Enter your NDAX user ID"
                  />
                </div>
              </div>
            )}
            {mode !== 'quantum' && (
              <div className="card">
                <h3>Freelance Platform Keys</h3>
                <div className="form-group">
                  <label>Upwork Client ID</label>
                  <input
                    type="password"
                    value={config.upworkClientId}
                    onChange={e => updateConfig('upworkClientId', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fiverr API Key</label>
                  <input
                    type="password"
                    value={config.fiverrApiKey}
                    onChange={e => updateConfig('fiverrApiKey', e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="card">
              <h3>Security Settings</h3>
              <div className="form-group">
                <label>Encryption Key (32 characters)</label>
                <input
                  type="password"
                  value={config.encryptionKey}
                  onChange={e => updateConfig('encryptionKey', e.target.value)}
                  placeholder="Enter 32-character encryption key"
                />
              </div>
            </div>
          </div>
        );
      // Remaining steps unchanged, but remove any reference/example to demo
      // ...
      case 6: // Launch
        return (
          <div className="wizard-content">
            <h2>🚀 Ready to Launch!</h2>
            <div className="alert alert-success">
              Your system is configured and ready to use.
            </div>
            <button className="btn btn-primary" onClick={saveConfig} disabled={!canProceed}>
              Save Configuration & Launch Dashboard
            </button>
            <div className="mt-4">
              <p><strong>Next Step:</strong> Click &quot;Save Configuration &amp; Launch Dashboard&quot; to complete setup.</p>
              <p>You can reconfigure at any time from the Settings tab in the Dashboard.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (setupComplete) {
    return <Dashboard mode={mode} config={config} />;
  }

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>🎯 NDAX Quantum Engine Setup</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{width: `${((step + 1) / wizardSteps.length) * 100}%`}}
          />
        </div>
        <p>Step {step + 1} of {wizardSteps.length}: {wizardSteps[step]}</p>
      </div>

      {renderStep()}

      <div className="wizard-footer">
        <button
          className="btn btn-secondary"
          disabled={step === 0}
          onClick={() => setStep(s => Math.max(0, s - 1))}
        >
          ← Previous
        </button>
        <button
          className="btn btn-primary"
          disabled={step === wizardSteps.length - 1 || !canProceed}
          onClick={() => setStep(s => Math.min(wizardSteps.length - 1, s + 1))}
        >
          {step === wizardSteps.length - 2 ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
