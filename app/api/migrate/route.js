import { Client } from 'pg';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'run-migration-005') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const steps = [];

    // Migration 004 (existing)
    steps.push('Running migration 004...');
    const migration004 = `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member';

      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, "userId")
      );

      CREATE TABLE IF NOT EXISTS reply_likes (
        id SERIAL PRIMARY KEY,
        reply_id INTEGER REFERENCES post_replies(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(reply_id, "userId")
      );

      ALTER TABLE videos ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

      CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes("userId");
      CREATE INDEX IF NOT EXISTS idx_reply_likes_reply ON reply_likes(reply_id);
      CREATE INDEX IF NOT EXISTS idx_reply_likes_user ON reply_likes("userId");
    `;

    await client.query(migration004);
    steps.push('✅ Migration 004 completed');

    // Migration 005 (fix userId columns in community tables)
    steps.push('Running migration 005: Fix userId columns in community_posts and post_replies...');

    // Fix community_posts table
    const checkPostsUserId = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'userId'
    `);

    if (checkPostsUserId.rows.length > 0) {
      steps.push('✅ community_posts."userId" already exists');
    } else {
      const checkPostsSnake = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'community_posts'
        AND column_name = 'user_id'
      `);

      if (checkPostsSnake.rows.length > 0) {
        steps.push('Renaming community_posts.user_id to "userId"...');
        await client.query(`
          ALTER TABLE community_posts
          RENAME COLUMN user_id TO "userId"
        `);
        steps.push('✅ Successfully renamed community_posts.user_id to "userId"');
      }
    }

    // Fix post_replies table
    const checkRepliesUserId = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'post_replies'
      AND column_name = 'userId'
    `);

    if (checkRepliesUserId.rows.length > 0) {
      steps.push('✅ post_replies."userId" already exists');
    } else {
      const checkRepliesSnake = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'post_replies'
        AND column_name = 'user_id'
      `);

      if (checkRepliesSnake.rows.length > 0) {
        steps.push('Renaming post_replies.user_id to "userId"...');
        await client.query(`
          ALTER TABLE post_replies
          RENAME COLUMN user_id TO "userId"
        `);
        steps.push('✅ Successfully renamed post_replies.user_id to "userId"');
      }
    }

    // Verify both fixes
    const verifyPosts = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'userId'
    `);

    const verifyReplies = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'post_replies'
      AND column_name = 'userId'
    `);

    if (verifyPosts.rows.length > 0 && verifyReplies.rows.length > 0) {
      steps.push('✅ Verification successful: Both tables have "userId" column');
    } else {
      if (verifyPosts.rows.length === 0) {
        steps.push('⚠️ WARNING: community_posts."userId" not found after migration');
      }
      if (verifyReplies.rows.length === 0) {
        steps.push('⚠️ WARNING: post_replies."userId" not found after migration');
      }
    }

    return Response.json({
      success: true,
      message: 'Migrations 004 & 005 completed',
      steps
    });

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    await client.end();
  }
}
