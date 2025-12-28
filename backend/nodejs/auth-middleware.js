/**
 * Authentication Middleware
 * Handles password verification, JWT token generation, and route protection
 */

import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || 'change_me_in_production';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_at_least_32_chars';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h';
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION) || 900; // seconds

// In-memory store for failed login attempts (for production, use Redis)
const loginAttempts = new Map();

/**
 * Clean up old login attempt records
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (data.lockoutUntil && now > data.lockoutUntil) {
      loginAttempts.delete(ip);
    }
  }
}, 60000); // Clean every minute

/**
 * Rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: MAX_LOGIN_ATTEMPTS,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const attempts = loginAttempts.get(ip) || { count: 0 };
    
    // Trigger lockout
    attempts.count = MAX_LOGIN_ATTEMPTS;
    attempts.lockoutUntil = Date.now() + (LOCKOUT_DURATION * 1000);
    loginAttempts.set(ip, attempts);
    
    res.status(429).json({
      success: false,
      message: `Too many failed attempts. Locked out for ${LOCKOUT_DURATION / 60} minutes.`,
      lockoutUntil: attempts.lockoutUntil
    });
  }
});

/**
 * Check if IP is locked out
 */
function isLockedOut(ip) {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return false;
  
  if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
    return {
      locked: true,
      until: attempts.lockoutUntil,
      remainingSeconds: Math.ceil((attempts.lockoutUntil - Date.now()) / 1000)
    };
  }
  
  // Lockout expired, clear it
  if (attempts.lockoutUntil && Date.now() >= attempts.lockoutUntil) {
    loginAttempts.delete(ip);
  }
  
  return { locked: false };
}

/**
 * Record failed login attempt
 */
function recordFailedAttempt(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0 };
  attempts.count += 1;
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockoutUntil = Date.now() + (LOCKOUT_DURATION * 1000);
  }
  
  loginAttempts.set(ip, attempts);
  return attempts;
}

/**
 * Clear login attempts on successful login
 */
function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

/**
 * Generate JWT token
 */
function generateToken() {
  return jwt.sign(
    {
      authenticated: true,
      timestamp: Date.now()
    },
    JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRY
    }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Login handler
 */
export const loginHandler = (req, res) => {
  const { password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Check if locked out
  const lockoutStatus = isLockedOut(ip);
  if (lockoutStatus.locked) {
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Try again in ${Math.ceil(lockoutStatus.remainingSeconds / 60)} minutes.`,
      lockoutUntil: lockoutStatus.until
    });
  }
  
  // Validate password
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  // Check password
  if (password === ACCESS_PASSWORD) {
    // Success - generate token
    const token = generateToken();
    clearAttempts(ip);
    
    console.log(`✅ Successful login from IP: ${ip}`);
    
    return res.json({
      success: true,
      token,
      expiresIn: TOKEN_EXPIRY
    });
  } else {
    // Failed attempt
    const attempts = recordFailedAttempt(ip);
    const remaining = MAX_LOGIN_ATTEMPTS - attempts.count;
    
    console.log(`❌ Failed login attempt from IP: ${ip} (${attempts.count}/${MAX_LOGIN_ATTEMPTS})`);
    
    if (remaining <= 0) {
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Locked out for ${LOCKOUT_DURATION / 60} minutes.`,
        lockoutUntil: attempts.lockoutUntil
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid password',
      attemptsRemaining: remaining
    });
  }
};

/**
 * Logout handler
 */
export const logoutHandler = (req, res) => {
  // In a full implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Token verification handler
 */
export const verifyHandler = (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  const token = authHeader.substring(7);
  const verification = verifyToken(token);
  
  if (verification.valid) {
    return res.json({
      success: true,
      valid: true
    });
  } else {
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Authentication middleware to protect routes
 */
export const requireAuth = (req, res, next) => {
  // Skip authentication in development if REQUIRE_AUTH is false
  if (process.env.NODE_ENV === 'development' && process.env.REQUIRE_AUTH === 'false') {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const token = authHeader.substring(7);
  const verification = verifyToken(token);
  
  if (verification.valid) {
    req.user = verification.decoded;
    return next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Check authentication status for serving pages
 */
export const checkAuthForPage = (req, res, next) => {
  // Skip authentication in development if REQUIRE_AUTH is false
  if (process.env.NODE_ENV === 'development' && process.env.REQUIRE_AUTH === 'false') {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  const token = req.cookies?.auth_token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
  
  if (!token) {
    // No token, redirect to auth page
    return res.redirect('/auth.html');
  }
  
  const verification = verifyToken(token);
  
  if (verification.valid) {
    req.user = verification.decoded;
    return next();
  } else {
    // Invalid token, redirect to auth page
    return res.redirect('/auth.html');
  }
};

export default {
  authRateLimiter,
  loginHandler,
  logoutHandler,
  verifyHandler,
  requireAuth,
  checkAuthForPage
};
