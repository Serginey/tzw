'use strict';
const sequelize = require('../config/database');
const User = require('./User');
const FireExtinguisher = require('./FireExtinguisher');
const Inspection = require('./Inspection');
const MaintenanceLog = require('./MaintenanceLog');
const Notification = require('./Notification');

// ── Associations ───────────────────────────────────────────────────────────────
// One user (inspector) can perform many inspections
User.hasMany(Inspection, { foreignKey: 'inspector_id', as: 'inspections_conducted' });
Inspection.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });

// One fire extinguisher can have many inspections
FireExtinguisher.hasMany(Inspection, { foreignKey: 'fire_extinguisher_id', as: 'inspections' });
Inspection.belongsTo(FireExtinguisher, { foreignKey: 'fire_extinguisher_id', as: 'extinguisher' });

// One fire extinguisher can have many maintenance logs
FireExtinguisher.hasMany(MaintenanceLog, { foreignKey: 'fire_extinguisher_id', as: 'maintenance_logs' });
MaintenanceLog.belongsTo(FireExtinguisher, { foreignKey: 'fire_extinguisher_id', as: 'extinguisher' });

// Inspector performs maintenance
User.hasMany(MaintenanceLog, { foreignKey: 'inspector_id', as: 'maintenance_conducted' });
MaintenanceLog.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });

// One user can receive many notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, FireExtinguisher, Inspection, MaintenanceLog, Notification };
