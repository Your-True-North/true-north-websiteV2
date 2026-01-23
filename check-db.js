const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'community_posts'
    `);
    console.log('Columns in community_posts:', result.rows.map(r => r.column_name));
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
