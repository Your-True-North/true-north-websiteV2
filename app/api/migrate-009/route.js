import { Client } from 'pg'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== 'run-009') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const steps = []

  try {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS community_email_notifications BOOLEAN DEFAULT TRUE
    `)
    steps.push('✅ community_email_notifications column added')

    await client.query(`
      CREATE TABLE IF NOT EXISTS muted_post_notifications (
        user_id TEXT NOT NULL,
        post_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id)
      )
    `)
    steps.push('✅ muted_post_notifications table created')

    return Response.json({ success: true, steps })
  } catch (error) {
    return Response.json({ error: error.message, steps }, { status: 500 })
  } finally {
    await client.end()
  }
}
