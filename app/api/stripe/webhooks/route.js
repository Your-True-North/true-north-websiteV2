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
    throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  }

  const signedPayload = `${payload}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex')

  // Stripe sends signature as: t=timestamp,v1=signature
  const signatures = signature.split(',').reduce((acc, pair) => {
    const [key, value] = pair.split('=')
    if (key === 'v1') acc.push(value)
    return acc
  }, [])

  return signatures.some(sig => crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expectedSignature)
  ))
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
          .header { background: linear-gradient(135deg, #9bc4b8, #7fb069); padding: 30px; text-align: center; border-radius: 6px 6px 0 0; }
          .header h1 { color: #000; margin: 0; font-size: 28px; font-weight: 300; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 6px 6px; }
          .credentials { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 6px; margin: 20px 0; }
          .credentials strong { color: #9bc4b8; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Circle of Return</h1>
          </div>
          <div class="content">
            <p>${firstName},</p>

            <p>Your transformation begins now.</p>

            <div class="credentials">
              <p><strong>Login Details:</strong></p>
              <p>
                Email: ${email}<br>
                Password: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${password}</code>
              </p>
            </div>

            <p>Access your portal:</p>
            <a href="https://yourtruenorth.me/auth/login" class="button">Login to Your Portal</a>

            <p style="margin-top: 30px;">You're one of the first 30. This is your time.</p>

            <p>What's waiting for you:</p>
            <ul>
              <li>Full video library of breathwork, energy healing, and integration practices</li>
              <li>Live coaching calls with Mason and guest experts</li>
              <li>Community support from men on the same journey</li>
              <li>Lifetime access at £25/month (you locked in the founding price)</li>
            </ul>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              <em>Tip: Change your password after your first login in your account settings.</em>
            </p>

            <p style="margin-top: 30px;">- True North</p>
          </div>
          <div class="footer">
            <p>Circle of Return · True North<br>
            <a href="https://yourtruenorth.me" style="color: #9bc4b8;">yourtruenorth.me</a></p>
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
    if (webhookSecret) {
      try {
        verifyStripeSignature(body, signature, webhookSecret)
      } catch (err) {
        console.error('[Webhook] Signature verification failed:', err)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
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
