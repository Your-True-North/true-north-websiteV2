import { Pool } from 'pg'

let pool = null

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000,
    })

    pool.on('error', (err) => {
      // Handle pool errors to prevent crashes
      console.error('[DB Pool] Unexpected error on idle client', err)
    })
  }

  return pool
}

export async function query(text, params) {
  const pool = getPool()
  const start = Date.now()

  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start

    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production' && duration > 1000) {
      console.warn(`[DB] Slow query (${duration}ms):`, text.substring(0, 100))
    }

    return res
  } catch (error) {
    console.error('[DB] Query error:', error.message)
    throw error
  }
}

export async function getClient() {
  const pool = getPool()
  return await pool.connect()
}
