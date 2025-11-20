import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import sgMail from '@sendgrid/mail'
import bcrypt from 'bcryptjs'
import { Client } from 'pg'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2024-11-20.acacia'
  })
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CIRCLE_TAG_ID = '8362450'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const CIRCLE_PRICE_IDS = [
  'price_1SN63oIEGgnmE0KKEM0Ihkvt',
  'price_1S0gabIEGgnmE0KKGnWlJuWN',
  'price_1SDftDIEGgnmE0KKgXK0B41e'
]

function generatePassword() {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event
    const stripe = getStripe()

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
        const email = session.customer_email
        const password = generatePassword()
        const hashedPassword = await bcrypt.hash(password, 10)
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        const client = new Client({
          connectionString: process.env.DATABASE_URL
        })

        try {
          await client.connect()

          await client.query(`
            INSERT INTO users (
              id,
              email,
              name,
              password,
              role,
              "stripeCustomerId",
              "stripeSubscriptionId",
              "isActive",
              "createdAt",
              "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            ON CONFLICT (email) 
            DO UPDATE SET
              "stripeCustomerId" = $6,
              "stripeSubscriptionId" = $7,
              "isActive" = $8,
              "updatedAt" = NOW()
          `, [
            customerId,
            email,
            session.customer_details?.name || 'Circle Member',
            hashedPassword,
            'member',
            customerId,
            subscriptionId,
            true
          ])

          console.log(`[Stripe Webhook] Created/updated user in Railway: ${email}`)

        } catch (dbError: any) {
          console.error('[Stripe Webhook] Database error:', dbError)
          throw dbError
        } finally {
          await client.end()
        }

        try {
          await fetch(`https://api.convertkit.com/v3/tags/${CIRCLE_TAG_ID}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: CONVERTKIT_API_KEY,
              email: email
            })
          })
          console.log(`[Stripe Webhook] Tagged in ConvertKit: ${email}`)
        } catch (ckError) {
          console.error('[Stripe Webhook] ConvertKit error:', ckError)
        }

        try {
          const msg = {
            to: email,
            from: 'callwithmason@gmail.com',
            subject: 'Welcome to Circle of Return',
            html: `
              <div style="background: #0a0a0b; color: #fff; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto;">
                  
                  <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 42px; font-weight: 300; margin-bottom: 20px; letter-spacing: -0.5px; line-height: 1.2;">Welcome to<br/>Circle of Return</h1>
                    <p style="font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.6); margin: 0;">You're not here by accident.</p>
                  </div>

                  <div style="margin-bottom: 40px;">
                    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 25px; color: rgba(255,255,255,0.85);">
                      You've just joined something rare - you are a founding member of a community built for those who are done with surface-level living and ready to return to who they really are beneath the noise and conditioning.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 25px; color: rgba(255,255,255,0.85);">
                      As a founder, you're not just joining something, but you're helping create it. Your questions, your challenges, your breakthroughs will shape the content, the live sessions, and the direction of this entire circle.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 25px; color: rgba(255,255,255,0.85);">
                      This means you'll get more live interaction with me than anyone who joins after you. You'll have direct input on where this goes. This is your transformation, our transformation and for those that step inside next.
                    </p>
                  </div>

                  <div style="background: rgba(155, 196, 184, 0.05); border: 1px solid rgba(155, 196, 184, 0.2); border-radius: 6px; padding: 35px; margin: 40px 0;">
                    <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; color: rgba(255,255,255,0.5); text-align: center;">Your Login Credentials</p>
                    
                    <div style="margin: 0 0 30px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                      <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9); font-family: 'Courier New', monospace;">\${email}</p>
                    </div>
                    
                    <div style="margin: 0 0 30px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
                      <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9); font-family: 'Courier New', monospace;">\${password}</p>
                    </div>
                    
                    <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 25px 0; line-height: 1.6;">You can change this password in your profile settings once you're inside.</p>
                    
                    <div style="text-align: center;">
                      <a href="\${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="display: inline-block; padding: 16px 45px; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Enter the Circle</a>
                    </div>
                  </div>

                  <div style="background: rgba(127, 176, 105, 0.05); border-left: 3px solid #7fb069; padding: 25px; margin: 40px 0;">
                    <p style="font-size: 15px; font-weight: 600; margin: 0 0 15px 0; color: #7fb069;">What's Next?</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; list-style: none;">
                      <li style="margin-bottom: 12px; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.8); position: relative; padding-left: 15px;">
                        <span style="position: absolute; left: 0; color: #7fb069;">→</span>
                        Log in and complete your profile
                      </li>
                      <li style="margin-bottom: 0; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.8); position: relative; padding-left: 15px;">
                        <span style="position: absolute; left: 0; color: #7fb069;">→</span>
                        Check the calendar in your members area for upcoming Onboarding (this is your first step) and you'll be guided from there.
                      </li>
                    </ul>
                  </div>

                  <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <p style="font-size: 15px; line-height: 1.7; margin-bottom: 20px; color: rgba(255,255,255,0.7); font-style: italic;">
                      "Where you are now does not have to be where you end up."
                    </p>
                    
                    <p style="font-size: 14px; color: rgba(255,255,255,0.5); margin: 0;">
                      See you inside,<br/>
                      <span style="font-weight: 500; color: rgba(255,255,255,0.7);">True North</span>
                    </p>
                  </div>
                  
                </div>
              </div>
            `
          }

          await sgMail.send(msg)
          console.log(`[Stripe Webhook] Sent welcome email to: ${email}`)
        } catch (emailError) {
          console.error('[Stripe Webhook] Sendgrid error:', emailError)
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const client = new Client({
        connectionString: process.env.DATABASE_URL
      })

      try {
        await client.connect()

        await client.query(`
          UPDATE users 
          SET "isActive" = false, "updatedAt" = NOW()
          WHERE "stripeCustomerId" = $1
        `, [customerId])

        console.log(`[Stripe Webhook] Deactivated user with customer ID: ${customerId}`)

      } catch (dbError) {
        console.error('[Stripe Webhook] Error deactivating user:', dbError)
      } finally {
        await client.end()
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const client = new Client({
        connectionString: process.env.DATABASE_URL
      })

      try {
        await client.connect()

        const result = await client.query(
          'SELECT email FROM users WHERE "stripeCustomerId" = $1',
          [customerId]
        )

        if (result.rows.length > 0) {
          const email = result.rows[0].email

          const msg = {
            to: email,
            from: 'callwithmason@gmail.com',
            subject: 'Payment Failed - Update Your Card',
            html: `
              <div style="background: #000; color: #fff; padding: 60px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <h1 style="font-size: 32px; font-weight: 300; margin-bottom: 30px;">Payment Failed</h1>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; opacity: 0.8;">
                  Your recent payment for Circle of Return couldn't be processed.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; opacity: 0.8;">
                  Update your payment method to keep your access:
                </p>
                
                <a href="https://billing.stripe.com/p/login/YOUR_PORTAL_ID" style="display: inline-block; margin: 30px 0; padding: 15px 40px; background: #fff; color: #000; text-decoration: none; border-radius: 3px; font-weight: 500;">Update Payment Method</a>
                
                <p style="font-size: 14px; line-height: 1.6; margin-top: 40px; opacity: 0.6;">
                  You have 7 days to update your payment before access is paused.
                </p>
                
                <p style="margin-top: 60px; font-size: 14px; opacity: 0.5;">- True North</p>
              </div>
            `
          }

          await sgMail.send(msg)
          console.log(`[Stripe Webhook] Sent payment failed email to: ${email}`)
        }

      } catch (error) {
        console.error('[Stripe Webhook] Error handling payment failure:', error)
      } finally {
        await client.end()
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
