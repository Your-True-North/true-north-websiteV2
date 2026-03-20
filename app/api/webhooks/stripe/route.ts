import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// NOTE: Add NEXT_PUBLIC_GA_API_SECRET to Vercel environment variables.
// Get it from: GA4 → Admin → Data Streams → your stream → Measurement Protocol API secrets.
const GA_MEASUREMENT_ID = 'G-C4DKTB8W13'
const GA_API_SECRET = process.env.NEXT_PUBLIC_GA_API_SECRET

// Pattern Audit detection
// Set PATTERN_AUDIT_PRICE_ID in Vercel to the Stripe price ID for the £37 Pattern Audit product.
const PATTERN_AUDIT_PRICE_ID = process.env.PATTERN_AUDIT_PRICE_ID

// Session price IDs for ConvertKit sequence enrollment
const BREATHWORK_PRICE_ID = 'price_1TCaOCIEGgnmE0KKRZIc0xZI'
const ENERGY_HEALING_PRICE_ID = 'price_1TCaPRIEGgnmE0KKY7gBuwzF'

// ConvertKit
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const PATTERN_AUDIT_TAG_ID = process.env.THE_PATTERN_AUDIT_TAG_ID
const BREATHWORK_SEQUENCE_ID = '17656423'
const ENERGY_HEALING_SEQUENCE_ID = '17656427'

// Resend
const resend = new Resend(process.env.RESEND_API_KEY)
const PATTERN_AUDIT_PAGE_URL = process.env.NEXT_PUBLIC_PATTERN_AUDIT_PAGE_URL || 'https://yourtruenorth.me/library/pattern-audit'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mason <mason@yourtruenorth.me>'

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

function applyConvertKitTag(email: string, firstName: string) {
  if (!CONVERTKIT_API_KEY || !PATTERN_AUDIT_TAG_ID) return
  fetch(`https://api.convertkit.com/v3/tags/${PATTERN_AUDIT_TAG_ID}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_secret: CONVERTKIT_API_KEY,
      email,
      first_name: firstName,
    }),
  }).catch((err) => console.error('[Stripe Webhook] ConvertKit tag failed:', err))
}

function sendPatternAuditEmail(email: string, firstName: string) {
  resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your Pattern Audit is ready',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Hey${firstName ? ` ${firstName}` : ''},</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Your Pattern Audit is ready.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">This is where we start — before the first session. Watch the video, then work through the workbook honestly. The more you put in here, the more precise we can be when we meet.</p>
        <a href="${PATTERN_AUDIT_PAGE_URL}" style="display: inline-block; padding: 14px 28px; background: #9bc4b8; color: #0a0a0a; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 15px;">Access the Pattern Audit</a>
        <p style="font-size: 13px; color: #666; margin-top: 32px; line-height: 1.6;">Take your time with it. There is no rush.</p>
        <p style="font-size: 13px; color: #666; margin-top: 8px;">Mason</p>
      </div>
    `,
  }).catch((err) => console.error('[Stripe Webhook] Resend email failed:', err))
}

async function getLineItemPriceIds(stripe: any, session: any): Promise<string[]> {
  try {
    const expanded = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    })
    return (expanded.line_items?.data ?? []).map((item: any) => item.price?.id).filter(Boolean)
  } catch (err) {
    console.error('[Stripe Webhook] Failed to fetch line items:', err)
    return []
  }
}

function subscribeToConvertKitSequence(email: string, firstName: string, sequenceId: string) {
  if (!CONVERTKIT_API_KEY) return
  fetch(`https://api.convertkit.com/v3/sequences/${sequenceId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_secret: CONVERTKIT_API_KEY,
      email,
      first_name: firstName,
    }),
  }).catch((err) => console.error(`[Stripe Webhook] ConvertKit sequence ${sequenceId} failed:`, err))
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: any

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

  try {
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

    const email = session.customer_details?.email
    const firstName = session.customer_details?.name?.split(' ')[0] || ''

    if (email) {
      const priceIds = await getLineItemPriceIds(stripe, session)

      if (PATTERN_AUDIT_PRICE_ID && priceIds.includes(PATTERN_AUDIT_PRICE_ID)) {
        console.log('[Stripe Webhook] Pattern Audit purchase detected for:', email)
        sendPatternAuditEmail(email, firstName)
        applyConvertKitTag(email, firstName)
      }

      if (priceIds.includes(BREATHWORK_PRICE_ID)) {
        console.log('[Stripe Webhook] Breathwork purchase detected for:', email)
        subscribeToConvertKitSequence(email, firstName, BREATHWORK_SEQUENCE_ID)
      }

      if (priceIds.includes(ENERGY_HEALING_PRICE_ID)) {
        console.log('[Stripe Webhook] Energy Healing purchase detected for:', email)
        subscribeToConvertKitSequence(email, firstName, ENERGY_HEALING_SEQUENCE_ID)
      }
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const amount = paymentIntent.amount ?? 0
    sendGA4Purchase(paymentIntent.id, amount)

    // Detect Calendly-originated session payments by amount
    // £120 (12000p) = Breathwork Journey, £90 (9000p) = Energy Healing Experience
    const email = paymentIntent.receipt_email || paymentIntent.customer_details?.email
    const firstName = ''

    if (email && amount === 12000) {
      console.log('[Stripe Webhook] Calendly Breathwork payment detected for:', email)
      subscribeToConvertKitSequence(email, firstName, BREATHWORK_SEQUENCE_ID)
    }

    if (email && amount === 9000) {
      console.log('[Stripe Webhook] Calendly Energy Healing payment detected for:', email)
      subscribeToConvertKitSequence(email, firstName, ENERGY_HEALING_SEQUENCE_ID)
    }
  }

  return NextResponse.json({ received: true })
}
