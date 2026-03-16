import { NextRequest, NextResponse } from 'next/server'

// NOTE: Add NEXT_PUBLIC_GA_API_SECRET to Vercel environment variables.
// Get it from: GA4 → Admin → Data Streams → your stream → Measurement Protocol API secrets.
const GA_MEASUREMENT_ID = 'G-C4DKTB8W13'
const GA_API_SECRET = process.env.NEXT_PUBLIC_GA_API_SECRET

function sendGA4Purchase(transactionId: string, value: number) {
  if (!GA_API_SECRET) return
  // Fire-and-forget — do not await
  fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: transactionId,
        events: [
          {
            name: 'purchase',
            params: {
              transaction_id: transactionId,
              value: value / 100, // Stripe amounts are in pence
              currency: 'GBP',
            },
          },
        ],
      }),
    }
  ).catch(() => {
    // Silently ignore — never block the webhook response
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: any

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body)
    }
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const transactionId = session.payment_intent || session.id
    const value = session.amount_total ?? 0
    sendGA4Purchase(transactionId, value)
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    sendGA4Purchase(paymentIntent.id, paymentIntent.amount ?? 0)
  }

  return NextResponse.json({ received: true })
}
