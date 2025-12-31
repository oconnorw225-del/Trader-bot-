/**
 * WebSocket Connection Manager for NDAX Quantum Engine
 * Handles real-time market data streaming with automatic reconnection
 */

class WebSocketManager {
  constructor() {
    // Get WebSocket URL from environment or use default
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.pingInterval = null;
    this.pingIntervalTime = 30000; // 30 seconds
    this.isIntentionallyClosed = false;
    
    // Event listeners
    this.listeners = {
      connected: new Set(),
      disconnected: new Set(),
      message: new Set(),
      error: new Set(),
      market_update: new Set(),
      order_update: new Set(),
      position_update: new Set(),
    };

    // Subscriptions
    this.subscriptions = new Set();
  }

  /**
   * Connect to WebSocket server
   * @returns {Promise} Connection promise
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Already connected');
        resolve();
        return;
      }

      console.log(`[WebSocket] Connecting to ${this.wsUrl}...`);
      this.isIntentionallyClosed = false;

      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('[WebSocket] Connected successfully');
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startPingInterval();
          this.emit('connected', { timestamp: new Date().toISOString() });
          
          // Resubscribe to previous subscriptions
          if (this.subscriptions.size > 0) {
            this.send({
              type: 'subscribe',
              symbols: Array.from(this.subscriptions),
            });
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', data.type);
            
            // Emit to general message listeners
            this.emit('message', data);
            
            // Emit to specific event type listeners
            if (data.type && this.listeners[data.type]) {
              this.emit(data.type, data);
            }
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.emit('error', { error, timestamp: new Date().toISOString() });
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Disconnected:', event.code, event.reason);
          this.stopPingInterval();
          this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            timestamp: new Date().toISOString(),
          });

          // Attempt reconnection if not intentionally closed
          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log('[WebSocket] Disconnecting...');
    this.isIntentionallyClosed = true;
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    
    // Exponential backoff with max delay
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    
    console.log(
      `[WebSocket] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    
    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect().catch((error) => {
          console.error('[WebSocket] Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Send message to server
   * @param {object} data - Data to send
   * @returns {boolean} True if sent successfully
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Cannot send message: not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      return false;
    }
  }

  /**
   * Subscribe to market data for symbols
   * @param {string|string[]} symbols - Symbol or array of symbols
   */
  subscribe(symbols) {
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    
    symbolArray.forEach((symbol) => {
      this.subscriptions.add(symbol);
    });

    if (this.isConnected()) {
      this.send({
        type: 'subscribe',
        symbols: symbolArray,
      });
    }
  }

  /**
   * Unsubscribe from market data
   * @param {string|string[]} symbols - Symbol or array of symbols
   */
  unsubscribe(symbols) {
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    
    symbolArray.forEach((symbol) => {
      this.subscriptions.delete(symbol);
    });

    if (this.isConnected()) {
      this.send({
        type: 'unsubscribe',
        symbols: symbolArray,
      });
    }
  }

  /**
   * Check if connected
   * @returns {boolean} True if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   * @returns {string} Connection state
   */
  getState() {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Start ping interval to keep connection alive
   */
  startPingInterval() {
    this.stopPingInterval(); // Clear any existing interval
    
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, this.pingIntervalTime);
  }

  /**
   * Stop ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    
    this.listeners[event].add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event].delete(callback);
    };
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].clear();
    });
  }

  /**
   * Get subscription list
   * @returns {string[]} Array of subscribed symbols
   */
  getSubscriptions() {
    return Array.from(this.subscriptions);
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions() {
    if (this.isConnected()) {
      this.send({ type: 'unsubscribe' });
    }
    this.subscriptions.clear();
  }
}

// Create singleton instance
const wsManager = new WebSocketManager();

// Export singleton instance
export default wsManager;

// Also export class for testing
export { WebSocketManager };
