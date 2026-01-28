-- Migration 006: Add targetType and targetId columns to reactions and comments
-- This allows reactions and comments to work with different content types (videos, forum posts, etc.)
--
-- SAFETY: This migration ONLY adds columns. It does NOT:
--   - Drop any tables
--   - Delete any data
--   - Modify existing columns
--
-- Date: 2026-01-28

-- Add targetType column to reactions table (if it exists)
-- Values: 'video', 'post', 'comment', etc.
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS "targetType" VARCHAR(50);

-- Add targetId column to reactions table (if it exists)
-- This is a string to support both integer and cuid IDs
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS "targetId" VARCHAR(255);

-- Add targetType column to comments table (if it exists)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS "targetType" VARCHAR(50);

-- Add targetId column to comments table (if it exists)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS "targetId" VARCHAR(255);

-- Set default values for existing rows (video reactions/comments)
-- This preserves existing data by setting targetType='video' and copying videoId to targetId
UPDATE reactions SET "targetType" = 'video' WHERE "targetType" IS NULL AND "videoId" IS NOT NULL;
UPDATE reactions SET "targetId" = "videoId"::text WHERE "targetId" IS NULL AND "videoId" IS NOT NULL;

UPDATE comments SET "targetType" = 'video' WHERE "targetType" IS NULL AND "videoId" IS NOT NULL;
UPDATE comments SET "targetId" = "videoId"::text WHERE "targetId" IS NULL AND "videoId" IS NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments("targetType", "targetId");
