import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, experience, calling, deposit } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'True North <navigate@yourtruenorth.me>',
      to: 'navigate@yourtruenorth.me',
      replyTo: email,
      subject: `Retreat Interest: ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f5f0e8;color:#1e1e1a;">
          <h2 style="font-size:22px;margin-bottom:24px;letter-spacing:1px;">New Retreat Application</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;color:#6b6b64;width:180px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;color:#6b6b64;">Email</td><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;">${email}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;color:#6b6b64;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;">${phone || '—'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;color:#6b6b64;">Experience Level</td><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;">${experience || '—'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;color:#6b6b64;">Deposit Ready</td><td style="padding:10px 0;border-bottom:1px solid #d8d0c4;">${deposit || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;">
            <p style="color:#6b6b64;margin-bottom:8px;">What's calling them to this retreat:</p>
            <p style="background:#ede8de;padding:16px;border-radius:4px;line-height:1.7;">${calling || '—'}</p>
          </div>
        </div>
      `,
    })

    await resend.emails.send({
      from: 'True North <navigate@yourtruenorth.me>',
      to: email,
      subject: 'Your interest has been received: Psilocybin Weekend Retreat',
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f5f0e8;color:#1e1e1a;">
          <p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#8aaa96;margin-bottom:24px;">True North</p>
          <h2 style="font-size:24px;font-weight:normal;line-height:1.4;margin-bottom:24px;">Thank you, ${name}.</h2>
          <p style="line-height:1.8;margin-bottom:16px;color:#3c3c38;">Your interest has been received. I've read what you wrote, and I appreciate you sharing it.</p>
          <p style="line-height:1.8;margin-bottom:16px;color:#3c3c38;">Preliminary dates for the retreat are Thursday 4th June through to Sunday 7th June 2026, subject to numbers confirming. I'll be in touch once the venue is locked in and at that point, if you'd like to secure your space, I'll reach out with next steps.</p>
          <p style="line-height:1.8;margin-bottom:32px;color:#3c3c38;">In the meantime, if anything comes up or you have questions, just reply to this email.</p>
          <p style="line-height:1.8;color:#3c3c38;">Mason</p>
          <div style="margin-top:48px;padding-top:24px;border-top:1px solid #d8d0c4;">
            <p style="font-size:12px;color:#9a9a8a;">True North · yourtruenorth.me</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Retreat interest submission error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
