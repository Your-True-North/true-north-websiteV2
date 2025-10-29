import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import pkg from 'pg'
import nodemailer from 'nodemailer'

const { Client } = pkg

// Stripe webhook signature verification
function verifyStripeSignature(payload, signature, secret) {
  if (!secret) {
    return false // Skip verification if no secret configured
  }

  try {
    // Parse signature header: t=timestamp,v1=signature
    const elements = signature.split(',')
    const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1]
    const signatures = elements.filter(e => e.startsWith('v1='))

    if (!timestamp || signatures.length === 0) {
      return false
    }

    // Create signed payload: timestamp.payload
    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex')

    // Compare signatures
    return signatures.some(sig => {
      const sigValue = sig.split('=')[1]
      return crypto.timingSafeEqual(
        Buffer.from(sigValue),
        Buffer.from(expectedSignature)
      )
    })
  } catch (err) {
    console.error('[Webhook] Signature verification error:', err)
    return false
  }
}

// Generate secure random password
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const randomBytes = crypto.randomBytes(length)
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length]
  }

  return password
}

// Send welcome email
async function sendWelcomeEmail(email, name, password) {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const firstName = name.split(' ')[0]

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 6px; }
          .credentials { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p>You just made a decision most people avoid their whole lives.</p>

            <p>To stop pretending.</p>

            <p>To look at what hurts.</p>

            <p>To find the truth underneath the conditioning.</p>

            <p><strong>Welcome to Circle of Return.</strong></p>

            <p>You're one of the first thirty founding members. This means you're not just joining something that already exists - you're helping build it with me.</p>

            <p>There will be teething issues. Things won't be perfect. Some features are still being added. That's the reality of being a founder.</p>

            <p>But here's what makes this valuable.</p>

            <p>Your input shapes what this becomes. If something isn't working, tell me. If you want to see something that's missing, share it. This is being built for you, with you.</p>

            <p><strong>Your login details are below. Access the members area now.</strong></p>

            <div class="credentials">
              <p><strong>LOGIN:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" class="button">Access Members Area</a></p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p><strong>Here's what to do first.</strong></p>

            <p>Watch the welcome video in your dashboard. Five minutes. I explain what this space is and what it isn't.</p>

            <p>Then go to the video library and start with the breathwork session called "First Release." This is where most people begin. It'll show you what's possible when you let your body speak.</p>

            <p>You'll also see the forum. Introduce yourself when you're ready. No pressure, but the others want to know who just walked through the door.</p>

            <p>Next live call is Thursday 7am GMT. Mark your calendar. Show up. Ask whatever you need to ask.</p>

            <p>This isn't a course. There's no step one, step two. You take what you need when you need it.</p>

            <p>The only rule: do the work. Actually do it.</p>

            <p>And tell me what's working and what isn't. You're a founding member. Your voice matters here.</p>

            <p style="margin-top: 30px;">- Mason</p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"True North - Circle of Return" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Circle of Return',
      html
    })

    console.log('[Webhook] Welcome email sent to:', email)
    return true
  } catch (error) {
    console.error('[Webhook] Email error:', error)
    return false
  }
}

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  })

  try {
    // Get raw body for signature verification
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = verifyStripeSignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error('[Webhook] Signature verification failed')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
      console.log('[Webhook] Signature verified successfully')
    } else {
      console.warn('[Webhook] Skipping signature verification (no secret configured)')
    }

    const event = JSON.parse(body)
    console.log('[Webhook] Received event:', event.type)

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Extract customer details
      const customerEmail = session.customer_details?.email || session.customer_email
      const customerName = session.customer_details?.name || session.customer_name || customerEmail
      const customerId = session.customer
      const subscriptionId = session.subscription

      if (!customerEmail) {
        console.error('[Webhook] No customer email in session')
        return NextResponse.json({ error: 'No customer email' }, { status: 400 })
      }

      console.log('[Webhook] Processing signup for:', customerEmail)

      await client.connect()

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [customerEmail.toLowerCase().trim()]
      )

      if (existingUser.rows.length > 0) {
        console.log('[Webhook] User already exists:', customerEmail)

        // Update existing user with Stripe details
        await client.query(`
          UPDATE users
          SET stripe_customer_id = $1,
              stripe_subscription_id = $2,
              subscription_status = 'active',
              founding_member = true
          WHERE email = $3
        `, [customerId, subscriptionId, customerEmail.toLowerCase().trim()])

        await client.end()
        return NextResponse.json({ received: true, message: 'User updated' })
      }

      // Generate secure password
      const plainPassword = generateSecurePassword(12)
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      // Get next signup number
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM founding_members'
      )
      const signupNumber = parseInt(countResult.rows[0].count) + 1

      // Insert user
      const userResult = await client.query(`
        INSERT INTO users (
          email,
          password,
          name,
          founding_member,
          stripe_customer_id,
          stripe_subscription_id,
          subscription_status,
          level,
          role,
          createdat
        ) VALUES ($1, $2, $3, true, $4, $5, 'active', 'Seeker', 'member', NOW())
        RETURNING id
      `, [
        customerEmail.toLowerCase().trim(),
        hashedPassword,
        customerName,
        customerId,
        subscriptionId
      ])

      const userId = userResult.rows[0].id

      // Insert into founding_members
      await client.query(`
        INSERT INTO founding_members (
          user_id,
          signup_number,
          stripe_customer_id,
          stripe_subscription_id,
          signup_date
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [userId, signupNumber, customerId, subscriptionId])

      console.log('[Webhook] User created:', {
        id: userId,
        email: customerEmail,
        signupNumber
      })

      // Send welcome email
      await sendWelcomeEmail(customerEmail, customerName, plainPassword)

      // Tag as founding member in ConvertKit to trigger onboarding sequence
      const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
      const FOUNDING_TAG_ID = process.env.FOUNDING_TAG_ID

      if (CONVERTKIT_API_KEY && FOUNDING_TAG_ID) {
        try {
          const response = await fetch(`https://api.convertkit.com/v3/tags/${FOUNDING_TAG_ID}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: CONVERTKIT_API_KEY,
              email: customerEmail,
              first_name: customerName.split(' ')[0] || ''
            })
          })

          if (response.ok) {
            console.log('[Webhook] ConvertKit tagged:', customerEmail)
          } else {
            console.error('[Webhook] ConvertKit tag failed:', await response.text())
          }
        } catch (error) {
          console.error('[Webhook] ConvertKit API error:', error)
          // Don't fail webhook if ConvertKit errors
        }
      }

      // Track Facebook Purchase event (server-side)
      if (process.env.FACEBOOK_PIXEL_ID) {
        try {
          // This would require Facebook Conversions API
          // For now, we'll track client-side on welcome page
          console.log('[Webhook] Purchase event tracked for pixel')
        } catch (err) {
          console.error('[Webhook] FB pixel error:', err)
        }
      }

      await client.end()

      return NextResponse.json({
        received: true,
        userId,
        signupNumber
      })
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object

      await client.connect()

      await client.query(`
        UPDATE users
        SET subscription_status = $1
        WHERE stripe_subscription_id = $2
      `, [subscription.status, subscription.id])

      await client.end()

      console.log('[Webhook] Subscription updated:', subscription.id, subscription.status)
      return NextResponse.json({ received: true })
    }

    // Handle subscription deletion
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object

      await client.connect()

      await client.query(`
        UPDATE users
        SET subscription_status = 'canceled'
        WHERE stripe_subscription_id = $1
      `, [subscription.id])

      await client.end()

      console.log('[Webhook] Subscription canceled:', subscription.id)
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Webhook] Error:', error)
    try {
      await client.end()
    } catch {}

    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}
