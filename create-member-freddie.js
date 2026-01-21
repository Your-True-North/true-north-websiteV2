require('dotenv').config()
const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const { Resend } = require('resend')

async function createMember() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Generate secure random password (12 chars, letters + numbers)
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const password = generatePassword()
    console.log('Generated password:', password)

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully')

    // Insert user into database
    const email = 'freddienorwich@gmail.com'
    const name = 'Freddie Norwich'
    const role = 'member'
    const level = 'founding'
    const stripeSubscriptionId = 'manual_subscription_freddie'
    const stripePriceId = 'price_1SN63oIEGgnmE0KKEM0Ihkvt'

    const insertQuery = `
      INSERT INTO users (email, name, password, role, level, stripe_subscription_id, stripe_price_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, email, name, role, level
    `

    const result = await client.query(insertQuery, [
      email,
      name,
      hashedPassword,
      role,
      level,
      stripeSubscriptionId,
      stripePriceId
    ])

    console.log('User created successfully:', result.rows[0])

    // Send welcome email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #9bc4b8;">Welcome to Circle of Return, ${name}!</h1>

        <p>You're officially a <strong>Founding Member</strong> of The Circle of Return.</p>

        <p>Your account has been created with the following details:</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          <p><strong>Membership Level:</strong> Founding Member - £25/month FIXED</p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Visit <a href="https://yourtruenorth.me/login">yourtruenorth.me/login</a></li>
          <li>Log in with your email and the temporary password above</li>
          <li>You'll be prompted to change your password on first login</li>
        </ol>

        <p>Welcome to the journey. This is where the real work begins.</p>

        <p style="margin-top: 30px;">
          <strong>Mason</strong><br>
          Founder, Circle of Return
        </p>
      </div>
    `

    const emailResult = await resend.emails.send({
      from: 'thecor@yourtruenorth.me',
      to: email,
      subject: 'Welcome to Circle of Return - Your Account is Ready',
      html: emailContent
    })

    console.log('Welcome email sent successfully:', emailResult)
    console.log('\n=== SUMMARY ===')
    console.log('Email:', email)
    console.log('Name:', name)
    console.log('Password:', password)
    console.log('Role:', role)
    console.log('Level:', level)
    console.log('Stripe Price ID:', stripePriceId)

  } catch (error) {
    console.error('Error creating member:', error)
    throw error
  } finally {
    await client.end()
  }
}

createMember()
