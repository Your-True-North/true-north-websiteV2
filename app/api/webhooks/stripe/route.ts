// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { userService, activityService } from '../../../../lib/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Generate secure random password
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Create welcome email template
function createWelcomeEmail(name, email, password) {
  return {
    from: process.env.FROM_EMAIL || 'mason@truenorth.com',
    to: email,
    subject: 'Welcome to Your Transformation Journey - Circle of Return Access',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome to Circle of Return</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #9bc4b8, #7fb069); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; color: #000;">★</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 2px;">TRUE NORTH</h1>
              <p style="margin: 10px 0 0; color: #9bc4b8; font-size: 16px;">Circle of Return</p>
            </div>

            <!-- Welcome Message -->
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #9bc4b8;">
              <h2 style="margin: 0 0 20px; color: #9bc4b8; font-size: 24px;">Welcome to your journey, ${name}</h2>
              <p style="margin: 0 0 15px; line-height: 1.6; font-size: 16px;">
                You've taken the first step toward authentic transformation. Where you are now does not have to be where you end up.
              </p>
              <p style="margin: 0 0 15px; line-height: 1.6; font-size: 16px;">
                Your Circle of Return membership gives you access to a sacred container for growth, healing, and return to your true self.
              </p>
              <p style="margin: 0; line-height: 1.6; font-size: 16px; color: #d4af37;">
                "The truth is hard to hear, but we already knew it."
              </p>
            </div>

            <!-- Login Credentials -->
            <div style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #d4af37;">
              <h3 style="margin: 0 0 20px; color: #d4af37; font-size: 20px;">Your Journey Access</h3>
              <div style="margin-bottom: 15px;">
                <strong style="color: #9bc4b8;">Login URL:</strong><br>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: #ffffff; text-decoration: none; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 5px;">
                  ${process.env.NEXT_PUBLIC_SITE_URL}/login
                </a>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #9bc4b8;">Email:</strong><br>
                <code style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 5px; font-family: monospace;">${email}</code>
              </div>
              <div style="margin-bottom: 20px;">
                <strong style="color: #9bc4b8;">Password:</strong><br>
                <code style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 5px; font-family: monospace; font-weight: bold;">${password}</code>
              </div>
              <p style="margin: 0; font-size: 14px; color: #ffffff80;">
                Save these credentials safely. You can change your password after logging in.
              </p>
            </div>

            <!-- Support -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 15px; color: #ffffff80;">Need support on your journey?</p>
              <a href="https://wa.me/447449052909?text=Hi Mason, I just joined Circle of Return and need help with my account access." 
                 style="display: inline-block; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-bottom: 20px;">
                WhatsApp Support
              </a>
              <p style="margin: 0; color: #ffffff60; font-size: 14px;">
                Remember: "No one can do the pushups for you, my friend"<br>
                Your transformation starts with your first login.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Webhook event type:', event.type)

    // Handle successful subscription creation
    if (event.type === 'customer.subscription.created' || event.type === 'invoice.payment_succeeded') {
      const subscription = event.data.object
      
      // Only process if this is for Circle of Return membership
      const isCircleMembership = subscription.items?.data.some(
        item => item.price.id === process.env.STRIPE_CIRCLE_PRICE_ID
      )

      if (!isCircleMembership && event.type === 'invoice.payment_succeeded') {
        // Check if it's the first payment for Circle membership
        const invoice = event.data.object
        if (invoice.subscription && invoice.billing_reason === 'subscription_create') {
          // Get subscription details to check price
          const subDetails = await stripe.subscriptions.retrieve(invoice.subscription)
          const hasCirclePrice = subDetails.items?.data.some(
            item => item.price.id === process.env.STRIPE_CIRCLE_PRICE_ID
          )
          if (!hasCirclePrice) return NextResponse.json({ received: true })
        } else {
          return NextResponse.json({ received: true })
        }
      }

      // Get customer details
      const customerId = subscription.customer || event.data.object.customer
      const customer = await stripe.customers.retrieve(customerId)
      
      if (!customer.email) {
        console.error('No customer email found')
        return NextResponse.json({ error: 'No customer email' }, { status: 400 })
      }

      // Generate secure credentials
      const password = generatePassword()
      const hashedPassword = await bcrypt.hash(password, 12)
      const joinDate = new Date().toISOString()

      // Create user account in database
      const userData = {
        email: customer.email,
        name: customer.name || customer.email.split('@')[0],
        password: hashedPassword,
        role: 'member',
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id || event.data.object.subscription,
        joinDate: joinDate,
        level: 'newcomer',
        isActive: true
      }

      // Save to database using Prisma
      const user = await userService.createUser(userData)
      
      // Add welcome activity
      await activityService.createActivity({
        type: 'member_joined',
        title: 'New Member Joined',
        description: `${user.name} joined the Circle of Return`,
        userId: user.id
      })

      console.log('User account created:', { id: user.id, email: user.email, name: user.name })

      // Send welcome email with login credentials
      try {
        const emailOptions = createWelcomeEmail(
          userData.name,
          customer.email,
          password
        )
        
        await transporter.sendMail(emailOptions)
        console.log('Welcome email sent to:', customer.email)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the webhook for email errors
      }

      // Add to ConvertKit with Circle member tag (optional)
      if (process.env.CONVERTKIT_API_KEY) {
        try {
          const response = await fetch('https://api.convertkit.com/v3/forms/THE_ECO_SYSTEM_ID/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_key: process.env.CONVERTKIT_API_KEY,
              email: customer.email,
              name: userData.name,
              tags: ['THE_CoR_TAG_ID']
            })
          })
          
          if (response.ok) {
            console.log('Added to ConvertKit successfully')
          }
        } catch (ckError) {
          console.error('ConvertKit error:', ckError)
        }
      }

      return NextResponse.json({ 
        received: true, 
        message: 'Account created successfully',
        user: { email: customer.email, name: userData.name }
      })
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      
      // Deactivate user account
      await userService.deactivateUser(subscription.id)
      console.log('Deactivating subscription:', subscription.id)
      
      return NextResponse.json({ received: true, message: 'Subscription cancelled' })
    }

    // Return success for other webhook types
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}