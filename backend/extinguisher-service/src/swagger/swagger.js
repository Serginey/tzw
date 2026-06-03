'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Fire Extinguisher Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the Fire Extinguisher Service.',
  },
  servers: [{ url: 'http://localhost:5003' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/extinguishers': {
      get: { tags: ['Extinguishers'], summary: 'Fire Extinguisher Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/extinguishers/{id}': {
      get: { tags: ['Extinguishers'], summary: 'Fire Extinguisher Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
