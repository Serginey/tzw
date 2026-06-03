'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'inspector', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verification_otp: { type: DataTypes.STRING(255), allowNull: true },
    email_verification_otp_expires: { type: DataTypes.DATE, allowNull: true },
    reset_token: { type: DataTypes.STRING(255), allowNull: true },
    reset_token_expires: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      // SECURITY: Never return password field by default
      attributes: { exclude: ['password', 'email_verification_otp', 'email_verification_otp_expires', 'reset_token', 'reset_token_expires'] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },
  }
);

module.exports = User;
