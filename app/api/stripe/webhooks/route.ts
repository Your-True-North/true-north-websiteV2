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

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  
  let event: Stripe.Event
  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Signature verification failed:', err.message)
    return new NextResponse('Webhook Error', { status: 400 })
  }

  console.log('Event type:', event.type)

  try {
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
            'INSERT INTO users (id, email, name, password, role, "stripeCustomerId", "stripeSubscriptionId", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "stripeCustomerId" = $6, "stripeSubscriptionId" = $7, "isActive" = $8, "updatedAt" = NOW()',
            [subscription.customer, email, email.split('@')[0], hashedPassword, 'founding_member', subscription.customer, subscription.id, true]
          )
          
          if (process.env.SENDGRID_API_KEY) {
            await sgMail.send({
              to: email,
              from: 'cor@yourtruenorth.me',
              subject: 'Welcome to Circle of Return',
              text: 'Email: ' + email + ' Password: ' + password + ' Login: https://yourtruenorth.me/members'
            })
          }
          
          await client.end()
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}
