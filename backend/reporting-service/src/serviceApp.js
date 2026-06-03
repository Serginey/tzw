'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const defaultSwaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const applyCommonMiddleware = (app, serviceName, swaggerSpec) => {
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  if (config.nodeEnv !== 'test') app.use(morgan('tiny'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: `${serviceName} API Documentation` }));
  app.get('/health', (req, res) => res.json({ service: serviceName, status: 'ok', timestamp: new Date().toISOString() }));
};

const createServiceApp = (serviceName, routeMounts, swaggerSpec = defaultSwaggerSpec) => {
  const app = express();
  applyCommonMiddleware(app, serviceName, swaggerSpec);

  routeMounts.forEach(({ path, router }) => {
    app.use(path, router);
  });

  app.use((req, res) => res.status(404).json({ success: false, message: `${serviceName} route not found.` }));
  app.use(errorHandler);
  return app;
};

const startService = async (app, defaultPort, serviceName) => {
  const port = config.nodeEnv === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
  try {
    await sequelize.authenticate();
    app.listen(port, '0.0.0.0', () => {
      console.log(`${serviceName} running on port ${port}`);
    });
  } catch (err) {
    console.error(`${serviceName} failed to start:`, err.message);
    process.exit(1);
  }
};

module.exports = { createServiceApp, startService };



