'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Reporting Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the Reporting Service.',
  },
  servers: [{ url: 'http://localhost:5006' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/reports/inventory': {
      get: { tags: ['Reports'], summary: 'Reporting Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/reports/inspections': {
      get: { tags: ['Reports'], summary: 'Reporting Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/reports/compliance': {
      get: { tags: ['Reports'], summary: 'Reporting Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/reports/maintenance': {
      get: { tags: ['Reports'], summary: 'Reporting Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/reports/export/pdf': {
      get: { tags: ['Reports'], summary: 'Reporting Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/reports/export/csv': {
      get: { tags: ['Reports'], summary: 'Reporting Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
