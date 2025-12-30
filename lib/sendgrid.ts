import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'cor@yourtruenorth.me',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log(`Email sent successfully to ${to}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Resend Error:', error);
    throw new Error('Failed to send email');
  }
}
