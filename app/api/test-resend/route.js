import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request) {
  try {
    // Log environment variables (safely)
    const apiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM

    console.log('[Test Resend] API Key exists:', !!apiKey)
    console.log('[Test Resend] API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET')
    console.log('[Test Resend] EMAIL_FROM:', emailFrom)

    if (!apiKey) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not set',
        env: {
          apiKeySet: false,
          emailFrom: emailFrom || 'NOT SET'
        }
      }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    const fromAddress = emailFrom || 'thecor@yourtruenorth.me'
    const fromFormatted = fromAddress.includes('<') ? fromAddress : `Circle of Return <${fromAddress}>`

    console.log('[Test Resend] Attempting to send test email...')
    console.log('[Test Resend] From:', fromFormatted)
    console.log('[Test Resend] To: thecor@yourtruenorth.me')

    const result = await resend.emails.send({
      from: fromFormatted,
      to: 'thecor@yourtruenorth.me',
      subject: 'Test Email from Resend - ' + new Date().toISOString(),
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
              h1 { color: #9bc4b8; }
              .info { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; }
              code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎯 Resend Test Email</h1>
              <p>This is a test email from your True North website to verify Resend integration.</p>

              <div class="info">
                <strong>Test Details:</strong><br>
                Time: ${new Date().toLocaleString()}<br>
                From: <code>${fromFormatted}</code><br>
                API Key (first 10): <code>${apiKey.substring(0, 10)}...</code>
              </div>

              <p><strong>If you received this email:</strong></p>
              <ul>
                <li>✅ Resend API key is working</li>
                <li>✅ Domain verification is correct</li>
                <li>✅ Email delivery is functional</li>
              </ul>

              <p><strong>Next step:</strong> Check why password reset emails aren't arriving - likely a different code path or configuration issue.</p>
            </div>
          </body>
        </html>
      `,
      text: `Resend Test Email - ${new Date().toISOString()}\n\nThis is a test email from your True North website.\n\nIf you received this, Resend is working correctly.`
    })

    console.log('[Test Resend] Email sent successfully!')
    console.log('[Test Resend] Result:', JSON.stringify(result))

    return NextResponse.json({
      success: true,
      message: 'Test email sent to thecor@yourtruenorth.me',
      result: result,
      env: {
        apiKeySet: true,
        apiKeyPreview: apiKey.substring(0, 10) + '...',
        emailFrom: fromFormatted
      }
    })

  } catch (error) {
    console.error('[Test Resend] Error:', error)
    console.error('[Test Resend] Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      name: error.name,
      stack: error.stack
    })

    return NextResponse.json({
      error: 'Failed to send test email',
      details: error.message,
      errorName: error.name,
      statusCode: error.statusCode
    }, { status: 500 })
  }
}
