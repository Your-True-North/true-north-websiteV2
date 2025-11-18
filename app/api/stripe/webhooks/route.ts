import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CIRCLE_TAG_ID = '8362450'

// Circle of Return price IDs
const CIRCLE_PRICE_IDS = [
  'price_1SN63oIEGgnmE0KKEM0Ihkvt', // £25/month
  'price_1S0gabIEGgnmE0KKGnWlJuWN', // £50/month
  'price_1SDftDIEGgnmE0KKgXK0B41e'  // £450/year
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const isCirclePayment = lineItems.data.some(item => 
        CIRCLE_PRICE_IDS.includes(item.price?.id || '')
      )

      if (isCirclePayment && session.customer_email) {
        await fetch(`https://api.convertkit.com/v3/tags/${CIRCLE_TAG_ID}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: CONVERTKIT_API_KEY,
            email: session.customer_email
          })
        })

        console.log(`[Stripe Webhook] Tagged ${session.customer_email} as Circle member`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
