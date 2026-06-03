'use strict';
const express = require('express');
const router = express.Router();
const extController = require('../controllers/extinguisherController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { extinguisherValidators } = require('../validators/extinguisherValidators');

/**
 * @swagger
 * tags:
 *   name: Fire Extinguishers
 *   description: Fire extinguisher management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/extinguishers:
 *   post:
 *     summary: Add a new fire extinguisher (Admin only)
 *     tags: [Fire Extinguishers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FireExtinguisher'
 *     responses:
 *       201:
 *         description: Fire extinguisher created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Serial number already exists
 */
router.post('/', authorize('admin'), extinguisherValidators, validate, extController.create);

/**
 * @swagger
 * /api/extinguishers:
 *   get:
 *     summary: Get all fire extinguishers (All authenticated users)
 *     tags: [Fire Extinguishers]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by serial number or location
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [Water, CO2, Foam, "Dry Chemical"] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Active, Expired, "Under Maintenance", Decommissioned] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of extinguishers
 */
router.get('/', extController.getAll);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   get:
 *     summary: Get fire extinguisher by ID
 *     tags: [Fire Extinguishers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Extinguisher with recent inspections and maintenance
 *       404:
 *         description: Not found
 */
router.get('/:id', extController.getById);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   put:
 *     summary: Update fire extinguisher (Admin only)
 *     tags: [Fire Extinguishers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', authorize('admin'), extinguisherValidators, validate, extController.update);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   delete:
 *     summary: Delete fire extinguisher (Admin only)
 *     tags: [Fire Extinguishers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       403:
 *         description: Admin role required
 */
router.delete('/:id', authorize('admin'), extController.remove);

module.exports = router;
