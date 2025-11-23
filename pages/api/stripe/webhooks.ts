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
      console.log('[Stripe Webhook] Checkout session completed - no action for one-time purchases yet')
      return res.json({ received: true })
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
              html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Circle of Return</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <h1 style="margin: 0; color: #111111; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Welcome to Circle of Return</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">Your account has been created. Where you are now does not have to be where you end up.</p>
              <table role="presentation" style="width: 100%; background: #f8f8f8; border-radius: 6px; margin: 32px 0;">
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 20px; color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</p>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Email</p>
                          <p style="margin: 4px 0 0; color: #111111; font-size: 16px; font-weight: 500;">${email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Password</p>
                          <p style="margin: 4px 0 0; color: #111111; font-size: 16px; font-weight: 500; font-family: 'Courier New', monospace;">${password}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://yourtruenorth.me/members" style="display: inline-block; padding: 16px 48px; background: #111111; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500; letter-spacing: 0.3px;">Access Circle of Return</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; background: #fff9e6; border-left: 3px solid #ffcc00; margin: 32px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #8b7500; font-size: 14px; line-height: 1.5;"><strong>Important:</strong> Please change your password after your first login for security.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #f0f0f0; background: #fafafa; border-radius: 0 0 6px 6px;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">True North Spiritual Transformation Coaching</p>
              <p style="margin: 0; color: #999999; font-size: 12px;">You're receiving this because you subscribed to Circle of Return</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
              trackingSettings: {
                clickTracking: { enable: true },
                openTracking: { enable: true }
              }
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
