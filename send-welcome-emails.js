// Load environment variables from .env file if it exists
try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { Resend } = require('resend')

// Validate environment variables
if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
  console.error('\n❌ ERROR: DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required')
  process.exit(1)
}

if (!process.env.RESEND_API_KEY) {
  console.error('\n❌ ERROR: RESEND_API_KEY environment variable is required')
  process.exit(1)
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Generate a secure random password (12 characters, letters + numbers)
function generateSecurePassword(length = 12) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  const randomBytes = crypto.randomBytes(length)

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length]
  }

  return password
}

async function sendWelcomeEmail(email, name, password, resend) {
  const firstName = name.split(' ')[0]

  return await resend.emails.send({
    from: 'Circle of Return <cor@thecor.yourtruenorth.me>',
    to: email,
    subject: 'Welcome to Circle of Return',
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #9bc4b8;
              margin-bottom: 20px;
            }
            .credentials {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin: 25px 0;
              border-left: 4px solid #9bc4b8;
            }
            .credential-item {
              margin: 10px 0;
              font-family: monospace;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 30px;
              background: #9bc4b8;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .signature {
              margin-top: 30px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome ${firstName}!</h1>

            <p>Your Circle of Return account is ready.</p>

            <div class="credentials">
              <div class="credential-item">
                <span class="label">Login:</span> <a href="https://yourtruenorth.me/auth/login">https://yourtruenorth.me/auth/login</a>
              </div>
              <div class="credential-item">
                <span class="label">Email:</span> ${email}
              </div>
              <div class="credential-item">
                <span class="label">Password:</span> ${password}
              </div>
            </div>

            <a href="https://yourtruenorth.me/auth/login" class="cta-button">Log In Now</a>

            <p class="signature">
              See you inside,<br>
              <strong>True</strong>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Welcome ${firstName}!

Your Circle of Return account is ready.

Login: https://yourtruenorth.me/auth/login
Email: ${email}
Password: ${password}

See you inside,
True`
  })
}

async function resetPasswordAndSendEmail() {
  const members = [
    {
      email: 'alexantoniou29@gmail.com',
      name: 'Alex Antoniou'
    },
    {
      email: 'leadbyexample76@outlook.com',
      name: 'Theodoros'
    }
  ]

  const client = await pool.connect()
  const resend = new Resend(process.env.RESEND_API_KEY)

  console.log('\n=== Resetting Passwords and Sending Welcome Emails ===\n')

  const results = []

  try {
    for (const member of members) {
      console.log(`Processing: ${member.name} (${member.email})`)

      // Generate new password
      const password = generateSecurePassword(12)
      console.log(`  ✓ Generated new password`)

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      console.log(`  ✓ Password hashed`)

      // Update password in database
      await client.query(
        `UPDATE users SET password = $1, "updatedAt" = NOW() WHERE email = $2`,
        [hashedPassword, member.email]
      )
      console.log(`  ✓ Password updated in database`)

      // Send welcome email
      const emailResult = await sendWelcomeEmail(member.email, member.name, password, resend)
      console.log(`  ✓ Welcome email sent (ID: ${emailResult.id})`)

      results.push({
        name: member.name,
        email: member.email,
        password: password,
        emailId: emailResult.id
      })

      console.log()
    }

    // Summary report
    console.log('=== SUMMARY ===\n')

    results.forEach(result => {
      console.log(`${result.name}:`)
      console.log(`  Email: ${result.email}`)
      console.log(`  Password: ${result.password}`)
      console.log(`  Email ID: ${result.emailId}`)
      console.log()
    })

    console.log('Login URL: https://yourtruenorth.me/auth/login')
    console.log('\n✅ All accounts updated and welcome emails sent!\n')

    return { success: true, results }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the script
resetPasswordAndSendEmail()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  })
