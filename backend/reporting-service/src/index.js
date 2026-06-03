'use strict';
const { createServiceApp, startService } = require('./serviceApp');
const serviceConfig = require('./config/service');
const routes = require('./routes');
const swaggerSpec = require('./swagger');

const app = createServiceApp(serviceConfig.name, [
  { path: '/reports', router: routes },
  { path: '/api/reports', router: routes },
], swaggerSpec);

startService(app, serviceConfig.defaultPort, serviceConfig.name);


