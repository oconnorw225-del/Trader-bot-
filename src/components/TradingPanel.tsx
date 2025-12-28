/**
 * Trading Panel Component
 * Comprehensive trading interface with order execution, position management, and live updates
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Order, Position } from '../lib/api';
import '../styles/TradingPanel.css';

interface TradingPanelProps {
  symbol?: string;
  onOrderPlaced?: (order: Order) => void;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ 
  symbol = 'BTC/USD', 
  onOrderPlaced 
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop_limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  
  // Load positions and orders
  useEffect(() => {
    loadPositionsAndOrders();
    const interval = setInterval(loadPositionsAndOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPositionsAndOrders = async () => {
    try {
      const [positionsRes, ordersRes] = await Promise.all([
        api.getPositions(),
        api.getOrders()
      ]);
      
      if (positionsRes.success && positionsRes.data) {
        setPositions(positionsRes.data.positions || []);
      }
      
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const qty = parseFloat(quantity);
      const orderPrice = price ? parseFloat(price) : undefined;

      if (isNaN(qty) || qty <= 0) {
        throw new Error('Invalid quantity');
      }

      if ((orderType === 'limit' || orderType === 'stop_limit') && (!orderPrice || orderPrice <= 0)) {
        throw new Error('Price required for limit orders');
      }

      const response = await api.executeOrder(
        selectedSymbol,
        side,
        orderType,
        qty,
        orderPrice
      );

      if (response.success && response.data) {
        setSuccess(`Order placed successfully: ${response.data.order.orderId}`);
        setQuantity('');
        setPrice('');
        
        if (onOrderPlaced) {
          onOrderPlaced(response.data.order);
        }
        
        // Refresh data
        loadPositionsAndOrders();
      } else {
        throw new Error(response.error || 'Order failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await api.closePosition(positionId);
      if (response.success) {
        setSuccess('Position closed successfully');
        loadPositionsAndOrders();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to close position');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await api.cancelOrder(orderId);
      if (response.success) {
        setSuccess('Order cancelled successfully');
        loadPositionsAndOrders();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="trading-panel">
      <div className="trading-panel-header">
        <h2>Trading Panel</h2>
        <select 
          value={selectedSymbol} 
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="symbol-selector"
        >
          <option value="BTC/USD">BTC/USD</option>
          <option value="ETH/USD">ETH/USD</option>
          <option value="SOL/USD">SOL/USD</option>
          <option value="ADA/USD">ADA/USD</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="trading-form-container">
        <form onSubmit={handleSubmitOrder} className="trading-form">
          <div className="form-group">
            <label>Order Type</label>
            <select 
              value={orderType} 
              onChange={(e) => setOrderType(e.target.value as any)}
              className="form-control"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
              <option value="stop_limit">Stop Limit</option>
            </select>
          </div>

          <div className="form-group">
            <label>Side</label>
            <div className="button-group">
              <button
                type="button"
                className={`btn ${side === 'buy' ? 'btn-success active' : 'btn-outline'}`}
                onClick={() => setSide('buy')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`btn ${side === 'sell' ? 'btn-danger active' : 'btn-outline'}`}
                onClick={() => setSide('sell')}
              >
                Sell
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              step="0.00000001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="form-control"
              required
            />
          </div>

          {(orderType === 'limit' || orderType === 'stop_limit') && (
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="form-control"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>

      <div className="positions-section">
        <h3>Open Positions ({positions.length})</h3>
        <div className="positions-table">
          {positions.length === 0 ? (
            <p className="no-data">No open positions</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Quantity</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>PnL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.positionId}>
                    <td>{position.symbol}</td>
                    <td className={position.side === 'buy' ? 'text-success' : 'text-danger'}>
                      {position.side.toUpperCase()}
                    </td>
                    <td>{position.quantity}</td>
                    <td>${position.entry_price.toFixed(2)}</td>
                    <td>${position.current_price.toFixed(2)}</td>
                    <td className={position.pnl >= 0 ? 'text-success' : 'text-danger'}>
                      ${position.pnl.toFixed(2)} ({position.pnl_percentage.toFixed(2)}%)
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleClosePosition(position.positionId)}
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="orders-section">
        <h3>Recent Orders ({orders.length})</h3>
        <div className="orders-table">
          {orders.length === 0 ? (
            <p className="no-data">No recent orders</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Side</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId.substring(0, 8)}...</td>
                    <td>{order.symbol}</td>
                    <td>{order.orderType}</td>
                    <td className={order.side === 'buy' ? 'text-success' : 'text-danger'}>
                      {order.side.toUpperCase()}
                    </td>
                    <td>{order.quantity}</td>
                    <td>${order.price?.toFixed(2) || 'Market'}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {order.status === 'pending' || order.status === 'open' ? (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleCancelOrder(order.orderId)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;
