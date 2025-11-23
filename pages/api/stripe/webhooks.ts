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

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

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
      console.log('[Stripe Webhook] Event type:', event.type)
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature failed:', err.message)
      return res.status(400).json({ error: 'Invalid signature' })
    }

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
          const client = new Client({ connectionString: DATABASE_URL })
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
              html: `<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h2 style="color: #111; margin-bottom: 24px;">Welcome to Circle of Return</h2>
                <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">Your account has been created. Where you are now does not have to be where you end up.</p>
                <div style="background: #f5f5f5; padding: 24px; border-radius: 6px; margin: 24px 0;">
                  <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">Your Login Credentials:</p>
                  <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 8px 0 0 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <a href="https://yourtruenorth.me/members" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0;">Access Circle of Return</a>
                <p style="color: #666; font-size: 14px; margin-top: 32px;">Change your password after first login.</p>
              </div>`
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
          const client = new Client({ connectionString: DATABASE_URL })
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
              html: `<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h2 style="color: #111; margin-bottom: 24px;">Welcome to Circle of Return</h2>
                <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">Your account has been created. Where you are now does not have to be where you end up.</p>
                <div style="background: #f5f5f5; padding: 24px; border-radius: 6px; margin: 24px 0;">
                  <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">Your Login Credentials:</p>
                  <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 8px 0 0 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <a href="https://yourtruenorth.me/members" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0;">Access Circle of Return</a>
                <p style="color: #666; font-size: 14px; margin-top: 32px;">Change your password after first login.</p>
              </div>`
            })
          }
          
          await client.end()
        }
      }
    }

    return res.json({ received: true })
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
