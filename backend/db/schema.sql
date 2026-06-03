-- ============================================================
-- Fire Extinguisher Management System (FEMS) — TZW LTD
-- PostgreSQL Database Schema
-- ============================================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS fire_extinguishers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ── USERS TABLE ──────────────────────────────────────────────
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'inspector', 'user')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_otp VARCHAR(255),
    email_verification_otp_expires TIMESTAMP WITH TIME ZONE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ── FIRE EXTINGUISHERS TABLE ─────────────────────────────────
CREATE TABLE fire_extinguishers (
    id                SERIAL PRIMARY KEY,
    serial_number     VARCHAR(100) NOT NULL UNIQUE,
    location          VARCHAR(255) NOT NULL,
    type              VARCHAR(30) NOT NULL CHECK (type IN ('Water', 'CO2', 'Foam', 'Dry Chemical')),
    size              VARCHAR(20) NOT NULL CHECK (size IN ('1.5 lb', '5 lb', '9 lb', '12 lb')),
    installation_date DATE NOT NULL,
    expiry_date       DATE NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Under Maintenance', 'Decommissioned')),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Business rule: expiry must be after installation
    CONSTRAINT chk_expiry_after_installation CHECK (expiry_date > installation_date)
);

CREATE INDEX idx_extinguishers_status ON fire_extinguishers(status);
CREATE INDEX idx_extinguishers_serial ON fire_extinguishers(serial_number);
CREATE INDEX idx_extinguishers_expiry ON fire_extinguishers(expiry_date);

-- ── INSPECTIONS TABLE ────────────────────────────────────────
CREATE TABLE inspections (
    id                    SERIAL PRIMARY KEY,
    fire_extinguisher_id  INTEGER NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    scheduled_date        DATE NOT NULL,
    scheduled_time        TIME NOT NULL,
    status                VARCHAR(30) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Overdue', 'Cancelled')),
    inspector_id          INTEGER NOT NULL REFERENCES users(id),
    scheduled_by_user_id  INTEGER NOT NULL REFERENCES users(id),
    notes                 TEXT,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_date ON inspections(scheduled_date);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_scheduled_by ON inspections(scheduled_by_user_id);
CREATE INDEX idx_inspections_extinguisher ON inspections(fire_extinguisher_id);

-- ── MAINTENANCE LOGS TABLE ───────────────────────────────────
CREATE TABLE maintenance_logs (
    id                    SERIAL PRIMARY KEY,
    fire_extinguisher_id  INTEGER NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    inspector_id          INTEGER NOT NULL REFERENCES users(id),
    action_taken          TEXT NOT NULL,
    maintenance_date      DATE NOT NULL,
    issues_identified     TEXT NOT NULL,
    notes_recommendations TEXT,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Business rule: maintenance cannot be in the future
    CONSTRAINT chk_maintenance_date_not_future CHECK (maintenance_date <= CURRENT_DATE)
);

CREATE INDEX idx_maintenance_date ON maintenance_logs(maintenance_date);
CREATE INDEX idx_maintenance_extinguisher ON maintenance_logs(fire_extinguisher_id);
CREATE INDEX idx_maintenance_inspector ON maintenance_logs(inspector_id);

-- ── NOTIFICATIONS TABLE ──────────────────────────────────────
CREATE TABLE notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message    TEXT NOT NULL,
    status     VARCHAR(10) NOT NULL DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- ── SEED DATA ────────────────────────────────────────────────
-- Default Admin User (password: Admin@1234) — CHANGE IN PRODUCTION
-- Hash generated with bcrypt cost factor 12
INSERT INTO users (first_name, last_name, email, password, role, is_verified) VALUES
('System', 'Admin', 'admin@tzwltd.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/BewfpFCUQnJdSf.Hy', 'admin', TRUE),
('Jane', 'Inspector', 'inspector@tzwltd.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/BewfpFCUQnJdSf.Hy', 'inspector', TRUE),
('Bob', 'User', 'user@tzwltd.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/BewfpFCUQnJdSf.Hy', 'user', TRUE);

-- Sample Fire Extinguishers
INSERT INTO fire_extinguishers (serial_number, location, type, size, installation_date, expiry_date, status) VALUES
('FE-2024-001', 'Building A - Floor 1 - Near Entrance', 'CO2', '5 lb', '2024-01-15', '2026-01-15', 'Active'),
('FE-2024-002', 'Building A - Floor 2 - Server Room', 'CO2', '9 lb', '2024-01-15', '2026-01-15', 'Active'),
('FE-2024-003', 'Building B - Kitchen Area', 'Foam', '12 lb', '2024-02-01', '2026-02-01', 'Active'),
('FE-2023-001', 'Warehouse - Section A', 'Dry Chemical', '12 lb', '2023-06-01', '2025-06-01', 'Expired'),
('FE-2024-004', 'Reception Area', 'Water', '5 lb', '2024-03-01', '2026-03-01', 'Active'),
('FE-2024-005', 'Parking Garage - Level 1', 'Dry Chemical', '9 lb', '2024-04-01', '2026-04-01', 'Under Maintenance');

-- Sample Inspections
INSERT INTO inspections (fire_extinguisher_id, scheduled_date, scheduled_time, status, inspector_id, scheduled_by_user_id, notes) VALUES
(1, '2026-06-15', '09:00', 'Scheduled', 2, 3, 'Routine annual inspection'),
(2, '2026-06-15', '10:00', 'Scheduled', 2, 3, 'Routine annual inspection'),
(3, '2026-05-01', '09:00', 'Completed', 2, 3, 'Inspection completed. No issues found.'),
(4, '2025-12-01', '09:00', 'Overdue', 2, 3, 'Overdue - requires immediate attention'),
(5, '2026-07-01', '14:00', 'Scheduled', 2, 3, NULL);

-- Sample Maintenance Logs
INSERT INTO maintenance_logs (fire_extinguisher_id, inspector_id, action_taken, maintenance_date, issues_identified, notes_recommendations) VALUES
(6, 2, 'Replaced pressure gauge and refilled agent', '2026-05-15', 'Low pressure detected during routine check', 'Schedule follow-up inspection in 30 days'),
(3, 2, 'Routine service and pressure test', '2026-04-10', 'None - unit in good condition', 'Continue regular maintenance schedule'),
(4, 2, 'Hose replacement', '2026-03-20', 'Cracked hose detected', 'Unit now fully operational');

COMMENT ON TABLE users IS 'System users with roles: admin, inspector, user';
COMMENT ON TABLE fire_extinguishers IS 'Fire extinguisher inventory with full lifecycle tracking';
COMMENT ON TABLE inspections IS 'Scheduled and completed inspection records';
COMMENT ON TABLE maintenance_logs IS 'Maintenance activity history for all extinguishers';
COMMENT ON TABLE notifications IS 'In-app notification messages for users';
