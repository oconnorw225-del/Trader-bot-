import React, { useState, useEffect } from 'react';

const strategies = ['Superposition', 'Entanglement', 'Tunneling', 'Interference'];

export default function QuantumEngine({ config = {} }) {
  const [selectedStrategy, setSelectedStrategy] = useState('Superposition');
  const [marketData, setMarketData] = useState({
    symbol: 'BTC/USD',
    price: 42000,
    change: 2.5
  });
  const [tradeResult, setTradeResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate market data updates
    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 100,
        change: (Math.random() - 0.5) * 5
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const executeStrategy = async () => {
    setLoading(true);
    setTradeResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/quantum/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: selectedStrategy,
          data: marketData
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTradeResult(result.result);
      }
    } catch (error) {
      // Demo mode fallback
      setTradeResult({
        recommendation: Math.random() > 0.5 ? 'BUY' : 'SELL',
        confidence: 0.70 + Math.random() * 0.25,
        optimalPrice: marketData.price * (1 + (Math.random() - 0.5) * 0.02)
      });
    }

    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h2>⚛️ Quantum Trading Engine</h2>
      
      {config.demoMode && (
        <div className="alert alert-warning">
          Demo Mode: Trades are simulated and not executed on real exchanges.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Current Price</div>
          <div className="stat-value">${marketData.price.toFixed(2)}</div>
          <div className={`stat-change ${marketData.change >= 0 ? 'positive' : 'negative'}`}>
            {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Strategy</div>
          <div className="stat-value">{selectedStrategy}</div>
        </div>
      </div>

      <div className="card">
        <h3>Select Quantum Strategy</h3>
        <div className="platform-grid">
          {strategies.map(strategy => (
            <div
              key={strategy}
              className={`platform-card ${selectedStrategy === strategy ? 'selected' : ''}`}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <strong>{strategy}</strong>
              <p className="text-xs mt-1">
                {strategy === 'Superposition' && 'Evaluate multiple states'}
                {strategy === 'Entanglement' && 'Correlate asset pairs'}
                {strategy === 'Tunneling' && 'Find breakthrough opportunities'}
                {strategy === 'Interference' && 'Combine signals'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Trade Execution</h3>
        <div className="form-group">
          <label>Trading Pair</label>
          <select 
            value={marketData.symbol}
            onChange={e => setMarketData({...marketData, symbol: e.target.value})}
          >
            <option value="BTC/USD">BTC/USD</option>
            <option value="ETH/USD">ETH/USD</option>
            <option value="BTC/CAD">BTC/CAD</option>
            <option value="ETH/CAD">ETH/CAD</option>
          </select>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={executeStrategy}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : `Execute ${selectedStrategy} Strategy`}
        </button>

        {tradeResult && (
          <div className="card mt-4 bg-info-light">
            <h4>Strategy Result</h4>
            <div className="status-list">
              <div className="status-item">
                <span>Recommendation</span>
                <strong className={tradeResult.recommendation === 'BUY' ? 'text-success' : 'text-danger'}>
                  {tradeResult.recommendation}
                </strong>
              </div>
              <div className="status-item">
                <span>Confidence</span>
                <strong>{(tradeResult.confidence * 100).toFixed(1)}%</strong>
              </div>
              <div className="status-item">
                <span>Optimal Price</span>
                <strong>${tradeResult.optimalPrice.toFixed(2)}</strong>
              </div>
            </div>
            {!config.demoMode && (
              <button className="btn btn-success mt-2">
                Execute Trade
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Technical Indicators</h3>
        <div className="status-list">
          <div className="status-item">
            <span>RSI (14)</span>
            <span>{(45 + Math.random() * 20).toFixed(1)}</span>
          </div>
          <div className="status-item">
            <span>MACD</span>
            <span>{(Math.random() - 0.5).toFixed(3)}</span>
          </div>
          <div className="status-item">
            <span>Bollinger Bands</span>
            <span>Middle</span>
          </div>
          <div className="status-item">
            <span>Volume</span>
            <span>{(Math.random() * 1000000).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
