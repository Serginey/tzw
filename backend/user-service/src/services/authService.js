'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const config = require('../config/config');
const { Op } = require('sequelize');

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MINUTES = 10;

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { algorithm: 'HS256', expiresIn: config.jwtExpiresIn }
  );
};

const setTokenCookie = (res, token) => {
  const isProduction = config.nodeEnv === 'production';
  const cookieName = isProduction ? '__Host-fems_token' : 'fems_token';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });
};

const register = async ({ first_name, last_name, email, password, role }) => {
  const existing = await User.scope('withPassword').findOne({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    role: role || 'user',
    is_verified: false,
  });

  const otp = generateOtp();
  await user.update({
    email_verification_otp: hashOtp(otp),
    email_verification_otp_expires: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });

  return { user: await User.findByPk(user.id), otp };
};

const login = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.is_verified) {
    const err = new Error('Please verify your email with the OTP sent after signup before logging in.');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
    },
  };
};

const verifyEmailOtp = async ({ email, otp }) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid or expired verification code.');
    err.statusCode = 400;
    throw err;
  }

  if (user.is_verified) return await User.findByPk(user.id);

  const isOtpValid = user.email_verification_otp === hashOtp(otp);
  const isOtpFresh = user.email_verification_otp_expires && user.email_verification_otp_expires > new Date();
  if (!isOtpValid || !isOtpFresh) {
    const err = new Error('Invalid or expired verification code.');
    err.statusCode = 400;
    throw err;
  }

  await user.update({
    is_verified: true,
    email_verification_otp: null,
    email_verification_otp_expires: null,
  });

  return await User.findByPk(user.id);
};

const resendEmailOtp = async (email) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || user.is_verified) return null;

  const otp = generateOtp();
  await user.update({
    email_verification_otp: hashOtp(otp),
    email_verification_otp_expires: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });
  return { user, otp };
};

const generateResetToken = async (email) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await user.update({ reset_token: resetToken, reset_token_expires: resetTokenExpires });
  return { user, resetToken };
};

const resetPassword = async ({ token, password }) => {
  const user = await User.scope('withPassword').findOne({
    where: {
      reset_token: token,
      reset_token_expires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    const err = new Error('Invalid or expired reset token.');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await user.update({ password: hashedPassword, reset_token: null, reset_token_expires: null });
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await User.scope('withPassword').findByPk(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const isValid = await bcrypt.compare(current_password, user.password);
  if (!isValid) {
    const err = new Error('Current password is incorrect.');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
  await user.update({ password: hashedPassword });
};

const validateToken = async (userId) => {
  return await User.findByPk(userId);
};

module.exports = {
  register,
  login,
  generateToken,
  setTokenCookie,
  verifyEmailOtp,
  resendEmailOtp,
  generateResetToken,
  resetPassword,
  changePassword,
  validateToken,
};
