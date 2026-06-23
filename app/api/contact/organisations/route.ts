import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { name, organisation, email, serviceInterest, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: 'KYN <kyn@yourtruenorth.me>',
      to: 'mason@yourtruenorth.me',
      subject: `Organisations enquiry from ${name}${organisation ? ` — ${organisation}` : ''}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #fafaf8;">
          <h2 style="color: #2d6a4f; font-size: 20px; margin-bottom: 24px;">New Organisations Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #555; font-size: 14px; width: 140px;">Name</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${name}</td></tr>
            ${organisation ? `<tr><td style="padding: 8px 0; color: #555; font-size: 14px;">Organisation</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${organisation}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #555; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #111; font-size: 14px;"><a href="mailto:${email}" style="color: #2d6a4f;">${email}</a></td></tr>
            ${serviceInterest ? `<tr><td style="padding: 8px 0; color: #555; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${serviceInterest}</td></tr>` : ''}
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #fff; border-left: 3px solid #2d6a4f; border-radius: 4px;">
            <p style="color: #555; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
            <p style="color: #111; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
      text: `New Organisations Enquiry\n\nName: ${name}\n${organisation ? `Organisation: ${organisation}\n` : ''}Email: ${email}\n${serviceInterest ? `Service: ${serviceInterest}\n` : ''}\nMessage:\n${message}`,
    })

    console.log('[Organisations Contact] Email sent:', result)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Organisations Contact] Error sending email:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
