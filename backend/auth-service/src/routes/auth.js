'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerValidators,
  verifyEmailValidators,
  resendOtpValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} = require('../validators/authValidators');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string, example: "John" }
 *               last_name: { type: string, example: "Doe" }
 *               email: { type: string, format: email, example: "john@example.com" }
 *               password: { type: string, example: "SecureP@ss1" }
 *               role: { type: string, enum: [admin, inspector, user], example: "user" }
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/register', registerValidators, validate, authController.register);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify account email with signup OTP
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-email', verifyEmailValidators, validate, authController.verifyEmail);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend signup verification OTP
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP resent if account exists and needs verification
 */
router.post('/resend-otp', resendOtpValidators, validate, authController.resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT in HttpOnly cookie
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful. JWT set in HttpOnly cookie.
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidators, validate, authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear session cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email sent (always returns success to prevent enumeration)
 */
router.post('/forgot-password', forgotPasswordValidators, validate, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', resetPasswordValidators, validate, authController.resetPassword);

/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: Validate current session token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or expired token
 */
router.get('/validate-token', authenticateToken, authController.validateToken);

module.exports = router;
