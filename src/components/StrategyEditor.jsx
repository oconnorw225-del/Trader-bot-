import React, { useState } from 'react';

export default function StrategyEditor() {
  const [mode, setMode] = useState('quantum');
  const [strategyParams, setStrategyParams] = useState({
    rsiPeriod: 14,
    emaPeriod: 20,
    bollingerPeriod: 20,
    bollingerStdDev: 2,
    stopLoss: 2.0,
    takeProfit: 5.0
  });

  const updateParam = (key, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setStrategyParams(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const saveStrategy = () => {
    localStorage.setItem('strategy_params', JSON.stringify(strategyParams));
    alert('Strategy parameters saved!');
  };

  return (
    <div className="dashboard-container">
      <h2>🔧 Strategy Editor</h2>

      <div className="card">
        <h3>Strategy Type</h3>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="quantum">Quantum Trading Strategies</option>
          <option value="freelance">Freelance Job Strategies</option>
        </select>
      </div>

      {mode === 'quantum' && (
        <>
          <div className="card">
            <h3>Technical Indicators</h3>
            <div className="form-group">
              <label>RSI Period</label>
              <input 
                type="number" 
                value={strategyParams.rsiPeriod}
                onChange={e => updateParam('rsiPeriod', e.target.value)}
              />
              <small>Default: 14 periods</small>
            </div>
            <div className="form-group">
              <label>EMA Period</label>
              <input 
                type="number" 
                value={strategyParams.emaPeriod}
                onChange={e => updateParam('emaPeriod', e.target.value)}
              />
              <small>Default: 20 periods</small>
            </div>
            <div className="form-group">
              <label>Bollinger Bands Period</label>
              <input 
                type="number" 
                value={strategyParams.bollingerPeriod}
                onChange={e => updateParam('bollingerPeriod', e.target.value)}
              />
              <small>Default: 20 periods</small>
            </div>
            <div className="form-group">
              <label>Bollinger Bands Standard Deviation</label>
              <input 
                type="number" 
                step="0.1"
                value={strategyParams.bollingerStdDev}
                onChange={e => updateParam('bollingerStdDev', e.target.value)}
              />
              <small>Default: 2.0</small>
            </div>
          </div>

          <div className="card">
            <h3>Risk Parameters</h3>
            <div className="form-group">
              <label>Stop Loss (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={strategyParams.stopLoss}
                onChange={e => updateParam('stopLoss', e.target.value)}
              />
              <small>Exit when loss reaches this percentage</small>
            </div>
            <div className="form-group">
              <label>Take Profit (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={strategyParams.takeProfit}
                onChange={e => updateParam('takeProfit', e.target.value)}
              />
              <small>Exit when profit reaches this percentage</small>
            </div>
          </div>
        </>
      )}

      {mode === 'freelance' && (
        <div className="card">
          <h3>Job Matching Criteria</h3>
          <div className="form-group">
            <label>Minimum Match Score (%)</label>
            <input type="number" defaultValue="75" />
            <small>Only show jobs with match score above this threshold</small>
          </div>
          <div className="form-group">
            <label>Preferred Skills (comma-separated)</label>
            <input type="text" placeholder="React, Node.js, Python" />
          </div>
          <div className="form-group">
            <label>Minimum Budget ($)</label>
            <input type="number" defaultValue="500" />
          </div>
          <div className="form-group">
            <label>Maximum Budget ($)</label>
            <input type="number" defaultValue="10000" />
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={saveStrategy}>
        💾 Save Strategy
      </button>

      <div className="alert alert-info mt-4">
        <strong>Note:</strong> Changes take effect immediately. Test your strategies in the Testing Lab before deploying live.
      </div>
    </div>
  );
}
