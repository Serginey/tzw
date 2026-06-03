INSERT INTO users (first_name, last_name, email, password, role, is_verified) VALUES
('Sergine', 'Admin', 'iyamuremyesergine241@gmail.com', '$2a$12$9fDBT1e1HRg2Sk.braorCuc.RVQDVlwRYYGtg.CbaV/XUu/DzhT3y', 'admin', TRUE),
('Jane', 'Inspector', 'inspector@tzwltd.com', '$2a$12$9fDBT1e1HRg2Sk.braorCuc.RVQDVlwRYYGtg.CbaV/XUu/DzhT3y', 'inspector', TRUE),
('Bob', 'User', 'user@tzwltd.com', '$2a$12$9fDBT1e1HRg2Sk.braorCuc.RVQDVlwRYYGtg.CbaV/XUu/DzhT3y', 'user', TRUE);

INSERT INTO fire_extinguishers (serial_number, location, type, size, installation_date, expiry_date, status) VALUES
('FE-2024-001', 'Building A - Floor 1 - Near Entrance', 'CO2', '5 lb', '2024-01-15', '2026-01-15', 'Active'),
('FE-2024-002', 'Building A - Floor 2 - Server Room', 'CO2', '9 lb', '2024-01-15', '2026-01-15', 'Active'),
('FE-2024-003', 'Building B - Kitchen Area', 'Foam', '12 lb', '2024-02-01', '2026-02-01', 'Active'),
('FE-2023-001', 'Warehouse - Section A', 'Dry Chemical', '12 lb', '2023-06-01', '2025-06-01', 'Expired'),
('FE-2024-004', 'Reception Area', 'Water', '5 lb', '2024-03-01', '2026-03-01', 'Active'),
('FE-2024-005', 'Parking Garage - Level 1', 'Dry Chemical', '9 lb', '2024-04-01', '2026-04-01', 'Under Maintenance');

INSERT INTO inspections (fire_extinguisher_id, scheduled_date, scheduled_time, status, inspector_id, scheduled_by_user_id, notes) VALUES
(1, '2026-06-15', '09:00', 'Scheduled', 2, 3, 'Routine annual inspection'),
(2, '2026-06-15', '10:00', 'Scheduled', 2, 3, 'Routine annual inspection'),
(3, '2026-05-01', '09:00', 'Completed', 2, 3, 'Inspection completed. No issues found.'),
(4, '2025-12-01', '09:00', 'Overdue', 2, 3, 'Overdue - requires immediate attention'),
(5, '2026-07-01', '14:00', 'Scheduled', 2, 3, NULL);

INSERT INTO maintenance_logs (fire_extinguisher_id, inspector_id, action_taken, maintenance_date, issues_identified, notes_recommendations) VALUES
(6, 2, 'Replaced pressure gauge and refilled agent', '2026-05-15', 'Low pressure detected during routine check', 'Schedule follow-up inspection in 30 days'),
(3, 2, 'Routine service and pressure test', '2026-04-10', 'None - unit in good condition', 'Continue regular maintenance schedule'),
(4, 2, 'Hose replacement', '2026-03-20', 'Cracked hose detected', 'Unit now fully operational');
