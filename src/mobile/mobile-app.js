/**
 * Mobile App Controller for Auto-Start System
 * Handles UI interactions and real-time updates via WebSocket
 */

class MobileApp {
  constructor() {
    this.apiUrl = window.location.origin;
    this.ws = null;
    this.isRunning = false;
    this.currentStrategy = 'balanced';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.connectWebSocket();
    this.startPeriodicUpdates();
  }

  setupEventListeners() {
    // Main control button
    const mainBtn = document.getElementById('main-control-btn');
    mainBtn.addEventListener('click', () => this.toggleSystem());

    // Emergency stop button
    const emergencyBtn = document.getElementById('emergency-stop-btn');
    emergencyBtn.addEventListener('click', () => this.emergencyStop());

    // Strategy buttons
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const strategy = e.currentTarget.dataset.strategy;
        this.changeStrategy(strategy);
      });
    });

    // Handle visibility change for reconnection
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.ws) {
        this.connectWebSocket();
      }
    });
  }

  async loadInitialData() {
    try {
      await Promise.all([
        this.loadSystemStatus(),
        this.loadPlatforms()
      ]);
      
      // Enable the main control button
      document.getElementById('main-control-btn').disabled = false;
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.showAlert('error', 'Failed to connect to server');
    }
  }

  async loadSystemStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/api/autostart/status/complete`);
      const data = await response.json();
      
      if (data.success) {
        this.updateUI(data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  }

  async loadPlatforms() {
    try {
      const response = await fetch(`${this.apiUrl}/api/autostart/platforms/status`);
      const data = await response.json();
      
      if (data.success) {
        this.renderPlatforms(data.platforms);
      }
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(true);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus(false);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateConnectionStatus(false);
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.updateConnectionStatus(false);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connectWebSocket();
      }, Math.min(delay, 30000)); // Max 30 seconds
    }
  }

  handleWebSocketMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'system:started':
        this.isRunning = true;
        this.updateControlButton();
        this.showAlert('success', 'System started');
        break;
        
      case 'system:stopped':
        this.isRunning = false;
        this.updateControlButton();
        this.showAlert('info', 'System stopped');
        break;
        
      case 'job:completed':
        this.handleJobCompleted(payload);
        break;
        
      case 'job:approval-required':
        this.handleJobApprovalRequired(payload);
        break;
        
      case 'platform:connected':
        this.showAlert('success', `${payload.platform} connected`);
        this.loadPlatforms();
        break;
        
      case 'strategy:changed':
        this.currentStrategy = payload.newStrategy;
        this.updateStrategyButtons();
        this.showAlert('info', `Strategy changed to ${payload.newStrategy}`);
        break;
        
      case 'stats:update':
        this.updateStats(payload);
        break;
    }
  }

  async toggleSystem() {
    const btn = document.getElementById('main-control-btn');
    btn.disabled = true;
    
    try {
      const endpoint = this.isRunning ? '/stop' : '/initialize';
      const response = await fetch(`${this.apiUrl}/api/autostart${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.isRunning = !this.isRunning;
        this.updateControlButton();
        this.showAlert('success', this.isRunning ? 'System started' : 'System stopped');
      } else {
        this.showAlert('error', data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Failed to toggle system:', error);
      this.showAlert('error', 'Failed to toggle system');
    } finally {
      btn.disabled = false;
    }
  }

  async emergencyStop() {
    if (!confirm('Emergency stop will cancel all active jobs. Continue?')) {
      return;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/api/autostart/emergency-stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.isRunning = false;
        this.updateControlButton();
        this.showAlert('warning', `Emergency stop: ${data.cancelledJobs} jobs cancelled`);
      }
    } catch (error) {
      console.error('Emergency stop failed:', error);
      this.showAlert('error', 'Emergency stop failed');
    }
  }

  async changeStrategy(strategy) {
    try {
      const response = await fetch(`${this.apiUrl}/api/autostart/strategy/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentStrategy = strategy;
        this.updateStrategyButtons();
        this.showAlert('success', `Strategy changed to ${strategy}`);
      } else {
        this.showAlert('error', data.error || 'Failed to change strategy');
      }
    } catch (error) {
      console.error('Failed to change strategy:', error);
      this.showAlert('error', 'Failed to change strategy');
    }
  }

  updateControlButton() {
    const btn = document.getElementById('main-control-btn');
    const emergencyBtn = document.getElementById('emergency-stop-btn');
    
    if (this.isRunning) {
      btn.classList.remove('start');
      btn.classList.add('stop');
      btn.querySelector('.btn-icon').textContent = '⏸';
      btn.querySelector('.btn-text').textContent = 'STOP';
      emergencyBtn.style.display = 'block';
    } else {
      btn.classList.remove('stop');
      btn.classList.add('start');
      btn.querySelector('.btn-icon').textContent = '▶';
      btn.querySelector('.btn-text').textContent = 'START';
      emergencyBtn.style.display = 'none';
    }
  }

  updateStrategyButtons() {
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      if (btn.dataset.strategy === this.currentStrategy) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    const statusText = statusEl.querySelector('.status-text');
    
    if (connected) {
      statusEl.classList.remove('offline');
      statusEl.classList.add('online');
      statusText.textContent = 'Connected';
    } else {
      statusEl.classList.remove('online');
      statusEl.classList.add('offline');
      statusText.textContent = 'Disconnected';
    }
  }

  updateUI(data) {
    // Update running state
    this.isRunning = data.isRunning;
    this.currentStrategy = data.strategy;
    this.updateControlButton();
    this.updateStrategyButtons();
    
    // Update earnings
    if (data.stats) {
      this.updateEarnings(data.stats);
      this.updateStats(data.stats);
    }
  }

  updateEarnings(stats) {
    document.getElementById('today-earnings').textContent = `$${stats.todayEarnings?.toFixed(2) || '0.00'}`;
    document.getElementById('week-earnings').textContent = `$${stats.weekEarnings?.toFixed(2) || '0.00'}`;
    document.getElementById('month-earnings').textContent = `$${stats.monthEarnings?.toFixed(2) || '0.00'}`;
    document.getElementById('total-earnings').textContent = `$${stats.totalEarnings?.toFixed(2) || '0.00'}`;
  }

  updateStats(stats) {
    document.getElementById('active-jobs').textContent = stats.activeJobs || 0;
    document.getElementById('completed-jobs').textContent = stats.completedJobs || 0;
    
    const successRate = stats.totalJobs > 0 
      ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
      : 0;
    document.getElementById('success-rate').textContent = `${successRate}%`;
    document.getElementById('available-slots').textContent = stats.availableSlots || 0;
  }

  renderPlatforms(platforms) {
    const container = document.getElementById('platforms-list');
    
    if (!platforms || platforms.length === 0) {
      container.innerHTML = '<div class="no-platforms">No platforms available</div>';
      return;
    }
    
    container.innerHTML = platforms.map(platform => `
      <div class="platform-card ${platform.connected ? 'connected' : 'disconnected'}">
        <div class="platform-header">
          <div class="platform-name">${platform.name}</div>
          <div class="platform-status ${platform.status}">${platform.status}</div>
        </div>
        <div class="platform-stats">
          <div class="platform-stat">
            <span class="label">Jobs:</span>
            <span class="value">${platform.jobsCompleted || 0}</span>
          </div>
          <div class="platform-stat">
            <span class="label">Earnings:</span>
            <span class="value">$${(platform.earnings || 0).toFixed(2)}</span>
          </div>
          <div class="platform-stat">
            <span class="label">Payout:</span>
            <span class="value">${platform.payoutSpeed}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  handleJobCompleted(job) {
    this.showAlert('success', `Job completed: +$${job.earnings?.toFixed(2) || '0.00'}`);
    this.loadSystemStatus();
  }

  handleJobApprovalRequired(job) {
    const alertEl = this.createAlert('warning', `Job requires approval: ${job.title}`);
    
    // Add approval button
    const approveBtn = document.createElement('button');
    approveBtn.className = 'alert-action-btn';
    approveBtn.textContent = 'Approve';
    approveBtn.onclick = () => this.approveJob(job.id, alertEl);
    
    alertEl.querySelector('.alert-content').appendChild(approveBtn);
  }

  async approveJob(jobId, alertEl) {
    try {
      const response = await fetch(`${this.apiUrl}/api/autostart/jobs/${jobId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alertEl.remove();
        this.showAlert('success', 'Job approved');
      } else {
        this.showAlert('error', data.error || 'Failed to approve job');
      }
    } catch (error) {
      console.error('Failed to approve job:', error);
      this.showAlert('error', 'Failed to approve job');
    }
  }

  showAlert(type, message) {
    const alertEl = this.createAlert(type, message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      alertEl.classList.add('fade-out');
      setTimeout(() => alertEl.remove(), 300);
    }, 5000);
  }

  createAlert(type, message) {
    const container = document.getElementById('alerts-list');
    
    // Remove "no alerts" message if present
    const noAlerts = container.querySelector('.no-alerts');
    if (noAlerts) {
      noAlerts.remove();
    }
    
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    alertEl.innerHTML = `
      <div class="alert-icon">${icons[type] || 'ℹ️'}</div>
      <div class="alert-content">
        <div class="alert-message">${message}</div>
        <div class="alert-time">${new Date().toLocaleTimeString()}</div>
      </div>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.insertBefore(alertEl, container.firstChild);
    
    // Keep only last 10 alerts
    const alerts = container.querySelectorAll('.alert');
    if (alerts.length > 10) {
      alerts[alerts.length - 1].remove();
    }
    
    return alertEl;
  }

  startPeriodicUpdates() {
    // Update status every 10 seconds
    setInterval(() => {
      if (this.isRunning) {
        this.loadSystemStatus();
      }
    }, 10000);
    
    // Update platforms every 30 seconds
    setInterval(() => {
      this.loadPlatforms();
    }, 30000);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MobileApp());
} else {
  new MobileApp();
}
