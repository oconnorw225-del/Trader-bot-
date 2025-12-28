import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Dashboard from './components/Dashboard';
import QuantumEngine from './components/QuantumEngine';
import FreelanceAutomation from './components/FreelanceAutomation';
import WizardPro from './components/WizardPro';
import Settings from './components/Settings';
import TodoApp from './components/TodoApp';
import TestLab from './components/TestLab';
import QuantumEngineWizard from './components/QuantumEngineWizard';
import './styles/index.css';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [config, setConfig] = useState({
    apiUrl: window.location.origin,
    features: {}
  });
  const [backendStatus, setBackendStatus] = useState({
    available: false,
    lastCheck: null
  });

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setBackendStatus({
          available: true,
          lastCheck: new Date().toISOString()
        });
      } else {
        setBackendStatus({
          available: false,
          lastCheck: new Date().toISOString()
        });
      }
    } catch (error) {
      setBackendStatus({
        available: false,
        lastCheck: new Date().toISOString()
      });
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const saveConfig = (newConfig) => {
    setConfig({ ...config, ...newConfig });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            config={config}
            backendStatus={backendStatus}
          />
        );
      
      case 'quantum':
        return (
          <QuantumEngine
            onBack={() => handleNavigate('dashboard')}
            config={config}
            backendStatus={backendStatus}
          />
        );
      
      case 'freelance':
        return (
          <FreelanceAutomation
            onBack={() => handleNavigate('dashboard')}
            config={config}
            backendStatus={backendStatus}
          />
        );
      
      case 'wizard':
        return (
          <WizardPro
            onBack={() => handleNavigate('dashboard')}
            config={config}
            onUpdateConfig={saveConfig}
          />
        );
      
      case 'settings':
        return (
          <Settings
            onBack={() => handleNavigate('dashboard')}
            config={config}
            onUpdateConfig={saveConfig}
          />
        );
      
      case 'todos':
        return (
          <TodoApp
            onBack={() => handleNavigate('dashboard')}
          />
        );
      
      case 'testlab':
        return (
          <TestLab
            onBack={() => handleNavigate('dashboard')}
            config={config}
            backendStatus={backendStatus}
          />
        );
      
      case 'diagnostics':
        return (
          <QuantumEngineWizard
            onBack={() => handleNavigate('dashboard')}
            config={config}
            onUpdateConfig={saveConfig}
            backendStatus={backendStatus}
          />
        );
      
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            config={config}
            backendStatus={backendStatus}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {renderView()}
      <Analytics />
    </div>
  );
}
