/**
 * Frontend Authentication Utility
 * Handles client-side authentication state and token management
 */

const STORAGE_KEY_TOKEN = 'auth_token';
const API_BASE = window.location.origin;

/**
 * Login with password
 * @param {string} password - The access password
 * @returns {Promise<boolean>} Success status
 */
export const login = async (password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (response.ok && data.success && data.token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

/**
 * Logout and clear authentication
 */
export const logout = () => {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  
  // Call logout endpoint to invalidate token on server
  const token = getAuthToken();
  if (token) {
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(err => console.error('Logout error:', err));
  }
  
  // Redirect to auth page
  window.location.href = '/auth.html';
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get authentication token from storage
 * @returns {string|null} Auth token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
};

/**
 * Verify authentication with server
 * @returns {Promise<boolean>} Verification result
 */
export const checkAuth = async () => {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return true;
    } else {
      // Token is invalid, remove it
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      return false;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
};

/**
 * Setup authentication interceptor for API calls
 * Adds authorization header to fetch requests
 */
export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const [url, config = {}] = args;
    
    // Only add auth header to API calls
    if (typeof url === 'string' && url.includes('/api/')) {
      const token = getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return originalFetch.apply(this, [url, config]);
  };
};

/**
 * Redirect to authentication page if not authenticated
 */
export const requireAuth = async () => {
  const authenticated = await checkAuth();
  
  if (!authenticated) {
    window.location.href = '/auth.html';
    return false;
  }
  
  return true;
};

export default {
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  checkAuth,
  setupAuthInterceptor,
  requireAuth
};
