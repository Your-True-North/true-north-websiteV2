import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'
import sgMail from '@sendgrid/mail'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
const CIRCLE_PRICE_IDS = [
  'price_1SN63oIEGgnmE0KKEM0Ihkvt',
  'price_1SPyrzIEGgnmE0KKi0J0hFuC',
  'price_1SPysGIEGgnmE0KKGjjUVAwP',
  'price_1SPysOIEGgnmE0KKgOZTTLf8',
]

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const buf = await getRawBody(req)
    const sig = req.headers['stripe-signature'] as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET)
    } catch (err: any) {
      console.error('Signature failed:', err.message)
      return res.status(400).json({ error: 'Invalid signature' })
    }

    console.log('Event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id
      
      if (CIRCLE_PRICE_IDS.includes(priceId || '')) {
        const email = session.customer_details?.email
        const customerId = session.customer as string
        
        if (email && customerId) {
          const password = Math.random().toString(36).slice(-12) + 'A1!'
          const hashedPassword = await bcrypt.hash(password, 10)
          const client = new Client({ connectionString: process.env.DATABASE_URL })
          await client.connect()
          
          await client.query(
            'INSERT INTO users (id, email, name, password, role, "stripeCustomerId", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "stripeCustomerId" = $6, "isActive" = $7, "updatedAt" = NOW()',
            [customerId, email, email.split('@')[0], hashedPassword, 'founding_member', customerId, true]
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

    return res.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
