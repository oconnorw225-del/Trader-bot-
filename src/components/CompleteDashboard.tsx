/**
 * Complete Dashboard Component for NDAX Quantum Engine
 * Full TypeScript implementation with all features
 */

import React, { useState, useEffect } from 'react';
import api, { 
  TradingOrder, 
  Position, 
  QuantumAnalysis, 
  MarketData,
  FreelanceJob 
} from '../lib/api';

interface DashboardStats {
  totalTrades: number;
  activePositions: number;
  totalPnL: number;
  freelanceJobs: number;
}

const CompleteDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrades: 0,
    activePositions: 0,
    totalPnL: 0,
    freelanceJobs: 0,
  });
  
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [recentOrders, setRecentOrders] = useState<TradingOrder[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [freelanceJobs, setFreelanceJobs] = useState<FreelanceJob[]>([]);
  const [quantumAnalysis, setQuantumAnalysis] = useState<QuantumAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trading' | 'quantum' | 'freelance' | 'automation'>('trading');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load market data
      const marketResponse = await api.getMarketData('BTC/USD');
      if (marketResponse.success && marketResponse.data) {
        setMarketData(marketResponse.data);
      }

      // Load recent orders
      const ordersResponse = await api.getOrders({ limit: 5 });
      if (ordersResponse.success && ordersResponse.data) {
        setRecentOrders(ordersResponse.data.orders);
        setStats(prev => ({ ...prev, totalTrades: ordersResponse.data.total }));
      }

      // Load positions
      const positionsResponse = await api.getPositions();
      if (positionsResponse.success && positionsResponse.data) {
        setPositions(positionsResponse.data.positions);
        setStats(prev => ({ 
          ...prev, 
          activePositions: positionsResponse.data.positions.length,
          totalPnL: positionsResponse.data.positions.reduce((sum, p) => sum + p.unrealized_pnl, 0)
        }));
      }

      // Load freelance jobs
      const jobsResponse = await api.getFreelanceJobs({ platform: 'all' });
      if (jobsResponse.success && jobsResponse.data) {
        setFreelanceJobs(jobsResponse.data.jobs);
        setStats(prev => ({ ...prev, freelanceJobs: jobsResponse.data.jobs.length }));
      }

      // Load quantum analysis
      const quantumResponse = await api.performQuantumAnalysis({
        strategyType: 'superposition',
        symbol: 'BTC/USD',
      });
      if (quantumResponse.success && quantumResponse.data) {
        setQuantumAnalysis(quantumResponse.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeTrade = async (side: 'BUY' | 'SELL') => {
    try {
      const response = await api.executeTrade({
        symbol: 'BTC/USD',
        side,
        quantity: 0.01,
        orderType: 'MARKET',
      });

      if (response.success) {
        alert(`Trade executed successfully: ${side} order placed`);
        loadDashboardData();
      } else {
        alert(`Trade failed: ${response.error}`);
      }
    } catch (err) {
      alert(`Trade failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading && !marketData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !marketData) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="complete-dashboard">
      <header className="dashboard-header">
        <h1>NDAX Quantum Engine Dashboard</h1>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">{stats.totalTrades}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Positions</span>
            <span className="stat-value">{stats.activePositions}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total P&L</span>
            <span className={`stat-value ${stats.totalPnL >= 0 ? 'positive' : 'negative'}`}>
              ${stats.totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Freelance Jobs</span>
            <span className="stat-value">{stats.freelanceJobs}</span>
          </div>
        </div>
      </header>

      {/* Market Data Overview */}
      {marketData && (
        <section className="market-overview">
          <h2>Market Overview - {marketData.symbol}</h2>
          <div className="market-grid">
            <div className="market-item">
              <span className="label">Current Price</span>
              <span className="value">${marketData.price.toLocaleString()}</span>
            </div>
            <div className="market-item">
              <span className="label">24h Change</span>
              <span className={`value ${marketData.change24h >= 0 ? 'positive' : 'negative'}`}>
                {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h}%
              </span>
            </div>
            <div className="market-item">
              <span className="label">24h High</span>
              <span className="value">${marketData.high24h.toLocaleString()}</span>
            </div>
            <div className="market-item">
              <span className="label">24h Low</span>
              <span className="value">${marketData.low24h.toLocaleString()}</span>
            </div>
            <div className="market-item">
              <span className="label">Volume</span>
              <span className="value">${marketData.volume.toLocaleString()}</span>
            </div>
          </div>
        </section>
      )}

      {/* Quantum Analysis */}
      {quantumAnalysis && (
        <section className="quantum-section">
          <h2>Quantum Analysis</h2>
          <div className="quantum-card">
            <div className="quantum-header">
              <span className="strategy-type">{quantumAnalysis.strategyType}</span>
              <span className={`recommendation ${quantumAnalysis.recommendation.toLowerCase()}`}>
                {quantumAnalysis.recommendation}
              </span>
            </div>
            <div className="confidence-bar">
              <div className="confidence-label">Confidence: {(quantumAnalysis.confidence * 100).toFixed(0)}%</div>
              <div className="confidence-fill" style={{ width: `${quantumAnalysis.confidence * 100}%` }}></div>
            </div>
            {quantumAnalysis.technicalIndicators && (
              <div className="technical-indicators">
                <h3>Technical Indicators</h3>
                {Object.entries(quantumAnalysis.technicalIndicators).map(([key, value]) => (
                  <div key={key} className="indicator">
                    <span className="indicator-name">{key.toUpperCase()}</span>
                    <span className="indicator-value">{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab Navigation */}
      <nav className="dashboard-tabs">
        <button 
          className={activeTab === 'trading' ? 'active' : ''}
          onClick={() => setActiveTab('trading')}
        >
          Trading
        </button>
        <button 
          className={activeTab === 'quantum' ? 'active' : ''}
          onClick={() => setActiveTab('quantum')}
        >
          Quantum
        </button>
        <button 
          className={activeTab === 'freelance' ? 'active' : ''}
          onClick={() => setActiveTab('freelance')}
        >
          Freelance
        </button>
        <button 
          className={activeTab === 'automation' ? 'active' : ''}
          onClick={() => setActiveTab('automation')}
        >
          Automation
        </button>
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'trading' && (
          <section className="trading-section">
            <div className="quick-trade">
              <h2>Quick Trade</h2>
              <div className="trade-buttons">
                <button className="buy-button" onClick={() => executeTrade('BUY')}>
                  Buy BTC
                </button>
                <button className="sell-button" onClick={() => executeTrade('SELL')}>
                  Sell BTC
                </button>
              </div>
            </div>

            <div className="positions-list">
              <h2>Active Positions ({positions.length})</h2>
              {positions.length === 0 ? (
                <p className="empty-state">No active positions</p>
              ) : (
                <table className="positions-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Side</th>
                      <th>Quantity</th>
                      <th>Entry Price</th>
                      <th>Current Price</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.id}>
                        <td>{position.symbol}</td>
                        <td className={position.side.toLowerCase()}>{position.side}</td>
                        <td>{position.quantity}</td>
                        <td>${position.entry_price.toLocaleString()}</td>
                        <td>${position.current_price.toLocaleString()}</td>
                        <td className={position.unrealized_pnl >= 0 ? 'positive' : 'negative'}>
                          ${position.unrealized_pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="orders-list">
              <h2>Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="empty-state">No recent orders</p>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Symbol</th>
                      <th>Side</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td className="order-id">{order.orderId}</td>
                        <td>{order.symbol}</td>
                        <td className={order.side.toLowerCase()}>{order.side}</td>
                        <td>{order.quantity}</td>
                        <td>${order.executionPrice?.toLocaleString() || 'N/A'}</td>
                        <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {activeTab === 'freelance' && (
          <section className="freelance-section">
            <h2>Available Freelance Jobs</h2>
            {freelanceJobs.length === 0 ? (
              <p className="empty-state">No jobs available</p>
            ) : (
              <div className="jobs-grid">
                {freelanceJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className="job-platform">{job.platform}</span>
                    </div>
                    <div className="job-budget">${job.budget.toLocaleString()}</div>
                    <div className="job-category">{job.category}</div>
                    <div className="job-skills">
                      {job.skills.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    <div className="job-footer">
                      <span className="job-posted">{job.posted}</span>
                      <button className="apply-button">Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default CompleteDashboard;
