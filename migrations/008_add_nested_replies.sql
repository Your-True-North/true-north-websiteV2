-- Add parent_reply_id to support nested/threaded replies
ALTER TABLE post_replies ADD COLUMN IF NOT EXISTS parent_reply_id INTEGER DEFAULT NULL;

ALTER TABLE post_replies ADD CONSTRAINT post_replies_parent_fkey
  FOREIGN KEY (parent_reply_id) REFERENCES post_replies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_post_replies_parent_id ON post_replies(parent_reply_id);
