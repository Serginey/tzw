'use strict';
const { MaintenanceLog, FireExtinguisher, User } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /api/maintenance
 */
const create = async (req, res, next) => {
  try {
    const { fire_extinguisher_id, action_taken, maintenance_date, issues_identified, notes_recommendations } = req.body;

    const extinguisher = await FireExtinguisher.findByPk(fire_extinguisher_id);
    if (!extinguisher) return res.status(404).json({ success: false, message: 'Fire extinguisher not found.' });

    const log = await MaintenanceLog.create({
      fire_extinguisher_id,
      inspector_id: req.user.id,
      action_taken,
      maintenance_date,
      issues_identified,
      notes_recommendations,
    });

    res.status(201).json({ success: true, message: 'Maintenance log created successfully.', data: { log } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/maintenance
 */
const getAll = async (req, res, next) => {
  try {
    const { extinguisher_id, from_date, to_date, page = 1, limit = 10 } = req.query;
    const where = {};

    if (extinguisher_id) where.fire_extinguisher_id = extinguisher_id;
    if (from_date || to_date) {
      where.maintenance_date = {};
      if (from_date) where.maintenance_date[Op.gte] = from_date;
      if (to_date) where.maintenance_date[Op.lte] = to_date;
    }
    if (req.user.role === 'inspector') where.inspector_id = req.user.id;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: logs } = await MaintenanceLog.findAndCountAll({
      where,
      include: [
        { model: FireExtinguisher, as: 'extinguisher', attributes: ['id', 'serial_number', 'location', 'type'] },
        { model: User, as: 'inspector', attributes: ['id', 'first_name', 'last_name'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['maintenance_date', 'DESC']],
    });

    res.json({ success: true, data: { logs, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/maintenance/:id
 */
const getById = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id, {
      include: [
        { model: FireExtinguisher, as: 'extinguisher' },
        { model: User, as: 'inspector', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
    });
    if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found.' });
    if (req.user.role === 'inspector' && log.inspector_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, data: { log } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/maintenance/:id
 */
const update = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found.' });
    if (req.user.role === 'inspector' && log.inspector_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { action_taken, maintenance_date, issues_identified, notes_recommendations } = req.body;
    await log.update({ action_taken, maintenance_date, issues_identified, notes_recommendations });
    res.json({ success: true, message: 'Maintenance log updated successfully.', data: { log } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/maintenance/:id
 */
const remove = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found.' });
    await log.destroy();
    res.json({ success: true, message: 'Maintenance log deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getById, update, remove };
