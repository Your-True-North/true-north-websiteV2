const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway',
  ssl: { rejectUnauthorized: false }
});

async function addAdmin() {
  try {
    await client.connect();
    console.log('Connected to database!');
    
    const result = await client.query(`
      INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
      VALUES (1, $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, name, role;
    `, [
      'Navigate@yourtruenorth.me',
      'True',
      '$2a$10$rH8E3pZ9vK2mN5wQ7xL4.OYjFgTcUdVeWfXgYhZiAjBkClDmEnFoG',
      'admin',
      true
    ]);
    
    console.log('✅ DONE! Your account is created.');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

addAdmin();
