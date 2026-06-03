'use strict';
const { body } = require('express-validator');

const maintenanceValidators = [
  body('fire_extinguisher_id')
    .notEmpty().withMessage('Fire extinguisher is required')
    .isInt({ min: 1 }).withMessage('Fire extinguisher ID must be a positive integer'),

  body('inspector_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Inspector ID must be a positive integer'),

  body('action_taken')
    .trim()
    .notEmpty().withMessage('Action taken is required')
    .isLength({ max: 2000 }).withMessage('Action taken must not exceed 2000 characters'),

  body('maintenance_date')
    .notEmpty().withMessage('Maintenance date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Maintenance date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) {
        throw new Error('Maintenance date cannot be in the future');
      }
      return true;
    }),

  body('issues_identified')
    .trim()
    .notEmpty().withMessage('Issues identified is required')
    .isLength({ max: 2000 }).withMessage('Issues identified must not exceed 2000 characters'),

  body('notes_recommendations')
    .optional()
    .isLength({ max: 2000 }).withMessage('Notes/Recommendations must not exceed 2000 characters'),
];

module.exports = { maintenanceValidators };
