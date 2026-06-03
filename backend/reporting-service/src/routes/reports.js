'use strict';
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting and analytics (Admin only)
 */

router.use(authenticateToken);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Dashboard statistics
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Dashboard stats including totals and recent activity
 */
router.get('/dashboard', reportController.dashboardStats);

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Inventory report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Inventory summary by type, status, and size
 */
router.get('/inventory', reportController.inventoryReport);

/**
 * @swagger
 * /api/reports/inspections:
 *   get:
 *     summary: Inspections report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Pending, completed, and overdue inspection counts
 */
router.get('/inspections', reportController.inspectionsReport);

/**
 * @swagger
 * /api/reports/compliance:
 *   get:
 *     summary: Compliance report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Expired and upcoming expiry information
 */
router.get('/compliance', reportController.complianceReport);

/**
 * @swagger
 * /api/reports/maintenance:
 *   get:
 *     summary: Maintenance report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Maintenance history and frequency
 */
router.get('/maintenance', reportController.maintenanceReport);

/**
 * @swagger
 * /api/reports/export/csv:
 *   get:
 *     summary: Export report as CSV
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [inventory, inspections, maintenance] }
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export/csv', reportController.exportCsv);

/**
 * @swagger
 * /api/reports/export/pdf:
 *   get:
 *     summary: Export report as PDF
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [inventory, inspections] }
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/pdf', reportController.exportPdf);

module.exports = router;
