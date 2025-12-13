import { Client } from 'pg';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'run-migration-004') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const migration = `
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

    await client.query(migration);

    return Response.json({ 
      success: true, 
      message: 'Migration 004 completed' 
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  } finally {
    await client.end();
  }
}
