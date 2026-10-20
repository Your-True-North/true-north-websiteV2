-- Member courses: day content, who started which course, and ticked off days.
CREATE TABLE IF NOT EXISTS course_days (
  id          SERIAL PRIMARY KEY,
  course      TEXT    NOT NULL CHECK (course IN ('short-fuse', 'space')),
  day         INTEGER NOT NULL CHECK (day BETWEEN 1 AND 14),
  title       TEXT    NOT NULL DEFAULT '',
  body        TEXT    NOT NULL DEFAULT '',
  video_id    TEXT    REFERENCES videos(id) ON DELETE SET NULL,
  pdf_url     TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_days_course_day_unique UNIQUE (course, day)
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course      TEXT    NOT NULL CHECK (course IN ('short-fuse', 'space')),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_enrollments_unique UNIQUE (user_id, course)
);

CREATE TABLE IF NOT EXISTS course_progress (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course        TEXT    NOT NULL CHECK (course IN ('short-fuse', 'space')),
  day           INTEGER NOT NULL CHECK (day BETWEEN 1 AND 14),
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_progress_unique UNIQUE (user_id, course, day)
);
