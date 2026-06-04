# Fire Extinguisher Management System - TZW LTD

RESTful fire extinguisher management app built with React, Express, PostgreSQL, JWT authentication, role-based authorization, Swagger, and Docker Compose.

## Run locally

### 1. Create the database

Make sure PostgreSQL is running, then create the database:

```bash
createdb -U postgres fire_extinguisher_db
```

If `createdb` is not available, use `psql`:

```bash
psql -U postgres -c "CREATE DATABASE fire_extinguisher_db;"
```

### 2. Run database migrations

The project now uses SQL migration files in `backend/db/migrations`. Do not import the old root `database/schema.sql`.

```bash
cd backend/db
npm install
npm run migrate
```

The migration command runs these files in order:

```txt
001_create_users.sql
002_create_fire_extinguishers.sql
003_create_inspections.sql
004_create_maintenance_logs.sql
005_create_notifications.sql
006_add_email_verification.sql
007_add_otp_columns.sql
008_seed_data.sql
```

Database connection settings are in `backend/db/.env`:

```txt
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fire_extinguisher_db
DB_USER=postgres
DB_PASSWORD=
```

### 3. Start backend services

Each service has its own dependencies and must be run from its own folder. Open separate terminals:

```bash
cd backend/auth-service
npm install
npm start
```

```bash
cd backend/user-service
npm install
npm start
```

```bash
cd backend/extinguisher-service
npm install
npm start
```

```bash
cd backend/inspection-service
npm install
npm start
```

```bash
cd backend/maintenance-service
npm install
npm start
```

```bash
cd backend/reporting-service
npm install
npm start
```

```bash
cd backend/notification-service
npm install
npm start
```

Start the API gateway last:

```bash
cd backend/api-gateway
npm install
npm start
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`  
API Gateway: `http://localhost:5000/api`  
Single Swagger endpoint: `http://localhost:5000/docs`  
Combined OpenAPI JSON: `http://localhost:5000/api/docs.json`

## Docker

```bash
docker compose up --build
```

Docker Compose automatically creates PostgreSQL and runs every SQL file in `backend/db/migrations` on first database startup. If you change migrations and want a clean database, remove the volume first:

```bash
docker compose down -v
docker compose up --build
```

The compose file runs PostgreSQL, API gateway, auth, user, extinguisher, inspection, maintenance, reporting, notification, and frontend services. Each service has its own `server.js`, port, and route mount. Inside Docker, the gateway forwards to service names such as `http://auth-service:5001`, not `localhost`.

## Folder Structure

```txt
backend/
  api-gateway/
  auth-service/
  db/
    migrations/
  extinguisher-service/
  inspection-service/
  maintenance-service/
  notification-service/
  reporting-service/
  user-service/
frontend/
  src/
    api/
      axios.js
    components/
      Layout/
      common/
    context/
    pages/
      auth/
      dashboard/
      extinguishers/
      inspections/
      maintenance/
      notifications/
      reports/
      users/
    styles/
    App.jsx
    main.jsx
  index.html
  package.json
```

Each microservice contains its own `Dockerfile`, `package.json`, `package-lock.json`, `node_modules`, `server.js`, `logs`, `src/config`, `src/controllers`, `src/middleware`, `src/models`, `src/routes`, `src/services`, `src/validators`, and `src/swagger` folders. There is no shared `backend/src`; every service can run independently from its own folder.

Database migrations live in `backend/db/migrations` and are loaded by Docker Compose. Local database helpers are in `backend/db/migrate.js` and `backend/db/seed.js`.

The frontend follows the exam structure with React Router, Axios, Auth Context, protected routes, common UI components, and pages for login, register, forgot password, reset password, OTP verification, dashboard, users, extinguishers, inspections, maintenance, reports, and notifications.

## Microservices

- `backend/api-gateway` on `5000`: frontend entrypoint and reverse proxy.
- `backend/auth-service` on `5001`: `/auth` and `/api/auth`.
- `backend/user-service` on `5002`: `/users` and `/api/users`.
- `backend/extinguisher-service` on `5003`: `/extinguishers` and `/api/extinguishers`.
- `backend/inspection-service` on `5004`: `/inspections` and `/api/inspections`.
- `backend/maintenance-service` on `5005`: `/maintenance` and `/api/maintenance`.
- `backend/reporting-service` on `5006`: `/reports` and `/api/reports`.
- `backend/notification-service` on `5007`: `/notifications` and `/api/notifications`.

## Security

- Passwords are hashed with bcrypt.
- JWT is stored in an HttpOnly cookie and can also be accepted as a Bearer token for service forwarding.
- Signup requires email OTP verification before login.
- Helmet, strict CORS, body limits, rate limiting, validation, and RBAC are enabled.
- Passwords, reset tokens, and OTP hashes are never returned by default.
