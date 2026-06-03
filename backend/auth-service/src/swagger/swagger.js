'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Authentication Service API',
    version: '1.0.0',
    description: 'Swagger documentation for the Authentication Service.',
  },
  servers: [{ url: 'http://localhost:5001' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'fems_token' },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/auth/register': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/login': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/logout': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/validate-token': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/forgot-password': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/reset-password': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/verify-email': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
    '/auth/resend-otp': {
      get: { tags: ['Authentication'], summary: 'Authentication Service endpoint', responses: { 200: { description: 'Success' } } },
    },
  },
};
