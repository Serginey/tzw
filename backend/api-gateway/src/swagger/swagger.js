'use strict';

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API Gateway Service API',
    version: '1.0.0',
    description: 'Gateway entrypoint for FEMS frontend requests.',
  },
  servers: [{ url: 'http://localhost:5000' }],
  paths: {
    '/health': {
      get: { tags: ['Gateway'], summary: 'Gateway health check', responses: { 200: { description: 'Gateway is healthy' } } },
    },
    '/api/docs': {
      get: { tags: ['Gateway'], summary: 'Redirect to the common Swagger center', responses: { 302: { description: 'Redirects to /docs' } } },
    },
    '/api/docs.json': {
      get: { tags: ['Gateway'], summary: 'List microservice Swagger URLs', responses: { 200: { description: 'Swagger links' } } },
    },
  },
};
