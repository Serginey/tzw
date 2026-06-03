'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inspection = sequelize.define(
  'Inspection',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fire_extinguisher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'fire_extinguishers', key: 'id' },
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: true },
    },
    scheduled_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Overdue', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Scheduled',
    },
    inspector_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'inspections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Inspection;
