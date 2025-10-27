import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendEmail({ to, subject, html, text }) {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'cor@yourtruenorth.me',
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error.response?.body || error);
    throw new Error('Failed to send email');
  }
}
