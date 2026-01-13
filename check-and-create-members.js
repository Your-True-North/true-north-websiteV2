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

// Generate CUID (compatible with Prisma's default)
function generateCuid() {
  const timestamp = Date.now().toString(36)
  const randomPart = crypto.randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').substring(0, 12)
  return `c${timestamp}${randomPart}`
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

async function checkAndCreateMembers() {
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

  console.log('\n=== Checking Database and Creating Members ===\n')

  const results = []

  try {
    for (const member of members) {
      console.log(`\nProcessing: ${member.name} (${member.email})`)

      // Check if user exists
      const checkResult = await client.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [member.email]
      )

      if (checkResult.rows.length > 0) {
        console.log(`  ⚠️  User already exists in database`)
        console.log(`  → Deleting existing user to recreate with new password...`)

        // Delete existing user
        await client.query('DELETE FROM users WHERE email = $1', [member.email])
        console.log(`  ✓ Existing user deleted`)
      }

      // Generate new password
      const password = generateSecurePassword(12)
      console.log(`  ✓ Generated new password`)

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      console.log(`  ✓ Password hashed`)

      // Create user
      const userId = generateCuid()
      const now = new Date()

      const insertResult = await client.query(
        `INSERT INTO users (id, email, name, password, role, level, "isActive", "joinDate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, email, name`,
        [userId, member.email, member.name, hashedPassword, 'member', 'founding', true, now, now, now]
      )

      console.log(`  ✓ User created in database (ID: ${insertResult.rows[0].id})`)

      // Send welcome email
      const emailResult = await sendWelcomeEmail(member.email, member.name, password, resend)
      console.log(`  ✓ Welcome email sent (ID: ${emailResult.id})`)

      results.push({
        name: member.name,
        email: member.email,
        password: password,
        emailId: emailResult.id,
        userId: insertResult.rows[0].id
      })
    }

    // Summary report
    console.log('\n\n=== SUMMARY ===\n')
    console.log('User Created: YES')
    console.log('Email Sent: YES\n')

    results.forEach(result => {
      console.log(`${result.name}:`)
      console.log(`  Email: ${result.email}`)
      console.log(`  Password: ${result.password}`)
      console.log(`  User ID: ${result.userId}`)
      console.log(`  Email ID: ${result.emailId}`)
      console.log()
    })

    console.log('Login URL: https://yourtruenorth.me/auth/login')
    console.log('\n✅ All accounts created and welcome emails sent!\n')

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
checkAndCreateMembers()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  })
