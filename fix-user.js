const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway',
  ssl: { rejectUnauthorized: false }
});

async function fixUser() {
  try {
    await client.connect();
    console.log('Connected!');
    
    // Delete the existing user
    await client.query('DELETE FROM users WHERE email = $1', ['Navigate@yourtruenorth.me']);
    
    // Create new hash
    const hashedPassword = await bcrypt.hash('TrueNorth2025!', 10);
    console.log('New hash created:', hashedPassword);
    
    // Insert with new hash
    const result = await client.query(`
      INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
      VALUES (1, $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, name, role;
    `, [
      'Navigate@yourtruenorth.me',
      'True',
      hashedPassword,
      'admin',
      true
    ]);
    
    console.log('✅ Account recreated!');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixUser();
