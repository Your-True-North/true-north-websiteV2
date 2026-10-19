CREATE TABLE IF NOT EXISTS session_rsvps (
  id                     SERIAL PRIMARY KEY,
  user_id                TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  live_call_id           INTEGER NOT NULL REFERENCES live_calls(id) ON DELETE CASCADE,
  place                  TEXT    NOT NULL CHECK (place IN ('home', 'car', 'work', 'elsewhere')),
  timezone               TEXT    NOT NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at           TIMESTAMPTZ,
  reminder_day_sent_at   TIMESTAMPTZ,
  reminder_hour_sent_at  TIMESTAMPTZ,
  CONSTRAINT session_rsvps_user_call_unique UNIQUE (user_id, live_call_id)
);

CREATE INDEX IF NOT EXISTS session_rsvps_call_active_idx
  ON session_rsvps (live_call_id) WHERE cancelled_at IS NULL;
