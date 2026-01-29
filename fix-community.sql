ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE community_posts ADD CONSTRAINT IF NOT EXISTS community_posts_userId_fkey 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
