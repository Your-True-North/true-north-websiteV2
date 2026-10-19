import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const PLACES = ['home', 'car', 'work', 'elsewhere']

// The member always comes from the auth_token cookie, never from the request body.
function getMemberId(request: NextRequest): string | null {
  const user = getAuthUser(request) as { userId?: string | number } | null
  return user?.userId ? String(user.userId) : null
}

function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length === 0 || tz.length > 64) return false
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

// GET /api/session-rsvps?live_call_id=123 → his active RSVP for that session, or null
export async function GET(request: NextRequest) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const liveCallId = parseInt(new URL(request.url).searchParams.get('live_call_id') || '')
  if (!liveCallId) return NextResponse.json({ error: 'live_call_id required' }, { status: 400 })

  try {
    const result = await query(
      `SELECT live_call_id, place, timezone FROM session_rsvps
       WHERE user_id = $1 AND live_call_id = $2 AND cancelled_at IS NULL`,
      [memberId, liveCallId]
    )
    return NextResponse.json({ rsvp: result.rows[0] || null })
  } catch (error) {
    console.error('[RSVP] GET error:', error)
    return NextResponse.json({ error: 'Failed to load RSVP' }, { status: 500 })
  }
}

// POST { live_call_id, place, timezone } → saves his RSVP. Answering again after a
// cancel reuses the same row and keeps the reminder stamps, so no reminder goes twice.
export async function POST(request: NextRequest) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  try {
    const { live_call_id, place, timezone } = await request.json()
    const liveCallId = parseInt(live_call_id)

    if (!liveCallId || !PLACES.includes(place) || !isValidTimeZone(timezone)) {
      return NextResponse.json({ error: 'Invalid RSVP' }, { status: 400 })
    }

    // No RSVPs on sessions that have already started
    const call = await query(
      `SELECT id FROM live_calls WHERE id = $1 AND scheduled_date AT TIME ZONE 'UTC' > NOW()`,
      [liveCallId]
    )
    if (call.rows.length === 0) {
      return NextResponse.json({ error: 'This session has already started' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO session_rsvps (user_id, live_call_id, place, timezone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, live_call_id)
       DO UPDATE SET place = EXCLUDED.place, timezone = EXCLUDED.timezone, cancelled_at = NULL
       RETURNING live_call_id, place, timezone`,
      [memberId, liveCallId, place, timezone]
    )
    return NextResponse.json({ rsvp: result.rows[0] })
  } catch (error) {
    console.error('[RSVP] POST error:', error)
    return NextResponse.json({ error: 'Failed to save RSVP' }, { status: 500 })
  }
}

// DELETE { live_call_id } → cancels his RSVP ("Change my answer")
export async function DELETE(request: NextRequest) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  try {
    const { live_call_id } = await request.json()
    const liveCallId = parseInt(live_call_id)
    if (!liveCallId) return NextResponse.json({ error: 'live_call_id required' }, { status: 400 })

    await query(
      `UPDATE session_rsvps SET cancelled_at = NOW()
       WHERE user_id = $1 AND live_call_id = $2 AND cancelled_at IS NULL`,
      [memberId, liveCallId]
    )
    return NextResponse.json({ rsvp: null })
  } catch (error) {
    console.error('[RSVP] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to cancel RSVP' }, { status: 500 })
  }
}
