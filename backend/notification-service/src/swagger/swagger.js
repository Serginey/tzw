'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Notification Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the Notification Service.',
  },
  servers: [{ url: 'http://localhost:5007' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/notifications': {
      get: { tags: ['Notifications'], summary: 'Notification Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/notifications/{id}': {
      get: { tags: ['Notifications'], summary: 'Notification Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/notifications/{id}/read': {
      get: { tags: ['Notifications'], summary: 'Notification Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
