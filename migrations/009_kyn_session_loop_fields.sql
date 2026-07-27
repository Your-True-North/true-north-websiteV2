-- Migration 009: extend live_calls to carry the KYN evergreen session loop

ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS theme_number INTEGER;
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS theme_name VARCHAR(100);
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS week_number INTEGER;
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS session_type VARCHAR(20);
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS delivery VARCHAR(20);
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS loop_index INTEGER;
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS recording BOOLEAN DEFAULT TRUE;
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS agenda JSONB;
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS camera_note VARCHAR(255);
ALTER TABLE live_calls ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP DEFAULT NULL;

-- Idempotent upsert key: same loop position can recur every 48 weeks, so the pair must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_calls_loop_index_scheduled_date ON live_calls(loop_index, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_live_calls_scheduled_date ON live_calls(scheduled_date);
