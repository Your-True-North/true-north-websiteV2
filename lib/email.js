import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Sender for password resets, forum posts and reply notifications.
// Was cor@yourtruenorth.me. Never send from cor@ again.
// NOTE: EMAIL_FROM overrides this. If EMAIL_FROM is set to cor@ in Vercel,
// that wins over this default and must be changed there too.
const DEFAULT_FROM = 'kyn@yourtruenorth.me';

export async function sendEmail({ to, subject, html, text }) {
  try {
    console.log('[Resend] Preparing to send email...');
    console.log('[Resend] From:', process.env.EMAIL_FROM || DEFAULT_FROM);
    console.log('[Resend] To:', to);
    console.log('[Resend] Subject:', subject);
    console.log('[Resend] API Key present:', !!process.env.RESEND_API_KEY);

    const fromAddress = process.env.EMAIL_FROM || DEFAULT_FROM;
    const fromFormatted = fromAddress.includes('<') ? fromAddress : `Know Your North <${fromAddress}>`;

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
  } catch (error) {
    console.error('[Resend] Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      name: error.name,
      error: error
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
