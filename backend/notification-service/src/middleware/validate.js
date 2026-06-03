'use strict';
const { validationResult } = require('express-validator');

/**
 * Express-validator result handler middleware
 * Returns first validation error with a clear message
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      field: firstError.path,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { validate };
