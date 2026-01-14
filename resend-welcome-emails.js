// Load environment variables from .env file if it exists
try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { Pool } = require('pg')
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

async function sendWelcomeEmail(email, name, password, resend) {
  const firstName = name.split(' ')[0]

  return await resend.emails.send({
    from: 'Circle of Return <cor@yourtruenorth.me>',
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

async function resendWelcomeEmails() {
  const members = [
    {
      email: 'alexantoniou29@gmail.com',
      name: 'Alex Antoniou',
      password: 'eTMjpf2QQUvu'
    },
    {
      email: 'leadbyexample76@outlook.com',
      name: 'Theodoros',
      password: 'RM3dkuzBnZjr'
    }
  ]

  const client = await pool.connect()
  const resend = new Resend(process.env.RESEND_API_KEY)

  console.log('\n=== Sending Welcome Emails ===\n')
  console.log('From: Circle of Return <cor@yourtruenorth.me>\n')

  const results = []

  try {
    for (const member of members) {
      console.log(`Sending to: ${member.name} (${member.email})`)

      try {
        const emailResult = await sendWelcomeEmail(member.email, member.name, member.password, resend)

        if (emailResult.error) {
          console.log(`  ❌ Error: ${emailResult.error.message}`)
          results.push({
            name: member.name,
            email: member.email,
            success: false,
            error: emailResult.error.message
          })
        } else {
          console.log(`  ✓ Email sent (ID: ${emailResult.data?.id || emailResult.id})`)
          results.push({
            name: member.name,
            email: member.email,
            password: member.password,
            success: true,
            emailId: emailResult.data?.id || emailResult.id
          })
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`)
        results.push({
          name: member.name,
          email: member.email,
          success: false,
          error: error.message
        })
      }

      console.log()
    }

    // Summary report
    console.log('=== SUMMARY ===\n')

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`Emails sent: ${successful.length}/${results.length}`)
    console.log()

    if (successful.length > 0) {
      console.log('✅ Successful:')
      successful.forEach(result => {
        console.log(`  - ${result.name} (${result.email})`)
        console.log(`    Password: ${result.password}`)
        console.log(`    Email ID: ${result.emailId}`)
      })
      console.log()
    }

    if (failed.length > 0) {
      console.log('❌ Failed:')
      failed.forEach(result => {
        console.log(`  - ${result.name} (${result.email})`)
        console.log(`    Error: ${result.error}`)
      })
      console.log()
    }

    console.log('Login URL: https://yourtruenorth.me/auth/login\n')

    return { success: successful.length === results.length, results }

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
resendWelcomeEmails()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  })
