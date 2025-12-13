import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    // Try to get founding members from founding_members table with JOIN
    // If that fails, fall back to users with is_founding flag
    let result
    try {
      result = await client.query(`
        SELECT
          fm.signup_number,
          fm.signup_date,
          fm.stripe_customer_id,
          fm.stripe_subscription_id,
          u.name,
          u.email,
          u.subscription_status,
          u.last_login
        FROM founding_members fm
        JOIN users u ON fm.user_id = u.id
        ORDER BY fm.signup_number ASC
      `)
    } catch (joinError) {
      // If JOIN fails (table doesn't exist or no data), try getting users with founding flag
      console.log('[Admin Founding] JOIN query failed, trying fallback:', joinError.message)
      result = await client.query(`
        SELECT
          ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as signup_number,
          "createdAt" as signup_date,
          "stripeCustomerId" as stripe_customer_id,
          NULL as stripe_subscription_id,
          name,
          email,
          subscription_status,
          "lastLogin" as last_login
        FROM users
        WHERE is_founding = true OR role = 'founding'
        ORDER BY "createdAt" ASC
      `)
    }

    await client.end()

    return NextResponse.json({
      members: result.rows,
      total: result.rows.length,
      capacity: 30,
      remaining: Math.max(0, 30 - result.rows.length)
    })
  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Admin Founding] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch founding members', details: error.message },
      { status: 500 }
    )
  }
}
