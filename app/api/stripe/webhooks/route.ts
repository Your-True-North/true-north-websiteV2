import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import sgMail from '@sendgrid/mail'
import bcrypt from 'bcryptjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CIRCLE_TAG_ID = '8362450'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const CIRCLE_PRICE_IDS = [
  'price_1SN63oIEGgnmE0KKEM0Ihkvt', // £25/month
  'price_1S0gabIEGgnmE0KKGnWlJuWN', // £50/month
  'price_1SDftDIEGgnmE0KKgXK0B41e'  // £450/year
]

function generatePassword() {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
}

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
        const email = session.customer_email
        const password = generatePassword()
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user in database
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: dbError } = await supabase
          .from('users')
          .insert({
            email: email,
            password: hashedPassword,
            name: session.customer_details?.name || 'Circle Member',
            role: 'member',
            membership_status: 'active',
            created_at: new Date().toISOString()
          })

        if (dbError && !dbError.message.includes('duplicate')) {
          console.error('[Stripe Webhook] Database error:', dbError)
        }

        // Tag in ConvertKit
        await fetch(`https://api.convertkit.com/v3/tags/${CIRCLE_TAG_ID}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: CONVERTKIT_API_KEY,
            email: email
          })
        })

        // Send welcome email via Sendgrid
        const msg = {
          to: email,
          from: 'mason@yourtruenorth.me',
          subject: 'Welcome to Circle of Return',
          html: `
            <div style="background: #000; color: #fff; padding: 60px 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <h1 style="font-size: 48px; font-weight: 300; margin-bottom: 40px; letter-spacing: -1px;">The CoR</h1>
              
              <h2 style="font-size: 20px; font-weight: 300; margin-bottom: 60px; opacity: 0.7;">Welcome to Circle of Return</h2>
              
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 3px; padding: 40px; max-width: 500px; margin: 0 auto;">
                <p style="font-size: 16px; margin-bottom: 30px; opacity: 0.8;">Your login credentials:</p>
                
                <div style="text-align: left; margin: 0 auto; max-width: 300px;">
                  <p style="margin: 15px 0;"><strong>Email:</strong><br/>${email}</p>
                  <p style="margin: 15px 0;"><strong>Password:</strong><br/>${password}</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="display: inline-block; margin-top: 40px; padding: 15px 40px; background: #fff; color: #000; text-decoration: none; border-radius: 3px; font-weight: 500;">Access Members Area</a>
              </div>
              
              <p style="margin-top: 60px; font-size: 14px; opacity: 0.5;">See you inside,<br/>True North</p>
            </div>
          `
        }

        await sgMail.send(msg)

        console.log(`[Stripe Webhook] Created account and sent welcome email to ${email}`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
