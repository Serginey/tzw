'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceLog = sequelize.define(
  'MaintenanceLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fire_extinguisher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'fire_extinguishers', key: 'id' },
    },
    inspector_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    action_taken: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    maintenance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isNotFuture(value) {
          if (value && value > new Date().toISOString().split('T')[0]) {
            throw new Error('Maintenance date cannot be in the future');
          }
        },
      },
    },
    issues_identified: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    notes_recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'maintenance_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = MaintenanceLog;
