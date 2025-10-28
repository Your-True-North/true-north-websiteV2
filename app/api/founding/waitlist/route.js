import { NextResponse } from 'next/server'
import pkg from 'pg'

const { Client } = pkg

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    const { email, name } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    await client.connect()

    // Insert into waitlist (ignore duplicates)
    await client.query(`
      INSERT INTO founding_waitlist (email, name, joined_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (email) DO NOTHING
    `, [email.toLowerCase().trim(), name || null])

    await client.end()

    return NextResponse.json({
      success: true,
      message: 'Added to waitlist'
    })
  } catch (error) {
    console.error('[Waitlist] Error:', error)
    try {
      await client.end()
    } catch {}

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
