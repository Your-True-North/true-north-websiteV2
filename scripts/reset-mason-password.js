const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function reset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const newPass = 'Mason2024Temp!';
    const hashed = await bcrypt.hash(newPass, 10);
    
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashed, 'navigate@yourtruenorth.me']
    );
    
    console.log('Password reset to: Mason2024Temp!');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

reset();
