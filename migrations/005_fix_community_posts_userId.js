const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: Rename user_id to "userId" in community_posts');

    // Check if userId column already exists (case-sensitive)
    const checkUserId = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'userId'
    `);

    if (checkUserId.rows.length > 0) {
      console.log('✅ Column "userId" already exists - migration not needed');
      return;
    }

    // Check if user_id exists
    const checkUserIdSnake = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'user_id'
    `);

    if (checkUserIdSnake.rows.length > 0) {
      console.log('Found user_id column, renaming to "userId"...');

      // Rename the column from user_id to "userId" (preserving case with quotes)
      await client.query(`
        ALTER TABLE community_posts
        RENAME COLUMN user_id TO "userId"
      `);

      console.log('✅ Successfully renamed user_id to "userId"');
    } else {
      // Neither exists, create the column
      console.log('Creating "userId" column...');

      await client.query(`
        ALTER TABLE community_posts
        ADD COLUMN "userId" INTEGER NOT NULL
      `);

      console.log('✅ Successfully created "userId" column');
    }

    // Verify the column exists with correct name
    const verify = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'userId'
    `);

    if (verify.rows.length > 0) {
      console.log('✅ Verification successful: "userId" column exists');
    } else {
      throw new Error('Verification failed: "userId" column not found after migration');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
