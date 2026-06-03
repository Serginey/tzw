'use strict';
const helmet = require('helmet');
const cors = require('cors');

const applyGatewayMiddleware = (app, allowedOrigins) => {
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  }));
};

module.exports = { applyGatewayMiddleware };
