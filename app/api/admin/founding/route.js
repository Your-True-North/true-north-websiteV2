import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request) {
  try {
    const authResult = requireAuth(request, { requiredRole: 'admin' })
    if (authResult.error) {
      return authResult.error
    }

    // Get all founding members with user details
    const result = await query(`
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

    return NextResponse.json({
      members: result.rows,
      total: result.rows.length,
      capacity: 30,
      remaining: Math.max(0, 30 - result.rows.length)
    })
  } catch (error) {
    console.error('[Admin Founding] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch founding members' },
      { status: 500 }
    )
  }
}
