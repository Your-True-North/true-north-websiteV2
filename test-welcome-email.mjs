// Test script to send welcome email to Mason's personal email
import { sendEmail } from './lib/sendgrid.js'

const testMember = {
  email: 'masondysonroberts@gmail.com',
  name: 'Mason',
  password: 'TestPass123'
}

async function sendTestEmail() {
  console.log('\n=== Sending Test Welcome Email ===')
  console.log(`To: ${testMember.email}\n`)

  try {
    await sendEmail({
      to: testMember.email,
      subject: 'Welcome to Circle of Return - TEST',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0b; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9bc4b8; font-weight: 300; letter-spacing: 0.1em;">Circle of Return</h1>
          </div>

          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 30px;">
            <h2 style="color: #fff; font-weight: 300; margin-bottom: 20px;">Welcome ${testMember.name}!</h2>

            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 20px;">
              This is a TEST email. Your Circle of Return account is ready.
            </p>

            <div style="background: rgba(155, 196, 184, 0.15); border: 1px solid rgba(155, 196, 184, 0.4); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 10px;"><strong>Email:</strong> ${testMember.email}</p>
              <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 10px;"><strong>Password:</strong></p>
              <code style="font-size: 1.5rem; color: #9bc4b8; font-weight: 600; letter-spacing: 0.05em;">${testMember.password}</code>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://yourtruenorth.me/auth/login"
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Log In Now
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;">
              See you inside,<br><strong>True</strong>
            </p>
          </div>
        </div>
      `,
      text: `Welcome ${testMember.name}!

This is a TEST email. Your Circle of Return account is ready.

Login: https://yourtruenorth.me/auth/login
Email: ${testMember.email}
Password: ${testMember.password}

See you inside,
True`
    })

    console.log('✅ Test email sent successfully!')
    console.log('\nCheck your inbox at masondysonroberts@gmail.com\n')

  } catch (error) {
    console.error('❌ Failed to send test email:', error.message)
    console.error(error)
  }
}

sendTestEmail()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
