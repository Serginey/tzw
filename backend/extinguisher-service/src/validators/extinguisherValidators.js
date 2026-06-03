'use strict';
const { body } = require('express-validator');

const ALLOWED_TYPES = ['Water', 'CO2', 'CO₂', 'Foam', 'Dry Chemical'];
const ALLOWED_SIZES = ['1.5 lb', '5 lb', '9 lb', '12 lb'];
const ALLOWED_STATUSES = ['Active', 'Expired', 'Under Maintenance', 'Needs Inspection'];

const extinguisherValidators = [
  body('serial_number')
    .trim()
    .notEmpty().withMessage('Serial number is required')
    .isLength({ max: 100 }).withMessage('Serial number must not exceed 100 characters'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters'),

  body('type')
    .trim()
    .customSanitizer((value) => value === 'CO₂' ? 'CO2' : value)
    .notEmpty().withMessage('Type is required')
    .isIn(ALLOWED_TYPES).withMessage(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`),

  body('size')
    .trim()
    .notEmpty().withMessage('Size is required')
    .isIn(ALLOWED_SIZES).withMessage(`Size must be one of: ${ALLOWED_SIZES.join(', ')}`),

  body('installation_date')
    .notEmpty().withMessage('Installation date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Installation date must be a valid date (YYYY-MM-DD)'),

  body('expiry_date')
    .notEmpty().withMessage('Expiry date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.body.installation_date && value <= req.body.installation_date) {
        throw new Error('Expiry date must be after installation date');
      }
      return true;
    }),

  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(ALLOWED_STATUSES).withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
];

const extinguisherUpdateValidators = extinguisherValidators.map((v) => v.optional());

module.exports = { extinguisherValidators, extinguisherUpdateValidators };
