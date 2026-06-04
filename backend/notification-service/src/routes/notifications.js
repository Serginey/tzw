'use strict';
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification (Admin/Inspector)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, message]
 *             properties:
 *               user_id: { type: integer }
 *               message: { type: string }
 *               status: { type: string, enum: [unread, read], example: "unread" }
 *     responses:
 *       201:
 *         description: Notification created
 *       403:
 *         description: Admin or inspector role required
 */
router.post('/', authorize('admin', 'inspector'), notificationController.createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [read, unread] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification details
 *       404:
 *         description: Notification not found
 */
router.get('/:id', notificationController.getNotificationById);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
