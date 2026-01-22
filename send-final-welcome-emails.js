// Send welcome emails to Alex and Theodoros
require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const members = [
  {
    email: 'freddienorwich@gmail.com',
    name: 'Freddie Norwich',
    password: '24qtWQ3Vj8LL'
  }
]

async function sendWelcomeEmails() {
  console.log('\n=== Sending Welcome Emails ===\n')

  for (const member of members) {
    console.log(`Sending to: ${member.name} (${member.email})`)

    try {
      const result = await resend.emails.send({
        from: 'Circle of Return <thecor@yourtruenorth.me>',
        to: member.email,
        subject: 'Welcome to Circle of Return',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0b; color: #fff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #9bc4b8; font-weight: 300; letter-spacing: 0.1em;">Circle of Return</h1>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 30px;">
              <h2 style="color: #fff; font-weight: 300; margin-bottom: 20px;">Welcome ${member.name.split(' ')[0]}!</h2>

              <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 20px;">
                Your Circle of Return account is ready.
              </p>

              <div style="background: rgba(155, 196, 184, 0.15); border: 1px solid rgba(155, 196, 184, 0.4); border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 10px;"><strong>Email:</strong> ${member.email}</p>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 10px;"><strong>Password:</strong></p>
                <code style="font-size: 1.5rem; color: #9bc4b8; font-weight: 600; letter-spacing: 0.05em;">${member.password}</code>
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
        text: `Welcome ${member.name.split(' ')[0]}!

Your Circle of Return account is ready.

Login: https://yourtruenorth.me/auth/login
Email: ${member.email}
Password: ${member.password}

See you inside,
True`
      })

      console.log(`  ✅ Email sent! ID: ${result.data?.id || result.id}`)

    } catch (error) {
      console.error(`  ❌ Failed:`, error.message)
    }

    console.log()
  }

  console.log('=== Done ===\n')
}

sendWelcomeEmails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
