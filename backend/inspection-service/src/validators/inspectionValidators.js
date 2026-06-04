'use strict';
const { body } = require('express-validator');

const inspectionValidators = [
  body('fire_extinguisher_id')
    .notEmpty().withMessage('Fire extinguisher is required')
    .isInt({ min: 1 }).withMessage('Fire extinguisher ID must be a positive integer'),

  body('scheduled_date')
    .notEmpty().withMessage('Inspection date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Inspection date must be a valid date')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (value < today) {
        throw new Error('Inspection date cannot be in the past');
      }
      return true;
    }),

  body('scheduled_time')
    .notEmpty().withMessage('Inspection time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Inspection time must be in HH:MM format'),

  body('inspector_id')
    .notEmpty().withMessage('Inspector is required')
    .isInt({ min: 1 }).withMessage('Inspector ID must be a positive integer'),

  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

module.exports = { inspectionValidators };
