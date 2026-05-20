import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request) {
  const authResult = requireAuth(request)
  if (authResult.error) return authResult.error

  const { userId } = authResult.user

  const result = await query(
    'SELECT "stripeCustomerId" FROM users WHERE id = $1',
    [userId]
  )

  const stripeCustomerId = result.rows[0]?.stripeCustomerId

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found for this member' },
      { status: 404 }
    )
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourtruenorth.me'}/members`,
  })

  return NextResponse.json({ url: session.url })
}
