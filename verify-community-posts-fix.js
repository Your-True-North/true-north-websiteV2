const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verify() {
  const client = await pool.connect();

  try {
    console.log('\n🔍 Verifying community_posts table schema...\n');

    // Get all columns
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'community_posts'
      ORDER BY ordinal_position
    `);

    console.log('Columns in community_posts table:');
    console.log('─'.repeat(80));
    result.rows.forEach(r => {
      const nullable = r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = r.column_default ? ` DEFAULT ${r.column_default}` : '';
      console.log(`  ${r.column_name.padEnd(20)} ${r.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });
    console.log('─'.repeat(80));

    // Check specifically for userId (case-sensitive)
    const hasUserId = result.rows.some(r => r.column_name === 'userId');
    const hasUserIdSnake = result.rows.some(r => r.column_name === 'user_id');

    console.log('\n📊 Results:');
    console.log(`  ✓ "userId" (camelCase) exists: ${hasUserId ? '✅ YES' : '❌ NO'}`);
    console.log(`  ✓ "user_id" (snake_case) exists: ${hasUserIdSnake ? '⚠️  YES (should be removed)' : '✅ NO'}`);

    if (hasUserId && !hasUserIdSnake) {
      console.log('\n✅ SUCCESS: community_posts table is correctly configured!');
    } else if (hasUserIdSnake && !hasUserId) {
      console.log('\n❌ ERROR: Table still has user_id instead of userId. Run migration!');
    } else if (hasUserId && hasUserIdSnake) {
      console.log('\n⚠️  WARNING: Both userId and user_id exist. This may cause issues.');
    } else {
      console.log('\n❌ ERROR: Neither userId nor user_id exists!');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verify();
