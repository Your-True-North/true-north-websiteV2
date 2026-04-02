import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Pool } = pg

const resend = new Resend('re_52udxHHg_BdqD67Rn5xMaNT5dujCfY7kW')
const pool = new Pool({ connectionString: 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway' })

const email = 'a.p.wise@gmail.com'
const firstName = 'Adam'
const FROM_EMAIL = 'Mason <mason@yourtruenorth.me>'
const PATTERN_AUDIT_URL = 'https://yourtruenorth.me/library/pattern-audit'

function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$'
  let pwd = ''
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

async function run() {
  // 1. Create account
  const password = generatePassword()
  const hashed = await bcrypt.hash(password, 10)
  const id = `cor_adam_wise_${Date.now()}`

  const result = await pool.query(
    `INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'member', true, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET "isActive" = true, "updatedAt" = NOW()
     RETURNING (xmax = 0) AS inserted`,
    [id, email, 'Adam Wise', hashed]
  )

  const wasInserted = result.rows[0]?.inserted
  console.log(wasInserted ? '✅ Account created' : '✅ Account already existed — reactivated')

  // 2. Send CoR welcome email
  const welcome = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "You're in — here's how to access the Circle",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Brother, you're in.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Your founding membership is confirmed and your place in the Circle is secured.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 8px;">Log in here: <a href="https://yourtruenorth.me/auth/login" style="color: #9bc4b8;">yourtruenorth.me/auth/login</a></p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 4px;">Email: ${email}</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">Password: <strong>${password}</strong></p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">The Circle comes alive on April 10th. Before then, log in, explore the platform and get familiar with the space. There is already content waiting for you and more will be added as we build this together.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">You will hear from me before the 10th with everything you need to know.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 8px;">You made the right call.</p>
        <p style="font-size: 15px; line-height: 1.7;">True North</p>
      </div>
    `,
  })
  console.log('✅ Welcome email sent:', welcome.data?.id || welcome.error)

  // 3. Send Pattern Audit email
  const audit = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your Pattern Audit is ready',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Hey ${firstName},</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Your Pattern Audit is ready.</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">This is where we start — before the first session. Watch the video, then work through the workbook honestly. The more you put in here, the more precise we can be when we meet.</p>
        <a href="${PATTERN_AUDIT_URL}" style="display: inline-block; padding: 14px 28px; background: #9bc4b8; color: #0a0a0a; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 15px;">Access the Pattern Audit</a>
        <p style="font-size: 13px; color: #666; margin-top: 32px; line-height: 1.6;">Take your time with it. There is no rush.</p>
        <p style="font-size: 13px; color: #666; margin-top: 8px;">Mason</p>
      </div>
    `,
  })
  console.log('✅ Pattern Audit email sent:', audit.data?.id || audit.error)

  await pool.end()
}

run().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
