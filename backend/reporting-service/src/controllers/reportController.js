'use strict';
const { FireExtinguisher, Inspection, MaintenanceLog } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

/**
 * GET /api/reports/inventory
 */
const inventoryReport = async (req, res, next) => {
  try {
    const total = await FireExtinguisher.count();
    const byType = await FireExtinguisher.findAll({
      attributes: ['type', [fn('COUNT', col('id')), 'count']],
      group: ['type'],
    });
    const byStatus = await FireExtinguisher.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });
    const bySize = await FireExtinguisher.findAll({
      attributes: ['size', [fn('COUNT', col('id')), 'count']],
      group: ['size'],
    });

    // Daily/Monthly/Yearly summaries
    const today = new Date().toISOString().split('T')[0];
    const dailyAdded = await FireExtinguisher.count({ where: { created_at: { [Op.gte]: new Date(today) } } });

    res.json({ success: true, data: { total, byType, byStatus, bySize, dailyAdded } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/inspections
 */
const inspectionsReport = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [pending, completed, overdue] = await Promise.all([
      Inspection.count({ where: { status: 'Scheduled' } }),
      Inspection.count({ where: { status: 'Completed' } }),
      Inspection.count({ where: { status: 'Overdue' } }),
    ]);

    // Auto-mark overdue (scheduled_date < today and still 'Scheduled')
    await Inspection.update(
      { status: 'Overdue' },
      { where: { status: 'Scheduled', scheduled_date: { [Op.lt]: today } } }
    );

    const recent = await Inspection.findAll({
      limit: 10,
      order: [['scheduled_date', 'DESC']],
    });

    res.json({ success: true, data: { pending, completed, overdue, recent } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/compliance
 */
const complianceReport = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

    const [expired, upcomingExpiry, active] = await Promise.all([
      FireExtinguisher.findAll({ where: { expiry_date: { [Op.lt]: today } } }),
      FireExtinguisher.findAll({ where: { expiry_date: { [Op.between]: [today, thirtyDaysStr] } } }),
      FireExtinguisher.count({ where: { status: 'Active', expiry_date: { [Op.gte]: today } } }),
    ]);

    const total = await FireExtinguisher.count();
    const complianceRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: { expired, expiredCount: expired.length, upcomingExpiry, upcomingExpiryCount: upcomingExpiry.length, active, complianceRate: `${complianceRate}%` },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/maintenance
 */
const maintenanceReport = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    const where = {};
    if (from_date) where.maintenance_date = { [Op.gte]: from_date };
    if (to_date) where.maintenance_date = { ...where.maintenance_date, [Op.lte]: to_date };

    const total = await MaintenanceLog.count({ where });
    const recent = await MaintenanceLog.findAll({ where, limit: 10, order: [['maintenance_date', 'DESC']] });

    const frequency = await MaintenanceLog.findAll({
      attributes: [
        'fire_extinguisher_id',
        [fn('COUNT', col('id')), 'count'],
        [fn('MAX', col('maintenance_date')), 'last_maintenance'],
      ],
      where,
      group: ['fire_extinguisher_id'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
    });

    res.json({ success: true, data: { total, recent, frequency } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/export/csv
 */
const exportCsv = async (req, res, next) => {
  try {
    const { Parser } = require('json2csv');
    const { type: reportType = 'inventory' } = req.query;

    let data = [];
    let fields = [];

    if (reportType === 'inventory') {
      data = await FireExtinguisher.findAll({ raw: true });
      fields = ['id', 'serial_number', 'location', 'type', 'size', 'installation_date', 'expiry_date', 'status'];
    } else if (reportType === 'inspections') {
      data = await Inspection.findAll({ raw: true });
      fields = ['id', 'fire_extinguisher_id', 'scheduled_date', 'scheduled_time', 'status', 'inspector_id', 'notes'];
    } else if (reportType === 'maintenance') {
      data = await MaintenanceLog.findAll({ raw: true });
      fields = ['id', 'fire_extinguisher_id', 'inspector_id', 'action_taken', 'maintenance_date', 'issues_identified'];
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/export/pdf
 */
const exportPdf = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const { type: reportType = 'inventory' } = req.query;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('TZW LTD — Fire Extinguisher Management System', { align: 'center' });
    doc.fontSize(14).text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    if (reportType === 'inventory') {
      const extinguishers = await FireExtinguisher.findAll({ raw: true });
      doc.fontSize(12).text(`Total Extinguishers: ${extinguishers.length}`);
      doc.moveDown();
      extinguishers.forEach((e) => {
        doc.fontSize(10).text(`${e.serial_number} | ${e.location} | ${e.type} | ${e.size} | Status: ${e.status} | Expiry: ${e.expiry_date}`);
      });
    } else if (reportType === 'inspections') {
      const inspections = await Inspection.findAll({ raw: true });
      doc.fontSize(12).text(`Total Inspections: ${inspections.length}`);
      doc.moveDown();
      inspections.forEach((i) => {
        doc.fontSize(10).text(`ID:${i.id} | Date: ${i.scheduled_date} ${i.scheduled_time} | Status: ${i.status}`);
      });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/dashboard
 */
const dashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      totalExtinguishers,
      pendingInspections,
      completedInspections,
      overdueInspections,
      expiredExtinguishers,
      upcomingExpiries,
      recentMaintenance,
    ] = await Promise.all([
      FireExtinguisher.count(),
      Inspection.count({ where: { status: 'Scheduled' } }),
      Inspection.count({ where: { status: 'Completed' } }),
      Inspection.count({ where: { status: 'Overdue' } }),
      FireExtinguisher.count({ where: { expiry_date: { [Op.lt]: today } } }),
      FireExtinguisher.count({ where: { expiry_date: { [Op.between]: [today, thirtyDaysFromNow.toISOString().split('T')[0]] } } }),
      MaintenanceLog.findAll({ limit: 5, order: [['maintenance_date', 'DESC']], include: [{ model: FireExtinguisher, as: 'extinguisher', attributes: ['serial_number', 'location'] }] }),
    ]);

    res.json({
      success: true,
      data: { totalExtinguishers, pendingInspections, completedInspections, overdueInspections, expiredExtinguishers, upcomingExpiries, recentMaintenance },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { inventoryReport, inspectionsReport, complianceReport, maintenanceReport, exportCsv, exportPdf, dashboardStats };
