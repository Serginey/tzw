'use strict';
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const serviceConfig = require('./config/service');
const swaggerSpec = require('./swagger');
const { getHealth } = require('./controllers');
const { applyGatewayMiddleware } = require('./middleware');
const { proxyTo } = require('./services');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || serviceConfig.defaultPort;
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const services = [
  { name: 'Authentication Service', prefix: '/api/auth', target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001' },
  { name: 'User Service', prefix: '/api/users', target: process.env.USER_SERVICE_URL || 'http://localhost:5002' },
  { name: 'Extinguisher Service', prefix: '/api/extinguishers', target: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:5003' },
  { name: 'Inspection Service', prefix: '/api/inspections', target: process.env.INSPECTION_SERVICE_URL || 'http://localhost:5004' },
  { name: 'Maintenance Service', prefix: '/api/maintenance', target: process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:5005' },
  { name: 'Reporting Service', prefix: '/api/reports', target: process.env.REPORTING_SERVICE_URL || 'http://localhost:5006' },
  { name: 'Notification Service', prefix: '/api/notifications', target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007' },
];

applyGatewayMiddleware(app, allowedOrigins);

app.get('/api/docs', (req, res) => res.redirect('/docs'));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'FEMS API Documentation' }));
app.get('/health', getHealth);

services.forEach(({ prefix, target }) => {
  app.use(prefix, proxyTo(target));
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Gateway route not found.' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`${serviceConfig.name} running on port ${PORT}`);
});
