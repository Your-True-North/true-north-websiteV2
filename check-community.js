const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'community_posts'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumns in community_posts table:');
    result.rows.forEach(r => {
      console.log(`  - ${r.column_name} (${r.data_type})`);
    });
    
    const hasUserId = result.rows.some(r => r.column_name === 'userId');
    console.log(`\nuserID column exists: ${hasUserId}`);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
