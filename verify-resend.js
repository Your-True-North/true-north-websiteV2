// Load environment variables from .env file if it exists
try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { Resend } = require('resend')

// Validate environment variables
if (!process.env.RESEND_API_KEY) {
  console.error('\n❌ ERROR: RESEND_API_KEY environment variable is required')
  process.exit(1)
}

async function verifyResend() {
  console.log('\n=== Resend API Verification ===\n')
  console.log('API Key:', process.env.RESEND_API_KEY.substring(0, 10) + '...')

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Test email send
    console.log('\nTesting email send...')

    const result = await resend.emails.send({
      from: 'Circle of Return <cor@thecor.yourtruenorth.me>',
      to: 'alexantoniou29@gmail.com',
      subject: 'Test Email from Circle of Return',
      text: 'This is a test email to verify Resend integration.'
    })

    console.log('\n✓ Email sent successfully!')
    console.log('Email ID:', result.id)
    console.log('Data:', JSON.stringify(result, null, 2))

  } catch (error) {
    console.error('\n❌ ERROR sending email:')
    console.error('Message:', error.message)
    console.error('Full error:', JSON.stringify(error, null, 2))
  }
}

// Run verification
verifyResend()
  .then(() => {
    console.log('\n✅ Verification complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  })
