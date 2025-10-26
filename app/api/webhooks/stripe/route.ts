const userService = { 
  async createUser(userData) { 
    const user = { id: Date.now(), ...userData, createdAt: new Date() }; 
    console.log("Created user:", user); 
    return user; 
  }, 
  async findUserByEmail(email) { return null; } 
};
const activityService = { 
  async createActivity(activityData) { 
    const activity = { id: Date.now(), ...activityData, createdAt: new Date() }; 
    console.log("Created activity:", activity); 
    return activity; 
  }, 
  async logActivity() { return {}; } 
};
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object
      const customer = await stripe.customers.retrieve(subscription.customer)
      
      const userData = {
        email: customer.email,
        name: customer.name || customer.email.split('@')[0],
        stripeCustomerId: customer.id,
        subscriptionId: subscription.id,
        level: 'newcomer',
        isActive: true
      }

      const user = await userService.createUser(userData)
      
      await activityService.createActivity({
        type: 'member_joined',
        title: 'New Member Joined',
        description: `${user.name} joined the Circle of Return`,
        userId: user.id
      })

      console.log('User account created:', { id: user.id, email: user.email, name: user.name })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
