'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models');
const authService = require('../services/authService');
const config = require('../config/config');

const BCRYPT_ROUNDS = 12;

const generateTemporaryPassword = () => {
  const token = crypto.randomBytes(5).toString('base64url');
  return `Inspector@${token}1`;
};

const sendInspectorInvite = async (email, password) => {
  if (!config.smtp.host || !config.smtp.user) return;

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
      to: email,
      subject: 'Your FEMS inspector account',
      text: [
        'You have been invited as a FEMS inspector.',
        '',
        `Login URL: ${config.frontendUrl}/login`,
        `Username: ${email}`,
        `Temporary password: ${password}`,
        '',
        'After logging in, open your profile and change this password.',
      ].join('\n'),
    });
  } catch (err) {
    console.error('[UserService] Inspector invite email failed:', err.message);
  }
};

const sendInspectorInviteInBackground = (email, password) => {
  sendInspectorInvite(email, password).catch((err) => {
    console.error('[UserService] Background inspector invite failed:', err.message);
  });
};

/**
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.update({ first_name, last_name });
    res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users — Admin only
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const where = {};
    if (role && ['admin', 'inspector', 'user'].includes(role)) where.role = role;
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: { users, total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id — Admin only
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id — Admin only
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const { first_name, last_name, email, role } = req.body;

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    await user.update({ first_name, last_name, email, role });
    res.json({ success: true, message: 'User updated successfully.', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id — Admin only
 * SECURITY: Cannot delete own account via this endpoint
 */
const deleteUser = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account through this endpoint.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/invite-inspector — Admin only
 */
const inviteInspector = async (req, res, next) => {
  try {
    const { first_name, last_name, email } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);
    const inspector = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'inspector',
      is_verified: true,
    });

    if (config.nodeEnv !== 'production') {
      console.log(`[UserService] Temporary inspector password for ${email}: ${temporaryPassword}`);
    }
    sendInspectorInviteInBackground(email, temporaryPassword);
    res.status(201).json({
      success: true,
      message: 'Inspector invited successfully. Login credentials were sent by email.',
      data: { inspector },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/inspectors — Get users with inspector role
 */
const getInspectors = async (req, res, next) => {
  try {
    const inspectors = await User.findAll({ where: { role: 'inspector' }, order: [['first_name', 'ASC']] });
    res.json({ success: true, data: { inspectors } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUser, deleteUser, inviteInspector, getInspectors };
