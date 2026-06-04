'use strict';
const authService = require('../services/authService');
const notificationService = require('../services/notificationService');
const config = require('../config/config');

const sendEmailInBackground = (to, subject, text) => {
  notificationService.sendEmailNotification(to, subject, text).catch((err) => {
    console.error('[AuthController] Background email failed:', err.message);
  });
};

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;
    const { user, otp } = await authService.register({ first_name, last_name, email, password, role });
    if (config.nodeEnv !== 'production') {
      console.log(`[AuthService] Verification OTP for ${email}: ${otp}`);
    }
    sendEmailInBackground(
      email,
      'Verify your FEMS account',
      `Your FEMS verification code is ${otp}. It expires in 10 minutes.`
    );
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Check your email for the OTP verification code.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const user = await authService.verifyEmailOtp(req.body);
    res.json({ success: true, message: 'Email verified successfully. You can now log in.', data: { user } });
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const result = await authService.resendEmailOtp(req.body.email);
    if (result) {
      if (config.nodeEnv !== 'production') {
        console.log(`[AuthService] Verification OTP for ${req.body.email}: ${result.otp}`);
      }
      sendEmailInBackground(
        req.body.email,
        'Your new FEMS verification code',
        `Your new FEMS verification code is ${result.otp}. It expires in 10 minutes.`
      );
    }
    res.json({ success: true, message: 'If the account exists and is not verified, a new OTP has been sent.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });

    // SECURITY: Set JWT in HttpOnly cookie — not exposed to JavaScript
    authService.setTokenCookie(res, token);

    res.json({ success: true, message: 'Login successful.', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * SECURITY: Clear the HttpOnly cookie and invalidate session
 */
const logout = (req, res) => {
  res.clearCookie('__Host-fems_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie('fems_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
};

/**
 * POST /api/auth/forgot-password
 * SECURITY: Always return success to prevent email enumeration
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.generateResetToken(email);

    if (result) {
      const resetLink = `${config.frontendUrl}/reset-password?token=${result.resetToken}`;
      sendEmailInBackground(
        email,
        'Password Reset Request — FEMS TZW LTD',
        `You requested a password reset. Click the link below (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, ignore this email.`
      );
    }

    // SECURITY: Always return the same response — prevents email enumeration
    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword({ token, password });
    res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/validate-token
 */
const validateToken = async (req, res, next) => {
  try {
    const user = await authService.validateToken(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid session.' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, resendOtp, login, logout, forgotPassword, resetPassword, validateToken };
