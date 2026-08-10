import { NextResponse } from 'next/server'

// Creates a Stripe Checkout Session for the interval chosen in PricingToggle.
//
// The marketing pages previously sent people to a fixed Stripe payment link,
// which cannot carry a price ID. A session is created here instead so the
// monthly or yearly price is selected server side.
//
// Required environment variables:
//   STRIPE_SECRET_KEY     already set
//   STRIPE_PRICE_MONTHLY  price ID for the monthly plan
//   STRIPE_PRICE_YEARLY   price ID for the yearly plan

export async function POST(request: Request) {
  try {
    const { interval } = await request.json()

    if (interval !== 'monthly' && interval !== 'yearly') {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
    }

    const priceId =
      interval === 'yearly'
        ? process.env.STRIPE_PRICE_YEARLY
        : process.env.STRIPE_PRICE_MONTHLY

    if (!priceId) {
      console.error(
        `[checkout] Missing ${interval === 'yearly' ? 'STRIPE_PRICE_YEARLY' : 'STRIPE_PRICE_MONTHLY'}`
      )
      return NextResponse.json({ error: 'Pricing is not configured' }, { status: 500 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[checkout] Missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Pricing is not configured' }, { status: 500 })
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://yourtruenorth.me'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/auth/register?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/founding?checkout=cancelled`,
      metadata: { interval },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] Failed to create session:', error?.message || error)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}
