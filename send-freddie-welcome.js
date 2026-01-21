require('dotenv').config()
const { Resend } = require('resend')

async function sendWelcomeEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const email = 'freddienorwich@gmail.com'
  const name = 'Freddie Norwich'
  const password = '24qtWQ3Vj8LL'

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

  try {
    const result = await resend.emails.send({
      from: 'thecor@yourtruenorth.me',
      to: email,
      subject: 'Welcome to Circle of Return - Your Account is Ready',
      html: emailContent
    })

    console.log('Welcome email sent successfully!')
    console.log('Email ID:', result.id)
    console.log('To:', email)
    console.log('Password included:', password)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

sendWelcomeEmail()
