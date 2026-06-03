CREATE TABLE fire_extinguishers (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Water', 'CO2', 'Foam', 'Dry Chemical')),
    size VARCHAR(20) NOT NULL CHECK (size IN ('1.5 lb', '5 lb', '9 lb', '12 lb')),
    installation_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Under Maintenance', 'Decommissioned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_expiry_after_installation CHECK (expiry_date > installation_date)
);

CREATE INDEX idx_extinguishers_status ON fire_extinguishers(status);
CREATE INDEX idx_extinguishers_serial ON fire_extinguishers(serial_number);
CREATE INDEX idx_extinguishers_expiry ON fire_extinguishers(expiry_date);
