'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ALLOWED_TYPES = ['Water', 'CO2', 'Foam', 'Dry Chemical'];
const ALLOWED_SIZES = ['1.5 lb', '5 lb', '9 lb', '12 lb'];
const ALLOWED_STATUSES = ['Active', 'Expired', 'Under Maintenance', 'Decommissioned'];

const toDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const todayDateOnly = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const FireExtinguisher = sequelize.define(
  'FireExtinguisher',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },
    type: {
      type: DataTypes.ENUM(...ALLOWED_TYPES),
      allowNull: false,
    },
    size: {
      type: DataTypes.ENUM(...ALLOWED_SIZES),
      allowNull: false,
    },
    installation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notInFuture(value) {
          const installationDate = toDateOnly(value);
          if (installationDate && installationDate > todayDateOnly()) {
            throw new Error('Installation date cannot be in the future');
          }
        },
      },
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterInstallation(value) {
          const expiryDate = toDateOnly(value);
          const installationDate = toDateOnly(this.installation_date);
          if (expiryDate && installationDate && expiryDate <= installationDate) {
            throw new Error('Expiry date must be after installation date');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...ALLOWED_STATUSES),
      allowNull: false,
      defaultValue: 'Active',
    },
  },
  {
    tableName: 'fire_extinguishers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeValidate(extinguisher) {
        const expiryDate = toDateOnly(extinguisher.expiry_date);
        if (expiryDate && expiryDate < todayDateOnly()) {
          extinguisher.status = 'Expired';
        }
      },
    },
  }
);

module.exports = FireExtinguisher;
