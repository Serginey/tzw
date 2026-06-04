'use strict';

const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const routeFiles = [
  'auth-service',
  'user-service',
  'extinguisher-service',
  'inspection-service',
  'maintenance-service',
  'reporting-service',
  'notification-service',
].map((service) => path.join(__dirname, '..', '..', '..', service, 'src', 'routes', '*.js'));

const normalizedRouteFiles = routeFiles.map((routeFile) => routeFile.replace(/\\/g, '/'));

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fire Extinguisher Management System API',
      version: '1.0.0',
      description: 'Single Swagger documentation route for the API Gateway and all FEMS microservice endpoints.',
      contact: {
        name: 'TZW LTD',
        email: 'support@tzwltd.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'API Gateway' },
    ],
    tags: [
      { name: 'Gateway', description: 'API Gateway status and documentation endpoints' },
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Fire Extinguishers', description: 'Fire extinguisher management' },
      { name: 'Inspections', description: 'Inspection scheduling and management' },
      { name: 'Maintenance', description: 'Maintenance log management' },
      { name: 'Reports', description: 'Reporting and analytics' },
      { name: 'Notifications', description: 'User notification management' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT sent with the Authorization header.',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: '__Host-fems_token',
          description: 'JWT stored in an HttpOnly cookie. Login via /api/auth/login to set it.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        SuccessMessage: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'inspector', 'user'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        FireExtinguisher: {
          type: 'object',
          required: ['serial_number', 'location', 'type', 'size', 'installation_date', 'expiry_date'],
          properties: {
            id: { type: 'integer' },
            serial_number: { type: 'string' },
            location: { type: 'string' },
            type: { type: 'string', enum: ['Water', 'CO2', 'Foam', 'Dry Chemical'] },
            size: { type: 'string', enum: ['1.5 lb', '5 lb', '9 lb', '12 lb'] },
            installation_date: { type: 'string', format: 'date' },
            expiry_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Active', 'Expired', 'Under Maintenance', 'Decommissioned'] },
          },
        },
        Inspection: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fire_extinguisher_id: { type: 'integer' },
            scheduled_date: { type: 'string', format: 'date' },
            scheduled_time: { type: 'string' },
            status: { type: 'string', enum: ['Scheduled', 'Completed', 'Overdue', 'Cancelled'] },
            inspector_id: { type: 'integer' },
            notes: { type: 'string' },
          },
        },
        MaintenanceLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fire_extinguisher_id: { type: 'integer' },
            inspector_id: { type: 'integer' },
            action_taken: { type: 'string' },
            maintenance_date: { type: 'string', format: 'date' },
            issues_identified: { type: 'string' },
            notes_recommendations: { type: 'string' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            message: { type: 'string' },
            status: { type: 'string', enum: ['unread', 'read'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
    paths: {
      '/health': {
        get: {
          tags: ['Gateway'],
          summary: 'Gateway health check',
          security: [],
          responses: {
            200: { description: 'Gateway is healthy' },
          },
        },
      },
      '/api/docs': {
        get: {
          tags: ['Gateway'],
          summary: 'Open the combined Swagger UI',
          security: [],
          responses: {
            200: { description: 'Combined Swagger UI' },
          },
        },
      },
      '/api/docs.json': {
        get: {
          tags: ['Gateway'],
          summary: 'Get the combined OpenAPI JSON specification',
          security: [],
          responses: {
            200: { description: 'Combined OpenAPI document' },
          },
        },
      },
    },
  },
  apis: normalizedRouteFiles,
});

module.exports = swaggerSpec;
