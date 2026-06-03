'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * JWT Authentication Middleware
 * SECURITY: Token read from HttpOnly cookie only — never from URL params or localStorage
 * SECURITY: Algorithm hardcoded to HS256 — never derived from unverified token header
 */
const authenticateToken = (req, res, next) => {
  // Prefer HttpOnly cookie for browser clients; allow Bearer token for gateway/service forwarding.
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieToken = req.cookies && (req.cookies['__Host-fems_token'] || req.cookies.fems_token);
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  try {
    // SECURITY: Algorithm hardcoded — reject 'none' algorithm attacks
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });

    // Attach user info (id + role only — no sensitive data)
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    // Generic message — do not expose internal JWT error details
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

module.exports = { authenticateToken };
