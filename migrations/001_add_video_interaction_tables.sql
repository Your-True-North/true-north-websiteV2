-- Migration: Add video interaction tables
-- Description: Creates tables for videos, comments, and reactions to replace localStorage

-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  youtubeurl VARCHAR(500) NOT NULL,
  category VARCHAR(50) NOT NULL,
  duration VARCHAR(20),
  published BOOLEAN DEFAULT true,
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published);
CREATE INDEX IF NOT EXISTS idx_videos_createdat ON videos(createdat DESC);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  videoid INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000),
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_videoid ON comments(videoid);
CREATE INDEX IF NOT EXISTS idx_comments_userid ON comments(userid);
CREATE INDEX IF NOT EXISTS idx_comments_createdat ON comments(createdat DESC);

-- ============================================================================
-- REACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  videoid INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'love', 'insightful')),
  createdat TIMESTAMP DEFAULT NOW(),
  UNIQUE(videoid, userid, type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_videoid ON reactions(videoid);
CREATE INDEX IF NOT EXISTS idx_reactions_userid ON reactions(userid);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(type);

-- ============================================================================
-- ACTIVITY LOG TABLE (for tracking user engagement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activitytype VARCHAR(50) NOT NULL,
  entitytype VARCHAR(50),
  entityid INTEGER,
  metadata JSONB,
  createdat TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_userid ON activity_log(userid);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(activitytype);
CREATE INDEX IF NOT EXISTS idx_activity_createdat ON activity_log(createdat DESC);

-- ============================================================================
-- ADD MISSING COLUMNS TO USERS TABLE (if they don't exist)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='photo') THEN
    ALTER TABLE users ADD COLUMN photo TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='level') THEN
    ALTER TABLE users ADD COLUMN level VARCHAR(50) DEFAULT 'Seeker';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='points') THEN
    ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- SEED DATA (optional - comment out if not needed)
-- ============================================================================
-- INSERT INTO videos (title, description, youtubeurl, category, duration, published) VALUES
-- ('Welcome to Your Journey', 'Introduction to the transformation process', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Foundation Work', '15 min', true),
-- ('Daily Breathwork Practice', 'Guided breathwork session for emotional release', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Breathwork Sessions', '30 min', true);
