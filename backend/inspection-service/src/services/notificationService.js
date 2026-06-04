'use strict';
const nodemailer = require('nodemailer');
const { Notification, User } = require('../models');
const config = require('../config/config');

/**
 * Create an in-app notification for a user
 */
const createNotification = async (userId, message) => {
  return await Notification.create({ user_id: userId, message });
};

/**
 * Notify all admins of an event
 */
const notifyAdmins = async (message) => {
  const admins = await User.findAll({ where: { role: 'admin' } });
  await Promise.all(admins.map((admin) => createNotification(admin.id, message)));
};

/**
 * Send email notification (if SMTP configured)
 * TODO(security): Implement proper email verification before sending.
 */
const sendEmailNotification = async (toEmail, subject, text) => {
  if (!config.smtp.host || !config.smtp.user) {
    console.log('[NotificationService] SMTP not configured. Skipping email.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    await transporter.sendMail({
      from: `"FEMS - TZW LTD" <${config.smtp.user}>`,
      to: toEmail,
      subject,
      text,
    });
  } catch (err) {
    // Log but don't throw — email failure shouldn't break the request
    console.error('[NotificationService] Email send failed:', err.message);
  }
};

module.exports = { createNotification, notifyAdmins, sendEmailNotification };
