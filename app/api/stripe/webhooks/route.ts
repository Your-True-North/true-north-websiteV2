import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'
import sgMail from '@sendgrid/mail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CIRCLE_TAG_ID = '8362450'

const CIRCLE_PRICE_IDS = [
  'price_1SN63oIEGgnmE0KKEM0Ihkvt',
  'price_1SPyrzIEGgnmE0KKi0J0hFuC',
  'price_1SPysGIEGgnmE0KKGjjUVAwP',
  'price_1SPysOIEGgnmE0KKgOZTTLf8',
]

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27' as any,
  })
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const buf = await request.arrayBuffer()
    const rawBody = Buffer.from(buf)
    const body = rawBody.toString('utf8')
    
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('[Stripe Webhook] No signature header found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event
    const stripe = getStripe()

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
      console.log('[Stripe Webhook] ✅ Signature verified:', event.type)
    } catch (err: any) {
      console.error('[Stripe Webhook] ❌ Signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id
      
      if (CIRCLE_PRICE_IDS.includes(priceId || '')) {
        let customerId = session.customer as string
        let email = session.customer_details?.email
        
        if (!customerId && email) {
          const customer = await stripe.customers.create({ email })
          customerId = customer.id
        }
        
        if (email && customerId) {
          const password = Math.random().toString(36).slice(-12) + 'A1!'
          const hashedPassword = await bcrypt.hash(password, 10)
          
          const client = new Client({ connectionString: process.env.DATABASE_URL })
          await client.connect()
          
          await client.query(
            \`INSERT INTO users (id, email, name, password, role, "stripeCustomerId", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             ON CONFLICT (email) DO UPDATE SET "stripeCustomerId" = $6, "isActive" = $7, "updatedAt" = NOW()\`,
            [customerId, email, email.split('@')[0], hashedPassword, 'founding_member', customerId, true]
          )
          
          if (CONVERTKIT_API_KEY) {
            await fetch(\`https://api.convertkit.com/v3/tags/\${CIRCLE_TAG_ID}/subscribe\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ api_key: CONVERTKIT_API_KEY, email })
            })
          }
          
          if (process.env.SENDGRID_API_KEY) {
            await sgMail.send({
              to: email,
              from: 'cor@yourtruenorth.me',
              subject: 'Welcome to Circle of Return',
              html: \`<h2>Welcome</h2><p>Email: \${email}</p><p>Password: \${password}</p><a href="https://yourtruenorth.me/members">Login</a>\`
            })
          }
          
          await client.end()
        }
      }
    }

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price?.id
      
      if (CIRCLE_PRICE_IDS.includes(priceId || '')) {
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        const email = customer.email
        
        if (email) {
          const password = Math.random().toString(36).slice(-12) + 'A1!'
          const hashedPassword = await bcrypt.hash(password, 10)
          
          const client = new Client({ connectionString: process.env.DATABASE_URL })
          await client.connect()
          
          await client.query(
            \`INSERT INTO users (id, email, name, password, role, "stripeCustomerId", "stripeSubscriptionId", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
             ON CONFLICT (email) DO UPDATE SET "stripeCustomerId" = $6, "stripeSubscriptionId" = $7, "isActive" = $8, "updatedAt" = NOW()\`,
            [subscription.customer, email, email.split('@')[0], hashedPassword, 'founding_member', subscription.customer, subscription.id, true]
          )
          
          if (CONVERTKIT_API_KEY) {
            await fetch(\`https://api.convertkit.com/v3/tags/\${CIRCLE_TAG_ID}/subscribe\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ api_key: CONVERTKIT_API_KEY, email })
            })
          }
          
          if (process.env.SENDGRID_API_KEY) {
            await sgMail.send({
              to: email,
              from: 'cor@yourtruenorth.me',
              subject: 'Welcome to Circle of Return',
              html: \`<h2>Welcome</h2><p>Email: \${email}</p><p>Password: \${password}</p><a href="https://yourtruenorth.me/members">Login</a>\`
            })
          }
          
          await client.end()
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const client = new Client({ connectionString: process.env.DATABASE_URL })
      await client.connect()
      await client.query(\`UPDATE users SET "isActive" = false, "updatedAt" = NOW() WHERE "stripeSubscriptionId" = $1\`, [subscription.id])
      await client.end()
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
