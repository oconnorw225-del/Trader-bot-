/**
 * WebSocket Manager
 * Handles real-time bidirectional communication
 */

export class WebSocketManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectInterval: 5000,
      reconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...options
    };

    this.ws = null;
    this.reconnectCount = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.messageQueue = [];
    this.isConnected = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectCount = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          if (this.options.reconnect && this.reconnectCount < this.options.reconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.options.reconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Send message to server
   */
  send(type, data) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });

    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // Handle heartbeat
      if (message.type === 'ping') {
        this.send('pong', {});
        return;
      }

      // Emit message to listeners
      this.emit('message', message);
      
      // Emit specific message type
      if (message.type) {
        this.emit(message.type, message.data);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.emit('error', error);
    }
  }

  /**
   * Subscribe to specific message type
   */
  subscribe(channel) {
    this.send('subscribe', { channel });
  }

  /**
   * Unsubscribe from specific message type
   */
  unsubscribe(channel) {
    this.send('unsubscribe', { channel });
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectCount++;
    const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectCount - 1);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectCount}/${this.options.reconnectAttempts}`);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, Math.min(delay, 60000)); // Max 60 seconds
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectCount: this.reconnectCount,
      queuedMessages: this.messageQueue.length
    };
  }
}

/**
 * Trading WebSocket Manager
 * Specialized WebSocket for trading updates
 */
export class TradingWebSocket extends WebSocketManager {
  constructor(url, options = {}) {
    super(url, options);
    this.subscriptions = new Set();
  }

  /**
   * Subscribe to price updates for a trading pair
   */
  subscribePrice(pair) {
    this.subscribe(`price.${pair}`);
    this.subscriptions.add(`price.${pair}`);
  }

  /**
   * Subscribe to order book updates
   */
  subscribeOrderBook(pair) {
    this.subscribe(`orderbook.${pair}`);
    this.subscriptions.add(`orderbook.${pair}`);
  }

  /**
   * Subscribe to trades feed
   */
  subscribeTrades(pair) {
    this.subscribe(`trades.${pair}`);
    this.subscriptions.add(`trades.${pair}`);
  }

  /**
   * Subscribe to user orders
   */
  subscribeOrders() {
    this.subscribe('user.orders');
    this.subscriptions.add('user.orders');
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach(channel => {
      this.unsubscribe(channel);
    });
    this.subscriptions.clear();
  }

  /**
   * Place order via WebSocket
   */
  placeOrder(order) {
    this.send('order.place', order);
  }

  /**
   * Cancel order via WebSocket
   */
  cancelOrder(orderId) {
    this.send('order.cancel', { orderId });
  }
}

/**
 * Notification WebSocket Manager
 * Specialized WebSocket for real-time notifications
 */
export class NotificationWebSocket extends WebSocketManager {
  constructor(url, options = {}) {
    super(url, options);
    this.unreadCount = 0;
  }

  /**
   * Subscribe to notifications
   */
  subscribeNotifications() {
    this.subscribe('notifications');
    
    // eslint-disable-next-line no-unused-vars
    this.on('notification', (data) => {
      this.unreadCount++;
      this.emit('unreadCountChange', this.unreadCount);
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    this.send('notification.read', { notificationId });
    if (this.unreadCount > 0) {
      this.unreadCount--;
      this.emit('unreadCountChange', this.unreadCount);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.send('notification.readAll', {});
    this.unreadCount = 0;
    this.emit('unreadCountChange', this.unreadCount);
  }

  /**
   * Get unread notification count
   */
  getUnreadCount() {
    return this.unreadCount;
  }
}

// Create singleton instances
let tradingWS = null;
let notificationWS = null;

export function getTradingWebSocket(url) {
  if (!tradingWS) {
    tradingWS = new TradingWebSocket(url || 'wss://api.ndax.com/ws');
  }
  return tradingWS;
}

export function getNotificationWebSocket(url) {
  if (!notificationWS) {
    notificationWS = new NotificationWebSocket(url || 'wss://api.ndax.com/notifications');
  }
  return notificationWS;
}
