const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway',
  ssl: { rejectUnauthorized: false }
});

async function updatePassword() {
  try {
    await client.connect();
    
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      ['$2b$10$s/GoUitfhJT5Nth4nZA3qeFeCZMPLIO/mhXBjU/2h9bfoVsU9k8M6', 'Navigate@yourtruenorth.me']
    );
    
    console.log('✅ Password updated!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

updatePassword();
