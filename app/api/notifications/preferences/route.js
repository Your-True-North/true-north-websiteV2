import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const result = await query(
      'SELECT community_email_notifications FROM users WHERE id::text = $1',
      [userId]
    )
    if (!result.rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const val = result.rows[0].community_email_notifications
    return NextResponse.json({ notifications: val === null || val === undefined ? true : val })
  } catch (error) {
    // Column may not exist yet — default to true
    return NextResponse.json({ notifications: true })
  }
}

export async function PATCH(request) {
  try {
    const { userId, notifications } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    await query(
      'UPDATE users SET community_email_notifications = $1 WHERE id::text = $2',
      [notifications, userId]
    )
    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
