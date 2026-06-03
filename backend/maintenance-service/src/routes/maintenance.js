'use strict';
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { maintenanceValidators } = require('../validators/maintenanceValidators');

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Maintenance log management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Create maintenance log (Admin/Inspector)
 *     tags: [Maintenance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fire_extinguisher_id, action_taken, maintenance_date, issues_identified]
 *             properties:
 *               fire_extinguisher_id: { type: integer }
 *               action_taken: { type: string }
 *               maintenance_date: { type: string, format: date }
 *               issues_identified: { type: string }
 *               notes_recommendations: { type: string }
 *     responses:
 *       201:
 *         description: Maintenance log created
 */
router.post('/', authorize('admin', 'inspector'), maintenanceValidators, validate, maintenanceController.create);

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get all maintenance logs
 *     tags: [Maintenance]
 *     parameters:
 *       - in: query
 *         name: extinguisher_id
 *         schema: { type: integer }
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated maintenance logs
 */
router.get('/', maintenanceController.getAll);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   get:
 *     summary: Get maintenance log by ID
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Maintenance log details
 */
router.get('/:id', maintenanceController.getById);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   put:
 *     summary: Update maintenance log (Admin/Inspector — own records only for Inspector)
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', authorize('admin', 'inspector'), maintenanceController.update);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   delete:
 *     summary: Delete maintenance log (Admin only)
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', authorize('admin'), maintenanceController.remove);

module.exports = router;
