import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

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

// Circle of Resonance membership
const COR_PRICE_ID = 'price_1S0gabLEGgnmE0KKGnWlJuWN'
const COR_TAG_ID = '8362450'
const COR_ABANDONED_TAG_ID = '17879543'

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

function applyConvertKitTagById(email: string, firstName: string, tagId: string) {
  if (!CONVERTKIT_API_KEY) return
  fetch(`https://api.convertkit.com/v3/tags/${tagId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_secret: CONVERTKIT_API_KEY, email, first_name: firstName }),
  }).catch((err) => console.error(`[Stripe Webhook] ConvertKit tag ${tagId} failed:`, err))
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

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$'
  let pwd = ''
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

async function createCorMember(email: string, name: string, stripeCustomerId: string): Promise<string | null> {
  try {
    const password = generatePassword()
    const hashed = await bcrypt.hash(password, 10)
    const id = stripeCustomerId || `cor_${Date.now()}`

    const result = await query(
      `INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'member', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         "isActive" = true,
         "updatedAt" = NOW()
       RETURNING (xmax = 0) AS inserted`,
      [id, email, name || email.split('@')[0], hashed]
    )

    const wasInserted = result.rows[0]?.inserted
    if (wasInserted) {
      console.log('[Stripe Webhook] ✅ New CoR member account created for:', email)
      return password
    } else {
      console.log('[Stripe Webhook] ✅ Existing member account reactivated for:', email)
      return null // account already exists — do not send credentials email
    }
  } catch (err) {
    console.error('[Stripe Webhook] ❌ Failed to create CoR member account:', err)
    return null
  }
}

function sendCorWelcomeEmail(email: string, firstName: string, password: string): void {
  resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "You're in — here's how to access the Circle",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Brother, you're in.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Your founding membership is confirmed and your place in the Circle is secured.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 8px;">Log in here: <a href="https://yourtruenorth.me/auth/login" style="color: #9bc4b8;">yourtruenorth.me/auth/login</a></p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 4px;">Email: ${email}</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">Password: <strong>${password}</strong></p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">The Circle comes alive on April 10th. Before then, log in, explore the platform and get familiar with the space. There is already content waiting for you and more will be added as we build this together.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">You will hear from me before the 10th with everything you need to know.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 8px;">You made the right call.</p>
        <p style="font-size: 15px; line-height: 1.7;">True North</p>
      </div>
    `,
  }).then(() => {
    console.log('[Stripe Webhook] ✅ CoR welcome email sent to:', email)
  }).catch((err) => console.error('[Stripe Webhook] ❌ CoR welcome email failed:', err))
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

      const isCorPurchase =
        priceIds.includes(COR_PRICE_ID) ||
        (priceIds.length === 0 && session.mode === 'subscription' && (session.amount_total === 2500 || session.amount_subtotal === 2500))

      if (isCorPurchase) {
        console.log('[Stripe Webhook] CoR membership purchase detected for:', email, '| priceIds:', priceIds, '| mode:', session.mode, '| amount:', session.amount_total)
        applyConvertKitTagById(email, firstName, COR_TAG_ID)
        applyConvertKitTagById(email, firstName, '12084779')
        console.log('[Stripe Webhook] ✅ CoR ConvertKit tags applied for:', email)
        subscribeToConvertKitSequence(email, firstName, '2539333')
        console.log('[Stripe Webhook] ✅ CoR ConvertKit sequence enrolled for:', email)
        const tempPassword = await createCorMember(email, firstName, session.customer as string)
        if (tempPassword) {
          sendCorWelcomeEmail(email, firstName, tempPassword)
        }
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

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    const email = session.customer_details?.email
    const firstName = session.customer_details?.name?.split(' ')[0] || ''

    if (email) {
      const priceIds = await getLineItemPriceIds(stripe, session)
      if (priceIds.includes(COR_PRICE_ID)) {
        console.log('[Stripe Webhook] CoR abandoned cart detected for:', email)
        applyConvertKitTagById(email, firstName, COR_ABANDONED_TAG_ID)
      }
    }
  }

  return NextResponse.json({ received: true })
}
