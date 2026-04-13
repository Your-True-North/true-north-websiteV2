import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    await query(
      `CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        url TEXT NOT NULL DEFAULT '/members',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    )
    const result = await query(
      'SELECT id, title, body, url, created_at FROM announcements ORDER BY created_at DESC LIMIT 1'
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ announcement: null })
    }
    return NextResponse.json({ announcement: result.rows[0] })
  } catch {
    return NextResponse.json({ announcement: null })
  }
}
