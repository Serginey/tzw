'use strict';
const { createServiceApp, startService } = require('./serviceApp');
const serviceConfig = require('./config/service');
const routes = require('./routes');
const swaggerSpec = require('./swagger');

const app = createServiceApp(serviceConfig.name, [
  { path: '/users', router: routes },
  { path: '/api/users', router: routes },
], swaggerSpec);

startService(app, serviceConfig.defaultPort, serviceConfig.name);


