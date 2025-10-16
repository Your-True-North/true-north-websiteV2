const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway',
  ssl: { rejectUnauthorized: false }
});

async function fixTable() {
  try {
    await client.connect();
    console.log('Connected to database!');
    
    // Check current id column setup
    const checkResult = await client.query(`
      SELECT column_name, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id';
    `);
    
    console.log('Current ID column setup:', checkResult.rows[0]);
    
    // Create a sequence if it doesn't exist and set it as default
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS users_id_seq;
      ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
      ALTER SEQUENCE users_id_seq OWNED BY users.id;
      SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
    `);
    
    console.log('✅ Table fixed! ID column will now auto-generate.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixTable();
