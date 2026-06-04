'use strict';

const ok = (description = 'Successful response') => ({ description });
const idParam = (name = 'id') => ({
  in: 'path',
  name,
  required: true,
  schema: { type: 'integer' },
});
const paginationParams = [
  { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
  { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
];
const jsonBody = (schema, required = true) => ({
  required,
  content: {
    'application/json': { schema },
  },
});

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Fire Extinguisher Management System API',
    version: '1.0.0',
    description: 'Single Swagger entrypoint for all FEMS microservices through the API gateway.',
    contact: {
      name: 'TZW LTD',
      email: 'support@tzwltd.com',
    },
  },
  servers: [{ url: 'http://localhost:5000', description: 'API Gateway' }],
  tags: [
    { name: 'Gateway', description: 'Gateway status and documentation' },
    { name: 'Authentication', description: 'Registration, login, email verification, and password reset' },
    { name: 'Users', description: 'User profile and admin user management' },
    { name: 'Fire Extinguishers', description: 'Fire extinguisher CRUD' },
    { name: 'Inspections', description: 'Inspection CRUD and scheduling' },
    { name: 'Maintenance', description: 'Maintenance log CRUD' },
    { name: 'Reports', description: 'Reporting and exports' },
    { name: 'Notifications', description: 'Notification CRUD and read status' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: '__Host-fems_token',
        description: 'JWT stored in an HttpOnly cookie. Login with /api/auth/login to set it.',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
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
          serial_number: { type: 'string', example: 'FE-001' },
          location: { type: 'string', example: 'Main Hall' },
          type: { type: 'string', enum: ['Water', 'CO2', 'Foam', 'Dry Chemical'] },
          size: { type: 'string', enum: ['1.5 lb', '5 lb', '9 lb', '12 lb'] },
          installation_date: { type: 'string', format: 'date' },
          expiry_date: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['Active', 'Expired', 'Under Maintenance', 'Decommissioned'] },
        },
      },
      Inspection: {
        type: 'object',
        required: ['fire_extinguisher_id', 'scheduled_date', 'scheduled_time', 'inspector_id'],
        properties: {
          id: { type: 'integer' },
          fire_extinguisher_id: { type: 'integer' },
          scheduled_date: { type: 'string', format: 'date' },
          scheduled_time: { type: 'string', example: '09:00' },
          inspector_id: { type: 'integer' },
          status: { type: 'string', enum: ['Scheduled', 'Completed', 'Overdue', 'Cancelled'] },
          notes: { type: 'string' },
        },
      },
      MaintenanceLog: {
        type: 'object',
        required: ['fire_extinguisher_id', 'action_taken', 'maintenance_date', 'issues_identified'],
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
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  paths: {
    '/health': {
      get: { tags: ['Gateway'], summary: 'Gateway health check', security: [], responses: { 200: ok('Gateway is healthy') } },
    },
    '/api/docs': {
      get: { tags: ['Gateway'], summary: 'Redirect to the single Swagger endpoint', security: [], responses: { 302: ok('Redirects to /docs') } },
    },
    '/api/docs.json': {
      get: { tags: ['Gateway'], summary: 'Get the combined OpenAPI JSON document', security: [], responses: { 200: ok('Combined OpenAPI JSON') } },
    },

    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password'],
          properties: {
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'SecureP@ss1' },
            role: { type: 'string', enum: ['admin', 'inspector', 'user'], example: 'user' },
          },
        }),
        responses: { 201: ok('Account created'), 400: ok('Validation error'), 409: ok('Email already exists') },
      },
    },
    '/api/auth/verify-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify account email with OTP',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'otp'],
          properties: { email: { type: 'string', format: 'email' }, otp: { type: 'string', example: '123456' } },
        }),
        responses: { 200: ok('Email verified'), 400: ok('Invalid or expired OTP') },
      },
    },
    '/api/auth/resend-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Resend signup verification OTP',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        }),
        responses: { 200: ok('OTP resent') },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login and receive JWT cookie',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'password'],
          properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
        }),
        responses: { 200: ok('Login successful'), 401: ok('Invalid credentials') },
      },
    },
    '/api/auth/logout': {
      post: { tags: ['Authentication'], summary: 'Logout and clear session cookie', responses: { 200: ok('Logged out') } },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset email',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        }),
        responses: { 200: ok('Reset email sent') },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password with token',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['token', 'password'],
          properties: { token: { type: 'string' }, password: { type: 'string' } },
        }),
        responses: { 200: ok('Password reset'), 400: ok('Invalid or expired token') },
      },
    },
    '/api/auth/validate-token': {
      get: { tags: ['Authentication'], summary: 'Validate current session token', responses: { 200: ok('Token is valid'), 401: ok('Invalid token') } },
    },

    '/api/users/profile': {
      get: { tags: ['Users'], summary: 'Get current user profile', responses: { 200: ok('User profile') } },
      put: {
        tags: ['Users'],
        summary: 'Update current user profile',
        requestBody: jsonBody({
          type: 'object',
          properties: { first_name: { type: 'string' }, last_name: { type: 'string' } },
        }, false),
        responses: { 200: ok('Profile updated') },
      },
    },
    '/api/users/change-password': {
      put: {
        tags: ['Users'],
        summary: 'Change current user password',
        requestBody: jsonBody({
          type: 'object',
          required: ['current_password', 'new_password'],
          properties: { current_password: { type: 'string' }, new_password: { type: 'string' } },
        }),
        responses: { 200: ok('Password changed'), 400: ok('Current password incorrect') },
      },
    },
    '/api/users/invite-inspector': {
      post: {
        tags: ['Users'],
        summary: 'Invite a new inspector',
        requestBody: jsonBody({
          type: 'object',
          required: ['first_name', 'last_name', 'email'],
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        }),
        responses: { 201: ok('Inspector invited') },
      },
    },
    '/api/users/inspectors': {
      get: { tags: ['Users'], summary: 'Get all inspectors', responses: { 200: ok('Inspectors list') } },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'role', schema: { type: 'string', enum: ['admin', 'inspector', 'user'] } },
          ...paginationParams,
        ],
        responses: { 200: ok('Users list') },
      },
    },
    '/api/users/{id}': {
      get: { tags: ['Users'], summary: 'Get user by ID', parameters: [idParam()], responses: { 200: ok('User found'), 404: ok('User not found') } },
      put: {
        tags: ['Users'],
        summary: 'Update user by ID',
        parameters: [idParam()],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'inspector', 'user'] },
          },
        }, false),
        responses: { 200: ok('User updated') },
      },
      delete: { tags: ['Users'], summary: 'Delete user by ID', parameters: [idParam()], responses: { 200: ok('User deleted') } },
    },

    '/api/extinguishers': {
      post: {
        tags: ['Fire Extinguishers'],
        summary: 'Create fire extinguisher',
        requestBody: jsonBody({ $ref: '#/components/schemas/FireExtinguisher' }),
        responses: { 201: ok('Fire extinguisher created'), 409: ok('Serial number already exists') },
      },
      get: {
        tags: ['Fire Extinguishers'],
        summary: 'Get all fire extinguishers',
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['Water', 'CO2', 'Foam', 'Dry Chemical'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['Active', 'Expired', 'Under Maintenance', 'Decommissioned'] } },
          ...paginationParams,
        ],
        responses: { 200: ok('Fire extinguishers list') },
      },
    },
    '/api/extinguishers/{id}': {
      get: { tags: ['Fire Extinguishers'], summary: 'Get fire extinguisher by ID', parameters: [idParam()], responses: { 200: ok('Fire extinguisher details') } },
      put: {
        tags: ['Fire Extinguishers'],
        summary: 'Update fire extinguisher',
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: '#/components/schemas/FireExtinguisher' }),
        responses: { 200: ok('Fire extinguisher updated') },
      },
      delete: { tags: ['Fire Extinguishers'], summary: 'Delete fire extinguisher', parameters: [idParam()], responses: { 200: ok('Fire extinguisher deleted') } },
    },

    '/api/inspections': {
      post: {
        tags: ['Inspections'],
        summary: 'Schedule inspection',
        requestBody: jsonBody({ $ref: '#/components/schemas/Inspection' }),
        responses: { 201: ok('Inspection scheduled') },
      },
      get: {
        tags: ['Inspections'],
        summary: 'Get inspections',
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['Scheduled', 'Completed', 'Overdue', 'Cancelled'] } },
          { in: 'query', name: 'inspector_id', schema: { type: 'integer' } },
          ...paginationParams,
        ],
        responses: { 200: ok('Inspections list') },
      },
    },
    '/api/inspections/{id}': {
      get: { tags: ['Inspections'], summary: 'Get inspection by ID', parameters: [idParam()], responses: { 200: ok('Inspection details') } },
      put: {
        tags: ['Inspections'],
        summary: 'Update inspection',
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: '#/components/schemas/Inspection' }, false),
        responses: { 200: ok('Inspection updated') },
      },
      delete: { tags: ['Inspections'], summary: 'Delete inspection', parameters: [idParam()], responses: { 200: ok('Inspection deleted') } },
    },

    '/api/maintenance': {
      post: {
        tags: ['Maintenance'],
        summary: 'Create maintenance log',
        requestBody: jsonBody({ $ref: '#/components/schemas/MaintenanceLog' }),
        responses: { 201: ok('Maintenance log created') },
      },
      get: {
        tags: ['Maintenance'],
        summary: 'Get all maintenance logs',
        parameters: [
          { in: 'query', name: 'extinguisher_id', schema: { type: 'integer' } },
          { in: 'query', name: 'from_date', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'to_date', schema: { type: 'string', format: 'date' } },
          ...paginationParams,
        ],
        responses: { 200: ok('Maintenance logs list') },
      },
    },
    '/api/maintenance/{id}': {
      get: { tags: ['Maintenance'], summary: 'Get maintenance log by ID', parameters: [idParam()], responses: { 200: ok('Maintenance log details') } },
      put: {
        tags: ['Maintenance'],
        summary: 'Update maintenance log',
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: '#/components/schemas/MaintenanceLog' }, false),
        responses: { 200: ok('Maintenance log updated') },
      },
      delete: { tags: ['Maintenance'], summary: 'Delete maintenance log', parameters: [idParam()], responses: { 200: ok('Maintenance log deleted') } },
    },

    '/api/reports/dashboard': {
      get: { tags: ['Reports'], summary: 'Dashboard statistics', responses: { 200: ok('Dashboard stats') } },
    },
    '/api/reports/inventory': {
      get: { tags: ['Reports'], summary: 'Inventory report', responses: { 200: ok('Inventory summary') } },
    },
    '/api/reports/inspections': {
      get: { tags: ['Reports'], summary: 'Inspections report', responses: { 200: ok('Inspection summary') } },
    },
    '/api/reports/compliance': {
      get: { tags: ['Reports'], summary: 'Compliance report', responses: { 200: ok('Compliance summary') } },
    },
    '/api/reports/maintenance': {
      get: {
        tags: ['Reports'],
        summary: 'Maintenance report',
        parameters: [
          { in: 'query', name: 'from_date', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'to_date', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: ok('Maintenance report') },
      },
    },
    '/api/reports/export/csv': {
      get: {
        tags: ['Reports'],
        summary: 'Export report as CSV',
        parameters: [{ in: 'query', name: 'type', schema: { type: 'string', enum: ['inventory', 'inspections', 'maintenance'] } }],
        responses: { 200: { description: 'CSV file download', content: { 'text/csv': { schema: { type: 'string' } } } } },
      },
    },
    '/api/reports/export/pdf': {
      get: {
        tags: ['Reports'],
        summary: 'Export report as PDF',
        parameters: [{ in: 'query', name: 'type', schema: { type: 'string', enum: ['inventory', 'inspections'] } }],
        responses: { 200: { description: 'PDF file download', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } } },
      },
    },

    '/api/notifications': {
      post: {
        tags: ['Notifications'],
        summary: 'Create notification',
        requestBody: jsonBody({
          type: 'object',
          required: ['user_id', 'message'],
          properties: { user_id: { type: 'integer' }, message: { type: 'string' } },
        }),
        responses: { 201: ok('Notification created') },
      },
      get: {
        tags: ['Notifications'],
        summary: 'Get current user notifications',
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['read', 'unread'] } },
          ...paginationParams,
        ],
        responses: { 200: ok('Notifications list') },
      },
    },
    '/api/notifications/read-all': {
      put: { tags: ['Notifications'], summary: 'Mark all notifications as read', responses: { 200: ok('All notifications marked as read') } },
    },
    '/api/notifications/{id}': {
      get: { tags: ['Notifications'], summary: 'Get notification by ID', parameters: [idParam()], responses: { 200: ok('Notification details') } },
      delete: { tags: ['Notifications'], summary: 'Delete notification', parameters: [idParam()], responses: { 200: ok('Notification deleted') } },
    },
    '/api/notifications/{id}/read': {
      put: { tags: ['Notifications'], summary: 'Mark notification as read', parameters: [idParam()], responses: { 200: ok('Notification marked as read') } },
    },
  },
};
