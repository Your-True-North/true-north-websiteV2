const { Resend } = require('resend');
require('dotenv').config({ path: '.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'Circle of Return <CoR@yourtruenorth.me>',
  to: 'dysonroberts@icloud.com',
  subject: "You're in. Here's where to start.",
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <h1 style="margin: 0; color: #111111; font-size: 28px; font-weight: 600;">Welcome to Circle of Return</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.7;">Your account is now live. Your login details are below — keep them somewhere safe.</p>
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.7;">The work begins the moment you log in.</p>
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.7;">Start with the <strong>Start Here</strong> videos. It will give you context, explain how this space runs, and set the standard for how we operate.</p>
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.7;">After that, head into the community and introduce yourself. Share where you are right now and what brought you here. You don't need to overthink it, just be honest.</p>
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.7;">If it feels weird, that's normal. Most men aren't used to stepping into a space like this, but that won't last. The feeling will be replaced with clarity, direction, and real conversations that actually help move you forward.</p>
              <p style="margin: 0 0 32px; color: #333333; font-size: 16px; line-height: 1.7;">It's important to acknowledge that you made a deliberate decision today. Well done and thank you.</p>
              <p style="margin: 0 0 32px; color: #333333; font-size: 16px; line-height: 1.7; font-style: italic;">Now log in. We begin the journey of self-discovery from here.</p>
              <p style="margin: 0 0 32px; color: #111111; font-size: 16px; font-weight: 500;">— True</p>
              <table role="presentation" style="width: 100%; background: #f8f8f8; border-radius: 6px; margin: 32px 0;">
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 20px; color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</p>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Email</p>
                          <p style="margin: 4px 0 0; color: #111111; font-size: 16px; font-weight: 500;">dysonroberts@icloud.com</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Password</p>
                          <p style="margin: 4px 0 0; color: #111111; font-size: 16px; font-weight: 500; font-family: Courier New, monospace;">TestPassword123!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://yourtruenorth.me/auth/login" style="display: inline-block; padding: 16px 48px; background: #9bc4b8; color: #111111; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Log In to Circle of Return</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; background: #f8f8f8; border-left: 3px solid #9bc4b8; margin: 32px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;"><strong>Important:</strong> Please change your password after your first login for security.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #f0f0f0; background: #fafafa; border-radius: 0 0 6px 6px;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">Circle of Return · True North</p>
              <p style="margin: 0; color: #999999; font-size: 12px;">You're receiving this because you joined Circle of Return</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}).then(r => console.log('Sent:', JSON.stringify(r))).catch(e => console.error('Error:', e));
