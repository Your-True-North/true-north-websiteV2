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
    console.log('[Resend] Preparing to send email...');
    console.log('[Resend] From:', process.env.EMAIL_FROM || 'thecor@yourtruenorth.me');
    console.log('[Resend] To:', to);
    console.log('[Resend] Subject:', subject);
    console.log('[Resend] API Key present:', !!process.env.RESEND_API_KEY);

    const fromAddress = process.env.EMAIL_FROM || 'thecor@yourtruenorth.me';
    const fromFormatted = fromAddress.includes('<') ? fromAddress : `Circle of Return <${fromAddress}>`;

    const result = await resend.emails.send({
      from: fromFormatted,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('[Resend] Email sent successfully to', to);
    console.log('[Resend] Result:', JSON.stringify(result));
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Resend] Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      name: error.name,
      error: error
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
