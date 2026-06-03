'use strict';
const { createServiceApp, startService } = require('./serviceApp');
const serviceConfig = require('./config/service');
const routes = require('./routes');
const swaggerSpec = require('./swagger');

const app = createServiceApp(serviceConfig.name, [
  { path: '/notifications', router: routes },
  { path: '/api/notifications', router: routes },
], swaggerSpec);

startService(app, serviceConfig.defaultPort, serviceConfig.name);


