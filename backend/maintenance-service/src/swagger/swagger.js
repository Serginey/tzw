'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Maintenance Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the Maintenance Service.',
  },
  servers: [{ url: 'http://localhost:5005' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/maintenance': {
      get: { tags: ['Maintenance'], summary: 'Maintenance Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/maintenance/{id}': {
      get: { tags: ['Maintenance'], summary: 'Maintenance Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
