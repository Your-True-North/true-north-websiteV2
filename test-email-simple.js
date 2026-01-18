// Simple test using Resend directly
require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendTestEmail() {
  console.log('\n=== Sending Test Email ===')
  console.log('To: masondysonroberts@gmail.com')
  console.log('From:', process.env.EMAIL_FROM || 'thecor@yourtruenorth.me')
  console.log()

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Circle of Return <thecor@yourtruenorth.me>',
      to: 'masondysonroberts@gmail.com',
      subject: 'Test Email - Circle of Return',
      html: '<h1>Test Email</h1><p>If you received this, email is working!</p>',
      text: 'Test Email - If you received this, email is working!'
    })

    console.log('✅ Email sent!')
    console.log('Result:', JSON.stringify(result, null, 2))

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  }
}

sendTestEmail()
