'use strict';
const cron = require('node-cron');
const { Op } = require('sequelize');
const { FireExtinguisher } = require('../models');

const today = () => new Date().toISOString().split('T')[0];

const syncExpiredExtinguishers = async () => {
  const [updatedCount] = await FireExtinguisher.update(
    { status: 'Expired' },
    {
      where: {
        expiry_date: { [Op.lt]: today() },
        status: 'Active',
      },
    }
  );

  if (updatedCount > 0) {
    console.log(`[ExtinguisherStatusJob] Marked ${updatedCount} extinguisher(s) as Expired.`);
  }

  return updatedCount;
};

const startExtinguisherStatusJob = () => {
  syncExpiredExtinguishers().catch((err) => {
    console.error('[ExtinguisherStatusJob] Startup sync failed:', err.message);
  });

  cron.schedule(process.env.EXTINGUISHER_STATUS_CRON || '0 0 * * *', () => {
    syncExpiredExtinguishers().catch((err) => {
      console.error('[ExtinguisherStatusJob] Scheduled sync failed:', err.message);
    });
  });

  console.log('[ExtinguisherStatusJob] Scheduled expiry status sync.');
};

module.exports = { startExtinguisherStatusJob, syncExpiredExtinguishers };
