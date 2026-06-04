'use strict';
const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { inspectionValidators } = require('../validators/inspectionValidators');

/**
 * @swagger
 * tags:
 *   name: Inspections
 *   description: Inspection scheduling and management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/inspections:
 *   post:
 *     summary: Schedule a new inspection (Admin/User)
 *     tags: [Inspections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fire_extinguisher_id, scheduled_date, scheduled_time, inspector_id]
 *             properties:
 *               fire_extinguisher_id: { type: integer }
 *               scheduled_date: { type: string, format: date, example: "2026-07-01" }
 *               scheduled_time: { type: string, example: "09:00" }
 *               inspector_id: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Inspection scheduled. Inspector notified.
 *       400:
 *         description: Validation error or past date
 */
router.post('/', authorize('admin', 'user'), inspectionValidators, validate, inspectionController.create);

/**
 * @swagger
 * /api/inspections:
 *   get:
 *     summary: Get inspections (Users see only their own; inspectors see scheduled inspections)
 *     tags: [Inspections]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Scheduled, Completed, Overdue, Cancelled] }
 *       - in: query
 *         name: inspector_id
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated inspections list
 */
router.get('/', inspectionController.getAll);

/**
 * @swagger
 * /api/inspections/{id}:
 *   get:
 *     summary: Get inspection by ID
 *     tags: [Inspections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Inspection details
 *       404:
 *         description: Not found
 */
router.get('/:id', inspectionController.getById);

/**
 * @swagger
 * /api/inspections/{id}:
 *   put:
 *     summary: Update inspection (Inspectors update status/notes only)
 *     tags: [Inspections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', authorize('admin', 'inspector'), inspectionController.update);

/**
 * @swagger
 * /api/inspections/{id}:
 *   delete:
 *     summary: Delete inspection (Admin only)
 *     tags: [Inspections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', authorize('admin'), inspectionController.remove);

module.exports = router;
