'use strict';
const { createServiceApp, startService } = require('./serviceApp');
const serviceConfig = require('./config/service');
const routes = require('./routes');
const swaggerSpec = require('./swagger');
const { startExtinguisherStatusJob } = require('./jobs/extinguisherStatusJob');

const app = createServiceApp(serviceConfig.name, [
  { path: '/extinguishers', router: routes },
  { path: '/api/extinguishers', router: routes },
], swaggerSpec);

startService(app, serviceConfig.defaultPort, serviceConfig.name);
startExtinguisherStatusJob();


