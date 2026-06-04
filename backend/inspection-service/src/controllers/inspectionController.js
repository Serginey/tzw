'use strict';
const { Inspection, FireExtinguisher, User } = require('../models');
const notificationService = require('../services/notificationService');

const notifyInspectorInBackground = ({ inspector, extinguisher, scheduled_date, scheduled_time }) => {
  const notificationMessage = `New inspection scheduled for extinguisher ${extinguisher.serial_number} on ${scheduled_date} at ${scheduled_time}`;
  const emailMessage = `An inspection has been scheduled for fire extinguisher ${extinguisher.serial_number} (${extinguisher.location}) on ${scheduled_date} at ${scheduled_time}.`;

  Promise.resolve()
    .then(() => notificationService.createNotification(inspector.id, notificationMessage))
    .then(() => {
      if (!inspector.email) return null;
      return notificationService.sendEmailNotification(
        inspector.email,
        'New Inspection Scheduled - FEMS TZW LTD',
        emailMessage
      );
    })
    .catch((err) => {
      console.error('[InspectionController] Background inspector notification failed:', err.message);
    });
};

/**
 * POST /api/inspections
 */
const create = async (req, res, next) => {
  try {
    if (req.user.role === 'inspector') {
      return res.status(403).json({ success: false, message: 'Inspectors conduct inspections; users schedule them.' });
    }

    const { fire_extinguisher_id, scheduled_date, scheduled_time, inspector_id, notes } = req.body;

    // Verify extinguisher and inspector exist
    const [extinguisher, inspector] = await Promise.all([
      FireExtinguisher.findByPk(fire_extinguisher_id),
      User.findByPk(inspector_id),
    ]);
    if (!extinguisher) return res.status(404).json({ success: false, message: 'Fire extinguisher not found.' });
    if (!inspector || !['inspector', 'admin'].includes(inspector.role)) {
      return res.status(400).json({ success: false, message: 'Inspector not found or is not an inspector.' });
    }

    const inspection = await Inspection.create({
      fire_extinguisher_id,
      scheduled_date,
      scheduled_time,
      inspector_id,
      scheduled_by_user_id: req.user.id,
      status: 'Scheduled',
      notes,
    });

    notifyInspectorInBackground({ inspector, extinguisher, scheduled_date, scheduled_time });

    res.status(201).json({ success: true, message: 'Inspection scheduled successfully.', data: { inspection } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/inspections
 */
const getAll = async (req, res, next) => {
  try {
    const { status, inspector_id, extinguisher_id, page = 1, limit = 10 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (inspector_id) where.inspector_id = inspector_id;
    if (extinguisher_id) where.fire_extinguisher_id = extinguisher_id;

    // Users only see inspections they scheduled. Inspectors can see scheduled work.
    if (req.user.role === 'user') where.scheduled_by_user_id = req.user.id;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: inspections } = await Inspection.findAndCountAll({
      where,
      include: [
        { model: FireExtinguisher, as: 'extinguisher', attributes: ['id', 'serial_number', 'location', 'type'] },
        { model: User, as: 'inspector', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'scheduled_by', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['scheduled_date', 'DESC']],
    });

    res.json({ success: true, data: { inspections, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/inspections/:id
 */
const getById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [
        { model: FireExtinguisher, as: 'extinguisher' },
        { model: User, as: 'inspector', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'scheduled_by', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
    });
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found.' });

    if (req.user.role === 'user' && inspection.scheduled_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { inspection } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/inspections/:id
 */
const update = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found.' });

    const { fire_extinguisher_id, scheduled_date, scheduled_time, inspector_id, status, notes } = req.body;

    if (req.user.role === 'inspector') {
      await inspection.update({ status, notes });
    } else {
      await inspection.update({ fire_extinguisher_id, scheduled_date, scheduled_time, inspector_id, status, notes });
    }

    res.json({ success: true, message: 'Inspection updated successfully.', data: { inspection } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/inspections/:id
 */
const remove = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found.' });
    await inspection.destroy();
    res.json({ success: true, message: 'Inspection deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getById, update, remove };
