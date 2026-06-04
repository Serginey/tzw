'use strict';
const { FireExtinguisher, Inspection, MaintenanceLog } = require('../models');
const { Op } = require('sequelize');

const isPastDate = (value) => {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return date < today;
};

const normalizeStatusForExpiry = (payload) => ({
  ...payload,
  status: isPastDate(payload.expiry_date) ? 'Expired' : payload.status,
});

/**
 * POST /api/extinguishers
 */
const create = async (req, res, next) => {
  try {
    const { serial_number, location, type, size, installation_date, expiry_date, status } = req.body;
    const extinguisher = await FireExtinguisher.create(normalizeStatusForExpiry({
      serial_number,
      location,
      type,
      size,
      installation_date,
      expiry_date,
      status,
    }));
    res.status(201).json({ success: true, message: 'Fire extinguisher added successfully.', data: { extinguisher } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/extinguishers
 */
const getAll = async (req, res, next) => {
  try {
    const { search, type, status, page = 1, limit = 10 } = req.query;
    const where = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { serial_number: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: extinguishers } = await FireExtinguisher.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: { extinguishers, total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/extinguishers/:id
 */
const getById = async (req, res, next) => {
  try {
    const inspectionInclude = {
      model: Inspection,
      as: 'inspections',
      limit: 5,
      order: [['scheduled_date', 'DESC']],
    };

    if (req.user.role === 'user') {
      inspectionInclude.where = { scheduled_by_user_id: req.user.id };
      inspectionInclude.required = false;
    }

    const extinguisher = await FireExtinguisher.findByPk(req.params.id, {
      include: [
        inspectionInclude,
        { model: MaintenanceLog, as: 'maintenance_logs', limit: 5, order: [['maintenance_date', 'DESC']] },
      ],
    });
    if (!extinguisher) return res.status(404).json({ success: false, message: 'Fire extinguisher not found.' });
    res.json({ success: true, data: { extinguisher } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/extinguishers/:id
 */
const update = async (req, res, next) => {
  try {
    const extinguisher = await FireExtinguisher.findByPk(req.params.id);
    if (!extinguisher) return res.status(404).json({ success: false, message: 'Fire extinguisher not found.' });

    const { serial_number, location, type, size, installation_date, expiry_date, status } = req.body;

    // Check serial uniqueness if changed
    if (serial_number && serial_number !== extinguisher.serial_number) {
      const existing = await FireExtinguisher.findOne({ where: { serial_number } });
      if (existing) return res.status(409).json({ success: false, message: 'Serial number already in use.' });
    }

    await extinguisher.update(normalizeStatusForExpiry({ serial_number, location, type, size, installation_date, expiry_date, status }));
    res.json({ success: true, message: 'Fire extinguisher updated successfully.', data: { extinguisher } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/extinguishers/:id
 */
const remove = async (req, res, next) => {
  try {
    const extinguisher = await FireExtinguisher.findByPk(req.params.id);
    if (!extinguisher) return res.status(404).json({ success: false, message: 'Fire extinguisher not found.' });
    await extinguisher.destroy();
    res.json({ success: true, message: 'Fire extinguisher deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getById, update, remove };
