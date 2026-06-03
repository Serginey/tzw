'use strict';
const config = require('../config/config');

/**
 * Global Error Handler
 * SECURITY: Shows generic messages to clients, logs detailed errors server-side only.
 * Never expose stack traces or internal error details in production.
 */
const errorHandler = (err, req, res, next) => {
  // Log detailed error server-side
  console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.path}:`, err.message);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    return res.status(400).json({ success: false, message: messages[0] });
  }

  // Sequelize foreign key errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
  }

  // JWT errors (shouldn't reach here normally — handled in auth middleware)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }

  // Generic — never expose internal details in production
  const statusCode = err.statusCode || 500;
  const message =
    config.nodeEnv === 'development'
      ? err.message
      : statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };
