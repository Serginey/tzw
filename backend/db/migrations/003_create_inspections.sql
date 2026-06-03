CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    fire_extinguisher_id INTEGER NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Overdue', 'Cancelled')),
    inspector_id INTEGER NOT NULL REFERENCES users(id),
    scheduled_by_user_id INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_date ON inspections(scheduled_date);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_scheduled_by ON inspections(scheduled_by_user_id);
CREATE INDEX idx_inspections_extinguisher ON inspections(fire_extinguisher_id);
