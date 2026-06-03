ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS scheduled_by_user_id INTEGER REFERENCES users(id);

UPDATE inspections
SET scheduled_by_user_id = COALESCE(
    scheduled_by_user_id,
    (
        SELECT id
        FROM users
        ORDER BY CASE role WHEN 'user' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, id
        LIMIT 1
    )
)
WHERE scheduled_by_user_id IS NULL;

ALTER TABLE inspections
ALTER COLUMN scheduled_by_user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_by ON inspections(scheduled_by_user_id);
