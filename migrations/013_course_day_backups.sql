-- Copy of each course day as it was before a "Pull from ConvertKit" save overwrote it.
-- Nothing reads this table; it is there so no text is ever lost.
CREATE TABLE IF NOT EXISTS course_day_backups (
  id               SERIAL PRIMARY KEY,
  course           TEXT        NOT NULL,
  day              INTEGER     NOT NULL,
  title            TEXT        NOT NULL,
  body             TEXT        NOT NULL,
  video_id         TEXT,
  pdf_url          TEXT,
  was_updated_at   TIMESTAMPTZ,
  backed_up_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backed_up_by     TEXT
);

CREATE INDEX IF NOT EXISTS course_day_backups_course_day ON course_day_backups (course, day, backed_up_at DESC);
