'use strict';
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fire Extinguisher Management System (FEMS) API',
      version: '1.0.0',
      description: 'RESTful API for TZW LTD Fire Extinguisher Management System. All endpoints (except auth) require a valid JWT token stored in an HttpOnly cookie.',
      contact: {
        name: 'TZW LTD',
        email: 'support@tzwltd.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: '__Host-fems_token',
          description: 'JWT stored in HttpOnly cookie. Login via /api/auth/login to set it.',
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
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
