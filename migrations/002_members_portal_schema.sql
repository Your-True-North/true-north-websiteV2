-- Circle of Return Members Portal Database Schema
-- Migration 002: Complete members portal tables

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_id VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  duration INTEGER,
  thumbnail_url VARCHAR(500),
  upload_date TIMESTAMP DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User progress on videos
CREATE TABLE IF NOT EXISTS user_video_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_watched TIMESTAMP,
  completion_date TIMESTAMP,
  watch_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Video comments
CREATE TABLE IF NOT EXISTS video_comments (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video reactions
CREATE TABLE IF NOT EXISTS video_reactions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- User milestones
CREATE TABLE IF NOT EXISTS user_milestones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  milestone_id VARCHAR(50) NOT NULL,
  milestone_title VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- Live calls
CREATE TABLE IF NOT EXISTS live_calls (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP NOT NULL,
  zoom_link VARCHAR(500),
  calendly_link VARCHAR(500),
  replay_youtube_id VARCHAR(50),
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call attendance
CREATE TABLE IF NOT EXISTS call_attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  call_id INTEGER NOT NULL,
  booked BOOLEAN DEFAULT FALSE,
  attended BOOLEAN DEFAULT FALSE,
  booked_at TIMESTAMP,
  attended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, call_id)
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category VARCHAR(50),
  title VARCHAR(255),
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 10000),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post replies
CREATE TABLE IF NOT EXISTS post_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Downloadable resources
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  category VARCHAR(50),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resource downloads tracking
CREATE TABLE IF NOT EXISTS resource_downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  resource_id INTEGER NOT NULL,
  downloaded_at TIMESTAMP DEFAULT NOW()
);

-- Practice tracking
CREATE TABLE IF NOT EXISTS practice_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  practice_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  reflection TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, practice_date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update users table with new fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'Seeker';
ALTER TABLE users ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_practice_date DATE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_video_progress_user ON user_video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_video_progress_video ON user_video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_video ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_reactions_video ON video_reactions(video_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_post_replies_post ON post_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_practice_entries_user ON practice_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_call_attendance_user ON call_attendance(user_id);
