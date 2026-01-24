import { Client } from 'pg';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Security: require secret key
  if (secret !== 'fix-community-posts-userId-2026') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const steps = [];
    steps.push('Starting migration: Rename user_id to "userId" in community_posts');

    // Check if userId column already exists (case-sensitive)
    const checkUserId = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'userId'
    `);

    if (checkUserId.rows.length > 0) {
      steps.push('✅ Column "userId" already exists - migration not needed');
      return Response.json({
        success: true,
        message: 'Migration already completed',
        steps
      });
    }

    // Check if user_id exists
    const checkUserIdSnake = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'user_id'
    `);

    if (checkUserIdSnake.rows.length > 0) {
      steps.push('Found user_id column, renaming to "userId"...');

      // Rename the column from user_id to "userId" (preserving case with quotes)
      await client.query(`
        ALTER TABLE community_posts
        RENAME COLUMN user_id TO "userId"
      `);

      steps.push('✅ Successfully renamed user_id to "userId"');
    } else {
      // Neither exists, create the column
      steps.push('Creating "userId" column...');

      await client.query(`
        ALTER TABLE community_posts
        ADD COLUMN "userId" INTEGER NOT NULL
      `);

      steps.push('✅ Successfully created "userId" column');
    }

    // Verify the column exists with correct name
    const verify = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      AND column_name = 'userId'
    `);

    if (verify.rows.length > 0) {
      steps.push('✅ Verification successful: "userId" column exists');
    } else {
      throw new Error('Verification failed: "userId" column not found after migration');
    }

    return Response.json({
      success: true,
      message: 'Migration completed successfully',
      steps
    });

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  } finally {
    await client.end();
  }
}
