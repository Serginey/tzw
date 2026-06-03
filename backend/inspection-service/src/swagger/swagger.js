'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Inspection Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the Inspection Service.',
  },
  servers: [{ url: 'http://localhost:5004' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/inspections': {
      get: { tags: ['Inspections'], summary: 'Inspection Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/inspections/{id}': {
      get: { tags: ['Inspections'], summary: 'Inspection Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
