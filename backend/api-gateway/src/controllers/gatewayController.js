'use strict';

const getHealth = (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok', timestamp: new Date().toISOString() });
};

module.exports = { getHealth };
