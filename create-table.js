const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway',
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE user_video_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        video_id VARCHAR NOT NULL,
        completed BOOLEAN DEFAULT false,
        last_watched TIMESTAMP,
        watch_time INTEGER DEFAULT 0,
        completion_date TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, video_id)
      );
    `);
    console.log('Table created successfully!');
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    await client.end();
  }
}

createTable();
