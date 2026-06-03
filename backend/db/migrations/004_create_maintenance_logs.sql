CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    fire_extinguisher_id INTEGER NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    inspector_id INTEGER NOT NULL REFERENCES users(id),
    action_taken TEXT NOT NULL,
    maintenance_date DATE NOT NULL,
    issues_identified TEXT NOT NULL,
    notes_recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_maintenance_date_not_future CHECK (maintenance_date <= CURRENT_DATE)
);

CREATE INDEX idx_maintenance_date ON maintenance_logs(maintenance_date);
CREATE INDEX idx_maintenance_extinguisher ON maintenance_logs(fire_extinguisher_id);
CREATE INDEX idx_maintenance_inspector ON maintenance_logs(inspector_id);
