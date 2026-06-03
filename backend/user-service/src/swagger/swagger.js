'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'User Management Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the User Management Service.',
  },
  servers: [{ url: 'http://localhost:5002' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/users': {
      get: { tags: ['Users'], summary: 'User Management Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/users/{id}': {
      get: { tags: ['Users'], summary: 'User Management Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/users/profile': {
      get: { tags: ['Users'], summary: 'User Management Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/users/change-password': {
      get: { tags: ['Users'], summary: 'User Management Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
