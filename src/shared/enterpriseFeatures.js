/**
 * Enterprise Features Manager
 * Handles SSO, RBAC (Role-Based Access Control), and Audit Logging
 */

/**
 * Single Sign-On (SSO) Manager
 */
export class SSOManager {
  constructor() {
    this.providers = new Map();
    this.currentSession = null;
    this.initializeProviders();
  }

  /**
   * Initialize SSO providers
   */
  initializeProviders() {
    // Google OAuth
    this.providers.set('google', {
      name: 'Google',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: process.env.GOOGLE_CLIENT_ID,
      scope: 'openid profile email'
    });

    // Microsoft Azure AD
    this.providers.set('microsoft', {
      name: 'Microsoft',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      clientId: process.env.MICROSOFT_CLIENT_ID,
      scope: 'openid profile email'
    });

    // Okta
    this.providers.set('okta', {
      name: 'Okta',
      authUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/authorize`,
      tokenUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/token`,
      clientId: process.env.OKTA_CLIENT_ID,
      scope: 'openid profile email'
    });

    // SAML 2.0
    this.providers.set('saml', {
      name: 'SAML 2.0',
      entryPoint: process.env.SAML_ENTRY_POINT,
      issuer: process.env.SAML_ISSUER,
      cert: process.env.SAML_CERT
    });
  }

  /**
   * Initiate SSO login
   */
  async login(provider, redirectUrl) {
    const config = this.providers.get(provider);
    if (!config) {
      throw new Error(`SSO provider ${provider} not found`);
    }

    if (provider === 'saml') {
      return this.loginSAML(config, redirectUrl);
    } else {
      return this.loginOAuth(provider, config, redirectUrl);
    }
  }

  /**
   * OAuth login flow
   */
  loginOAuth(provider, config, redirectUrl) {
    const state = this.generateState();
    const nonce = this.generateNonce();

    // Store state and nonce for verification
    sessionStorage.setItem(`${provider}_state`, state);
    sessionStorage.setItem(`${provider}_nonce`, nonce);

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      scope: config.scope,
      redirect_uri: redirectUrl,
      state,
      nonce
    });

    window.location.href = `${config.authUrl}?${params.toString()}`;
  }

  /**
   * SAML login flow
   */
  loginSAML(config, redirectUrl) {
    // Generate SAML request
    const samlRequest = this.generateSAMLRequest(config, redirectUrl);
    const encodedRequest = btoa(samlRequest);

    const params = new URLSearchParams({
      SAMLRequest: encodedRequest,
      RelayState: redirectUrl
    });

    window.location.href = `${config.entryPoint}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(provider, code, state) {
    const config = this.providers.get(provider);
    const storedState = sessionStorage.getItem(`${provider}_state`);

    // Verify state
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
        code,
        grant_type: 'authorization_code',
        redirect_uri: window.location.origin + '/auth/callback'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await response.json();
    this.currentSession = {
      provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000)
    };

    // Clean up
    sessionStorage.removeItem(`${provider}_state`);
    sessionStorage.removeItem(`${provider}_nonce`);

    return this.currentSession;
  }

  /**
   * Refresh access token
   */
  async refreshToken(provider) {
    const config = this.providers.get(provider);
    if (!this.currentSession || !this.currentSession.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
        refresh_token: this.currentSession.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    this.currentSession.accessToken = tokens.access_token;
    this.currentSession.expiresAt = Date.now() + (tokens.expires_in * 1000);

    return this.currentSession;
  }

  /**
   * Logout
   */
  logout() {
    this.currentSession = null;
    sessionStorage.clear();
  }

  /**
   * Get current session
   */
  getSession() {
    return this.currentSession;
  }

  /**
   * Check if session is valid
   */
  isSessionValid() {
    return this.currentSession && this.currentSession.expiresAt > Date.now();
  }

  /**
   * Generate random state
   */
  generateState() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate random nonce
   */
  generateNonce() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate SAML request
   */
  generateSAMLRequest(config, redirectUrl) {
    const id = `_${this.generateState()}`;
    const timestamp = new Date().toISOString();

    return `
      <samlp:AuthnRequest 
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
        ID="${id}" 
        Version="2.0" 
        IssueInstant="${timestamp}"
        AssertionConsumerServiceURL="${redirectUrl}">
        <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${config.issuer}</saml:Issuer>
      </samlp:AuthnRequest>
    `;
  }
}

/**
 * Role-Based Access Control (RBAC) Manager
 */
export class RBACManager {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.initializeRoles();
  }

  /**
   * Initialize default roles and permissions
   */
  initializeRoles() {
    // Define permissions
    const permissions = [
      'trading.view', 'trading.execute', 'trading.manage',
      'freelance.view', 'freelance.manage', 'freelance.apply',
      'analytics.view', 'analytics.export',
      'settings.view', 'settings.modify',
      'users.view', 'users.manage',
      'audit.view', 'audit.export',
      'api.access', 'api.manage'
    ];

    permissions.forEach(perm => {
      this.permissions.set(perm, { id: perm, description: `Permission for ${perm}` });
    });

    // Define roles
    this.createRole('admin', 'Administrator', permissions);
    this.createRole('trader', 'Trader', [
      'trading.view', 'trading.execute',
      'analytics.view',
      'settings.view',
      'api.access'
    ]);
    this.createRole('freelancer', 'Freelancer', [
      'freelance.view', 'freelance.manage', 'freelance.apply',
      'analytics.view',
      'settings.view',
      'api.access'
    ]);
    this.createRole('viewer', 'Viewer', [
      'trading.view',
      'freelance.view',
      'analytics.view',
      'settings.view'
    ]);
  }

  /**
   * Create a new role
   */
  createRole(id, name, permissions) {
    this.roles.set(id, {
      id,
      name,
      permissions: new Set(permissions)
    });
  }

  /**
   * Assign role to user
   */
  assignRole(userId, roleId) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    this.userRoles.get(userId).add(roleId);
  }

  /**
   * Remove role from user
   */
  revokeRole(userId, roleId) {
    if (this.userRoles.has(userId)) {
      this.userRoles.get(userId).delete(roleId);
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId, permission) {
    if (!this.userRoles.has(userId)) {
      return false;
    }

    const userRoleIds = this.userRoles.get(userId);
    for (const roleId of userRoleIds) {
      const role = this.roles.get(roleId);
      if (role && role.permissions.has(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has role
   */
  hasRole(userId, roleId) {
    return this.userRoles.has(userId) && this.userRoles.get(userId).has(roleId);
  }

  /**
   * Get user roles
   */
  getUserRoles(userId) {
    if (!this.userRoles.has(userId)) {
      return [];
    }
    return Array.from(this.userRoles.get(userId)).map(roleId => this.roles.get(roleId));
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId) {
    const roles = this.getUserRoles(userId);
    const permissions = new Set();

    roles.forEach(role => {
      role.permissions.forEach(perm => permissions.add(perm));
    });

    return Array.from(permissions);
  }

  /**
   * Get all roles
   */
  getAllRoles() {
    return Array.from(this.roles.values());
  }

  /**
   * Get all permissions
   */
  getAllPermissions() {
    return Array.from(this.permissions.values());
  }
}

/**
 * Audit Log Manager
 */
export class AuditLogManager {
  constructor() {
    this.logs = [];
    this.maxLogs = 10000;
    this.storageKey = 'ndax-audit-logs';
    this.loadLogs();
  }

  /**
   * Log an event
   */
  log(action, userId, details = {}, level = 'info') {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      userId,
      userAgent: navigator.userAgent,
      ipAddress: 'N/A', // Would need backend to get real IP
      level,
      details,
      sessionId: this.getSessionId()
    };

    this.logs.push(logEntry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.saveLogs();
    return logEntry;
  }

  /**
   * Log info event
   */
  info(action, userId, details) {
    return this.log(action, userId, details, 'info');
  }

  /**
   * Log warning event
   */
  warn(action, userId, details) {
    return this.log(action, userId, details, 'warning');
  }

  /**
   * Log error event
   */
  error(action, userId, details) {
    return this.log(action, userId, details, 'error');
  }

  /**
   * Log security event
   */
  security(action, userId, details) {
    return this.log(action, userId, details, 'security');
  }

  /**
   * Get logs
   */
  getLogs(filters = {}) {
    let filtered = [...this.logs];

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return filtered;
  }

  /**
   * Export logs
   */
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(this.logs);
    }
    throw new Error(`Unsupported format: ${format}`);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * Save logs to localStorage
   */
  saveLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      this.logs = [];
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('ndax-session-id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('ndax-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Convert logs to CSV
   */
  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = ['ID', 'Timestamp', 'Action', 'User ID', 'Level', 'Details'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.action,
      log.userId,
      log.level,
      JSON.stringify(log.details)
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }
}

// Create singleton instances
export const ssoManager = new SSOManager();
export const rbacManager = new RBACManager();
export const auditLog = new AuditLogManager();
