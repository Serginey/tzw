'use strict';
const { Notification } = require('../models');

const createNotification = async (req, res, next) => {
  try {
    const { user_id, message, status = 'unread' } = req.body;
    if (!user_id || !message || !status) {
      return res.status(400).json({ success: false, message: 'User, message, and status are required.' });
    }
    if (!['read', 'unread'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Notification status must be read or unread.' });
    }

    const notification = await Notification.create({ user_id, message, status });
    res.status(201).json({ success: true, message: 'Notification created.', data: { notification } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications — Get current user's notifications
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: { notifications, total: count, unread: notifications.filter((n) => n.status === 'unread').length } });
  } catch (err) {
    next(err);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    await notification.update({ status: 'read' });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update({ status: 'read' }, { where: { user_id: req.user.id, status: 'unread' } });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    await notification.destroy();
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createNotification, getMyNotifications, getNotificationById, markAsRead, markAllAsRead, deleteNotification };
