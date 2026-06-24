import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) return authResult.error

    const { userId } = authResult.user

    // Get the user's id and email from the DB
    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [userId])
    const user = userResult.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    let customerId = null

    // For users who signed up via Stripe checkout, their DB id IS the Stripe customer id
    if (String(user.id).startsWith('cus_')) {
      customerId = user.id
    } else {
      // For manually-created members, search Stripe by email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 })
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe billing account found. If you believe this is an error please contact mason@yourtruenorth.me' },
        { status: 404 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourtruenorth.me'}/members`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('[Billing Portal] Error:', error)
    return NextResponse.json(
      { error: 'Could not open billing portal. Please contact mason@yourtruenorth.me' },
      { status: 500 }
    )
  }
}
