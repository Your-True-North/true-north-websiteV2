import { NextResponse } from 'next/server'
import pkg from 'pg'

const { Client } = pkg

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    const result = await client.query(
      'SELECT COUNT(*) as count FROM founding_members'
    )

    const count = parseInt(result.rows[0]?.count || 0)

    await client.end()

    return NextResponse.json({
      count,
      remaining: Math.max(0, 30 - count),
      soldOut: count >= 30
    })
  } catch (error) {
    console.error('[Founding Count] Error:', error)
    try {
      await client.end()
    } catch {}

    return NextResponse.json(
      { count: 0, remaining: 30, soldOut: false },
      { status: 500 }
    )
  }
}
