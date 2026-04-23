import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, email, name, subscribed_at, unsubscribed, tags
       FROM anger_campaign_subscribers
       ORDER BY subscribed_at DESC`
    )
    return NextResponse.json({ subscribers: result.rows })
  } catch (err) {
    console.error('GET subscribers error:', err)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, tags } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const result = await query(
      `INSERT INTO anger_campaign_subscribers (email, name, tags)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = $2, tags = $3, unsubscribed = false
       RETURNING *`,
      [email.toLowerCase().trim(), name || '', tags || '']
    )
    return NextResponse.json({ subscriber: result.rows[0] })
  } catch (err) {
    console.error('POST subscriber error:', err)
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    await query(
      `UPDATE anger_campaign_subscribers SET unsubscribed = true WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE subscriber error:', err)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
